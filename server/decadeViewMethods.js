import sqlite3 from 'sqlite3';

export function getMonthlyDetails(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`Fetching ${req.body.day}/${req.body.month}/${req.body.year} details from ${req.body.subcat}...`);
  });

  const dataIni = new Date('2022-01-01T00:00:00.000Z')
  dataIni.setFullYear(req.body.year)

  const dataFi = new Date(dataIni.getTime())
  dataFi.setFullYear(req.body.year+1)

  const dataIniMilli = dataIni.getTime();
  const dataFiMilli = dataFi.getTime()-1;

  let yearlyMovments = [];
  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date >= ${dataIniMilli} AND date <= ${dataFiMilli}`, (err, row) => { err ? console.error(err.message) : yearlyMovments.push(row) })

  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(yearlyMovments)
    console.log('Fetching complete')
  });

}


export function getMonthlySubCatDetails(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`Fetching ${req.body.day}/${req.body.month}/${req.body.year} details from ${req.body.subcat}...`);
  });

  const dataIni = new Date('2022-01-01T00:00:00.000Z')
  dataIni.setFullYear(req.body.year)

  const dataFi = new Date(dataIni.getTime())
  dataFi.setFullYear(req.body.year+1)

  const dataIniMilli = dataIni.getTime();
  const dataFiMilli = dataFi.getTime()-1;

  let yearlyMovments = [];

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date >= ${dataIniMilli} AND date <= ${dataFiMilli} AND subcat=${req.body.subcat}`, (err, row) => { err ? console.error(err.message) : yearlyMovments.push(row) })

  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(yearlyMovments)
    console.log('Fetching complete')
  });

}

export function getMonthlyCatDetails(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`Fetching ${req.body.day}/${req.body.month}/${req.body.year} details from ${req.body.cat}...`);
  });


  const dataIni = new Date('2022-01-01T00:00:00.000Z')
  dataIni.setFullYear(req.body.year)

  const dataFi = new Date(dataIni.getTime())
  dataFi.setFullYear(req.body.year+1)


  const dataIniMilli = dataIni.getTime();
  const dataFiMilli = dataFi.getTime()-1;

  let yearlyMovments = [];

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date >= ${dataIniMilli} AND date <= ${dataFiMilli} AND cat=${req.body.cat}`, (err, row) => { err ? console.error(err.message) : yearlyMovments.push(row) })

  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(yearlyMovments)
    console.log('Fetching complete')
  });

}

//snapshots das categorias / subcategorias
export function genMonthlyCategoriesEvo(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Generating categories snapshots...');
  });

  const dataIni = new Date('2022-01-01T00:00:00.000Z');
  dataIni.setFullYear(req.body.yearini)

  const dataFi = new Date('2022-01-01T00:00:00.000Z');
  dataFi.setFullYear(req.body.yearfini)

  const dataIniMilli = dataIni.getTime();
  const dataFiMilli = dataFi.getTime()-1;

  let categoryList = [];
  let subCategoryList = [];

  let decadeMovments = [];
  let generatedCategorySnapshots = {};
  let generatedSubCategorySnapshots = {};

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date <= ${dataFiMilli} AND date >= ${dataIniMilli}`, (err, row) => { err ? console.error(err.message) : decadeMovments.push(row) })
      .each(`SELECT * FROM categories WHERE active = 'true' `, (err, row) => { err ? console.error(err.message) : categoryList.push(row.id) })
      .each(`SELECT * FROM subcategories WHERE active = 'true' `, (err, row) => { err ? console.error(err.message) : subCategoryList.push(row.id) })

  })

  db.close((err) => {
    err ? console.error(err.message) : generateSnapshots(req);
  });

  function generateSnapshots() {

    categoryList.forEach(category => {

      let categorySnapshot = [];

      for (let i = req.body.yearini; i <= req.body.yearfini; i++) {

        let value = 0;
        decadeMovments.forEach(movement => {

          if ((new Date(movement.date).getFullYear()) === i  && movement.cat === category) {
            movement.type === 'expense' ? value -= movement.value : value += movement.value;

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

      for (let i = req.body.yearini; i <= req.body.yearfini; i++) {

        let value = 0;
        decadeMovments.forEach(movement => {

          if ((new Date(movement.date).getFullYear()) === i && movement.subcat === subcategory) {
            movement.type === 'expense' ? value -= movement.value : value += movement.value;
          }

        });

        subCategorySnapshot[i] = value;
      }

      generatedSubCategorySnapshots[`${subcategory}`] = subCategorySnapshot;

    });

    console.log('Subcategories snapshots sucessfully generated.');
    console.log('Generating dailysum snapshot...');

    let decadeSumEvo = Array(req.body.yearfini-req.body.yearini).fill(0)
    decadeMovments.forEach(movement => {
      movement.type === 'expense' ? decadeSumEvo[(new Date(movement.date).getMonth())] -= movement.value : decadeSumEvo[(new Date(movement.date).getFullYear()-req.body.yearini)] += movement.value
    });

    console.log('Dailysum snapshot sucessfully generated.');
    res.send([generatedCategorySnapshots, generatedSubCategorySnapshots, decadeSumEvo])

  }
}


// snapshot total acumulado
export function genDailySumAcomEvo(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Generating daily acomul snapshot...');
  });

  const dataIni = new Date('2022-01-01T00:00:00.000Z');
  dataIni.setFullYear(req.body.yearini)

  const dataFi = new Date('2022-01-01T00:00:00.000Z');
  dataFi.setFullYear(req.body.yearfini)

  const dataIniMilli = dataIni.getTime();
  const dataFiMilli = dataFi.getTime()-1;

  let decadeMovments = [];
  let initialSum = [];

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date <= ${dataFiMilli} AND date >= ${dataIniMilli}`, (err, row) => { err ? console.error(err.message) : decadeMovments.push(row) })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='income' AND date < ${dataIniMilli}`, (err, row) => { err ? console.error(err.message) : initialSum[0]=(Object.values(row[0])[0]) })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='expense' AND date < ${dataIniMilli}`, (err, row) => { err ? console.error(err.message) : initialSum[1]=(Object.values(row[0])[0]) })

  })

  db.close((err) => {
    err ? console.error(err.message) : generateAcomSnapshot(initialSum,decadeMovments);
    console.log('Daily acomul snapshot sucessfully generated.');
  });

  function generateAcomSnapshot(initialSum,decadeMovments) {

    let yearlySumAcomEvo = [];
    let initialSumCalculated = 0;

    initialSum.forEach((sum, i) => {
      if (sum !== null) { i === 0 ? initialSumCalculated += sum : initialSumCalculated -= sum }
    });

    for (let i = 0; i < 12; i++) {

      let yearlySum = 0;

      if (i === 0) { monthlySum += initialSumCalculated }
      if (i !== 0) monthlySum += yearlySumAcomEvo[i-1]

      decadeMovments.forEach(movement => { if ((new Date(movement.date).getMonth()) === i) { movement.type === 'expense' ? yearlySum -= movement.value : yearlySum += movement.value } });

      yearlySumAcomEvo.push(Number(yearlySum).toFixed(2));

    }

    res.send(yearlySumAcomEvo);

  }

}