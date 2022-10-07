import sqlite3 from 'sqlite3';

//snapshots das categorias / subcategorias
export function genDailyCategoriesEvo(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Generating categories snapshots...');
  });

  const dataIni = new Date('2022-01-01T00:00:00.000Z')
  dataIni.setMonth(req.body.month - 1)
  dataIni.setFullYear(req.body.year)

  const dataFi = new Date('2022-01-01T00:00:00.000Z')
  dataFi.setMonth(req.body.month)
  dataFi.setFullYear(req.body.year)

  const dataIniMilli = dataIni.getTime();
  const dataFiMilli = dataFi.getTime();

  let categoryList = [];
  let subCategoryList = [];

  let monthlyMovments = [];
  let generatedCategorySnapshots = {};
  let generatedSubCategorySnapshots = {};

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date < ${dataFiMilli} AND date >= ${dataIniMilli}`, (err, row) => { err ? console.error(err.message) : monthlyMovments.push(row) })
      .each(`SELECT * FROM categories WHERE active = 'true' `, (err, row) => { err ? console.error(err.message) : categoryList.push(row.id) })
      .each(`SELECT * FROM subcategories WHERE active = 'true' `, (err, row) => { err ? console.error(err.message) : subCategoryList.push(row.id) })

  })

  db.close((err) => {
    err ? console.error(err.message) : generateSnapshots();
  });

  function generateSnapshots() {

    categoryList.forEach(category => {

      let categorySnapshot = [];

      for (let i = 0; i < req.body.days; i++) {

        let value = 0;
        monthlyMovments.forEach(movement => {

          if ((new Date(movement.date).getDate()) === i + 1 && movement.cat == category) {
            value += movement.value;
          }

        });

        categorySnapshot[i] = value;
      }

      generatedCategorySnapshots[`${category}`] = categorySnapshot;

    });

    console.log('Categories snapshots sucessfully generated.');
    console.log('Generating subcategories snapshots...');

    subCategoryList.forEach(subcategory => {

      let subCategorySnapshot = [];

      for (let i = 0; i < req.body.days; i++) {

        let value = 0;
        monthlyMovments.forEach(movement => {

          if ((new Date(movement.date).getDate()) === i + 1 && movement.subcat == subcategory) {
            value += movement.value;
          }

        });

        subCategorySnapshot[i] = value;
      }

      generatedSubCategorySnapshots[`${subcategory}`] = subCategorySnapshot;

    });

    console.log('Subcategories snapshots sucessfully generated.');
    console.log('Generating dailysum snapshot...');

    let dailySumEvo = Array(Number(req.body.days)).fill(0)
    monthlyMovments.forEach(movement => {
      movement.type === 'expense' ? dailySumEvo[(new Date(movement.date).getDate()) - 1] -= movement.value : dailySumEvo[(new Date(movement.date).getDate()) - 1] += movement.value
    });

    console.log('Dailysum snapshot sucessfully generated.');
    res.send([generatedCategorySnapshots, generatedSubCategorySnapshots, dailySumEvo])

  }
}


// snapshot total acumulado
export function genDailySumAcomEvo(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Generating daily acomul snapshot...');
  });

  const dataIni = new Date('2022-01-01T00:00:00.000Z')
  dataIni.setMonth(req.body.month - 1)
  dataIni.setFullYear(req.body.year)

  const dataFi = new Date('2022-01-01T00:00:00.000Z')
  dataFi.setMonth(req.body.month)
  dataFi.setFullYear(req.body.year)

  const dataIniMilli = dataIni.getTime();
  const dataFiMilli = dataFi.getTime();

  let monthlyMovments = [];
  let initialSum = [];

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date < ${dataFiMilli} AND date >= ${dataIniMilli}`, (err, row) => { err ? console.error(err.message) : monthlyMovments.push(row) })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='income' AND date < ${dataIniMilli - 1}`, (err, row) => { err ? console.error(err.message) : initialSum.push(Object.values(row[0])[0]) })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='expense' AND date < ${dataIniMilli - 1}`, (err, row) => { err ? console.error(err.message) : initialSum.push(Object.values(row[0])[0]) })

  })

  db.close((err) => {
    err ? console.error(err.message) : generateAcomSnapshot();
    console.log('Daily acomul snapshot sucessfully generated.');
  });

  function generateAcomSnapshot() {

    let dailySumAcomEvo = [];
    let initialSumCalculated = 0;

    initialSum.forEach((sum, i) => {
      if (sum !== null) { i === 0 ? initialSumCalculated += sum : initialSumCalculated -= sum }
    });

    for (let i = 0; i < req.body.days; i++) {

      let dailysum = 0;

      if (i === 0) { dailysum += initialSumCalculated }
      if (i !== 0) { dailysum += dailySumAcomEvo[i - 1] }

      monthlyMovments.forEach(movement => { if ((new Date(movement.date).getDate()) === i + 1) { movement.type === 'expense' ? dailysum -= movement.value : dailysum += movement.value } });

      dailySumAcomEvo.push(dailysum);

    }

    res.send(dailySumAcomEvo);

  }

}