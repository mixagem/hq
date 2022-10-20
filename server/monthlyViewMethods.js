import sqlite3 from 'sqlite3';

export function dailyTotalDetails(req, res) {

  const day = Number(req.body.day)
  const month = Number(req.body.month) - 1
  const year = Number(req.body.year)

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`Fetching ${day}/${month}/${year} details from ${req.body.subcat}...`);
  });

  const dataIni = new Date('2022-01-01T00:00:00.000Z')
  dataIni.setFullYear(year, month, day)

  const dataFi = new Date(dataIni.getTime())
  dataFi.setDate(day + 1)

  const dataIniMilli = dataIni.getTime();
  const dataFiMilli = dataFi.getTime() - 1;

  let dailyMovments = [];

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date >= ${dataIniMilli} AND date < ${dataFiMilli}`, (err, row) => { err ? console.error(err.message) : dailyMovments.push(row) })

  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(dailyMovments)
    console.log('Fetching complete')
  });

}

export function dailySubCatDetails(req, res) {

  const day = Number(req.body.day)
  const month = Number(req.body.month) - 1
  const year = Number(req.body.year)

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`Fetching ${day}/${req.body.month}/${req.body.year} details from ${req.body.subcat}...`);
  });

  const dataIni = new Date('2022-01-01T00:00:00.000Z')
  dataIni.setFullYear(year, month, day)

  const dataFi = new Date(dataIni.getTime())
  dataFi.setDate(day + 1)

  const dataIniMilli = dataIni.getTime();
  const dataFiMilli = dataFi.getTime() - 1;
  let dailyMovments = [];

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date >= ${dataIniMilli} AND date <= ${dataFiMilli} AND subcat=${req.body.subcat}`, (err, row) => { err ? console.error(err.message) : dailyMovments.push(row) })

  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(dailyMovments)
    console.log('Fetching complete')
  });

}

export function dailyCatDetails(req, res) {

  const day = Number(req.body.day)
  const month = Number(req.body.month) - 1
  const year = Number(req.body.year)

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`Fetching ${day}/${month}/${year} details from ${req.body.cat}...`);
  });


  const dataIni = new Date('2022-01-01T00:00:00.000Z')
  dataIni.setFullYear(year, month, day)

  const dataFi = new Date(dataIni.getTime())
  dataFi.setDate(day + 1)

  const dataIniMilli = dataIni.getTime();
  const dataFiMilli = dataFi.getTime() - 1;

  let dailyMovments = [];

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date >= ${dataIniMilli} AND date < ${dataFiMilli} AND cat=${req.body.cat}`, (err, row) => { err ? console.error(err.message) : dailyMovments.push(row) })

  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(dailyMovments)
    console.log('Fetching complete')
  });

}

//snapshots das categorias / subcategorias
export function monthlySnapshots(req, res) {

  const MONTH_DAYS = Number(req.body.monthdays);
  const MONTH = Number(req.body.month) - 1;
  const YEAR = Number(req.body.year);
  const DATA_INI = new Date('2022-01-01T00:00:00.000Z');
  const DATA_FINI = new Date('2022-01-01T00:00:00.000Z');
  DATA_INI.setFullYear(YEAR, MONTH); const DATA_INI_MS = DATA_INI.getTime();
  DATA_FINI.setFullYear(YEAR, MONTH + 1); const DATA_FINI_MS = DATA_FINI.getTime() - 1;

  let categoryList = [];
  let subCategoryList = [];

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); } });
  db.serialize(() => {
    db.each(`SELECT * FROM categories WHERE active = 'true' `, (err, row) => { err ? console.error(err.message) : categoryList.push(row.id) })
      .each(`SELECT * FROM subcategories WHERE active = 'true' `, (err, row) => { err ? console.error(err.message) : categoryList.includes(row.maincatid) ? subCategoryList.push(row.id) : [] })
  })
  db.close((err) => { err ? console.error(err.message) : fetchMovments(); });

  let monthlyMovments = [];
  let generatedCategorySnapshots = {};
  let generatedSubCategorySnapshots = {};

  function fetchMovments() {
    const QUERY = `SELECT * FROM treasurylog WHERE date <= ${DATA_FINI_MS} AND date >= ${DATA_INI_MS}`
    let queryExtra = '';

    categoryList.forEach((category, i) => {
      i === 0 ? queryExtra += ` AND ( cat='${category}'` : queryExtra += ` OR cat='${category}'`;
      if (i === categoryList.length - 1) { queryExtra += ' )' }
      generatedCategorySnapshots[`${category}`] = Array(MONTH_DAYS).fill(0)
    });

    subCategoryList.forEach((subcategory, i) => {
      i === 0 ? queryExtra += ` AND ( subcat='${subcategory}'` : queryExtra += ` OR subcat='${subcategory}'`;
      if (i === subCategoryList.length - 1) { queryExtra += ' )' }
      generatedSubCategorySnapshots[`${subcategory}`] = Array(MONTH_DAYS).fill(0)
    });

    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); } });
    db.serialize(() => {
      db.each(`${QUERY}${queryExtra}`, (err, row) => { err ? console.error(err.message) : monthlyMovments.push(row) })
    });

    db.close((err) => {
      err ? console.error(err.message) : generateSnapshots();
    });

    function generateSnapshots() {
      monthlyMovments.forEach(movement => {
        if (movement.type === 'expense') {
          generatedCategorySnapshots[`${movement.cat}`][Number(new Date(movement.date).getDate()) - 1] -= movement.value
          generatedSubCategorySnapshots[`${movement.subcat}`][Number(new Date(movement.date).getDate()) - 1] -= movement.value
        } else {
          generatedCategorySnapshots[`${movement.cat}`][Number(new Date(movement.date).getDate()) - 1] += movement.value
          generatedSubCategorySnapshots[`${movement.subcat}`][Number(new Date(movement.date).getDate()) - 1] += movement.value
        }
      })

      let dailySumEvo = Array(Number(req.body.monthdays)).fill(0)
      monthlyMovments.forEach(movement => {
        movement.type === 'expense' ? dailySumEvo[(new Date(movement.date).getDate()) - 1] -= movement.value : dailySumEvo[(new Date(movement.date).getDate()) - 1] += movement.value
      });

      res.send([generatedCategorySnapshots, generatedSubCategorySnapshots, dailySumEvo])
    }



    // categoryList.forEach(category => {


    //   let categorySnapshot = [];

    //   for (let i = 0; i < req.body.monthdays; i++) {

    //     let value = 0;
    //     monthlyMovments.forEach(movement => { // novo monthlymovmentss, filtrado com as categorias que vao ser loopadas

    //       if ((new Date(movement.date).getDate()) === i + 1 && movement.cat === category) {
    //         movement.type === 'expense' ? value -= movement.value : value += movement.value;

    //       }

    //     });

    //     categorySnapshot[i] = value;
    //   }

    //   generatedCategorySnapshots[`${category}`] = categorySnapshot;

    // });

    // console.log('Categories snapshots sucessfully generated.');
    // console.log('Generating subcategories snapshots...');


    // subCategoryList.forEach(subcategory => {
    //   // recebo os ids. em vez de fazer foreach para todos movimentoos todos, a cada foreach faço uma query ao treasurylog com o WHERE cat
    //   let subCategorySnapshot = [];

    //   for (let i = 0; i < req.body.monthdays; i++) {

    //     let value = 0;
    //     monthlyMovments.forEach(movement => {

    //       if ((new Date(movement.date).getDate()) === i + 1 && movement.subcat === subcategory) {
    //         movement.type === 'expense' ? value -= movement.value : value += movement.value;
    //       }

    //     });

    //     subCategorySnapshot[i] = value;
    //   }

    //   generatedSubCategorySnapshots[`${subcategory}`] = subCategorySnapshot;

    // });

    // console.log('Subcategories snapshots sucessfully generated.');
    // console.log('Generating dailysum snapshot...');


  }
}

// snapshot total acumulado
export function dailyTotalAcomulatedSnapshot(req, res) {

  const month = Number(req.body.month) - 1
  const year = Number(req.body.year)

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Generating daily acomul snapshot...');
  });


  const dataIni = new Date('2022-01-01T00:00:00.000Z');
  dataIni.setFullYear(year, month)

  const dataFi = new Date('2022-01-01T00:00:00.000Z');
  dataFi.setFullYear(year, month + 1)

  const dataIniMilli = dataIni.getTime();
  const dataFiMilli = dataFi.getTime() - 1;

  let monthlyMovments = [];
  let initialSum = [];

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date <= ${dataFiMilli} AND date >= ${dataIniMilli}`, (err, row) => { err ? console.error(err.message) : monthlyMovments.push(row) })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='income' AND date < ${dataIniMilli - 1}`, (err, row) => { err ? console.error(err.message) : initialSum[0] = Object.values(row[0])[0] })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='expense' AND date < ${dataIniMilli - 1}`, (err, row) => { err ? console.error(err.message) : initialSum[1] = Object.values(row[0])[0] })

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
      monthlyMovments.forEach(movement => { if ((new Date(movement.date).getDate()) === i + 1) { movement.type === 'expense' ? dailysum -= movement.value : dailysum += movement.value } });

      if (i === 0) { dailysum += initialSumCalculated }
      if (i !== 0) { dailysum += dailySumAcomEvo[i - 1] }

      dailySumAcomEvo.push(Number(dailysum).toFixed(2));

    }
    res.send(dailySumAcomEvo);

  }
}