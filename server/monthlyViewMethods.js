import sqlite3 from 'sqlite3';

export function dailyTotalDetails(req, res) {

  const day = Number(req.body.day)
  const month = Number(req.body.month)
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
  const month = Number(req.body.month)
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
  const month = Number(req.body.month)
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
  const MONTH = Number(req.body.month);
  const YEAR = Number(req.body.year);
  const DATA_INI = new Date('2022-01-01T00:00:00.000Z');
  const DATA_FINI = new Date('2022-01-01T00:00:00.000Z');
  DATA_INI.setFullYear(YEAR, MONTH); const DATA_INI_MS = DATA_INI.getTime();
  DATA_FINI.setFullYear(YEAR, MONTH + 1); const DATA_FINI_MS = DATA_FINI.getTime() - 1;

  let categoryList = []; //array com categorias ativas
  let subCategoryList = []; // array com as subcategorias ativas, das categorias ativas

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); } });
  db.serialize(() => {
    db.each(`SELECT * FROM categories WHERE active = 'true' `, (err, row) => { err ? console.error(err.message) : categoryList.push(row.id) })
      .each(`SELECT * FROM subcategories WHERE active = 'true' `, (err, row) => { err ? console.error(err.message) : categoryList.includes(row.maincatid) ? subCategoryList.push(row.id) : [] })
  })
  db.close((err) => { err ? console.error(err.message) : fetchMovments(); });

  let monthlyMovments = []; //movimentos para as categorias ativas
  let generatedCategorySnapshots = {}; //snapshots categorias
  let generatedSubCategorySnapshots = {}; //snapshots subcategorias

  function fetchMovments() {
    const QUERY = `SELECT * FROM treasurylog WHERE date <= ${DATA_FINI_MS} AND date >= ${DATA_INI_MS}`
    let queryExtra = ''

    categoryList.forEach((category, i) => {
      i === 0 ? queryExtra += ` AND ( cat='${category}'` : queryExtra += ` OR cat='${category}'`;
      if (i === categoryList.length - 1) { queryExtra += ' )' }
      generatedCategorySnapshots[`${category}`] = Array(MONTH_DAYS).fill(0)
    });

    subCategoryList.forEach((subcategory, i) => { generatedSubCategorySnapshots[`${subcategory}`] = Array(MONTH_DAYS).fill(0) });

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
          generatedCategorySnapshots[`${movement.cat}`][Number(new Date(movement.date).getDate()) - 1] -= movement.value;
          if (subCategoryList.includes(movement.subcat)) { generatedSubCategorySnapshots[`${movement.subcat}`][Number(new Date(movement.date).getDate()) - 1] -= movement.value; };
        } else {
          generatedCategorySnapshots[`${movement.cat}`][Number(new Date(movement.date).getDate()) - 1] += movement.value;
          if (subCategoryList.includes(movement.subcat)) { generatedSubCategorySnapshots[`${movement.subcat}`][Number(new Date(movement.date).getDate()) - 1] += movement.value; };
        }
      })

      let dailySumEvo = Array(Number(req.body.monthdays)).fill(0);
      monthlyMovments.forEach(movement => { movement.type === 'expense' ? dailySumEvo[(new Date(movement.date).getDate()) - 1] -= movement.value : dailySumEvo[(new Date(movement.date).getDate()) - 1] += movement.value; });

      res.send([generatedCategorySnapshots, generatedSubCategorySnapshots, dailySumEvo]);
    }
  }
}

// snapshot total acumulado
export function dailyTotalAcomulatedSnapshot(req, res) {

  const MONTH = Number(req.body.month);
  const YEAR = Number(req.body.year);
  const MONTH_DAYS = Number(req.body.days);
  const DATA_INI = new Date('2022-01-01T00:00:00.000Z'); DATA_INI.setFullYear(YEAR, MONTH); const DATA_INI_MS = DATA_INI.getTime();
  const DATA_FINI = new Date('2022-01-01T00:00:00.000Z'); DATA_FINI.setFullYear(YEAR, MONTH + 1); const DATA_FINI_MS = DATA_FINI.getTime() - 1;


  let monthlyMovments = [];
  let initialSum = [];

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); } });


  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date <= ${DATA_FINI_MS} AND date >= ${DATA_INI_MS}`, (err, row) => { err ? console.error(err.message) : monthlyMovments.push(row) })
      // .all(`SELECT SUM(value) FROM treasurylog WHERE type='income' AND date <= ${DATA_INI_MS - 1}`, (err, row) => { err ? console.error(err.message) : initialSum[0] = Object.values(row[0])[0] })
      // .all(`SELECT SUM(value) FROM treasurylog WHERE type='expense' AND date <= ${DATA_INI_MS - 1}`, (err, row) => { err ? console.error(err.message) : initialSum[1] = Object.values(row[0])[0] })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='income' AND date <= ${DATA_INI_MS - 1}`, (err, row) => { err ? console.error(err.message) : initialSum[0] = Object.values(row[0])[0] })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='expense' AND date <= ${DATA_INI_MS - 1}`, (err, row) => { err ? console.error(err.message) : initialSum[1] = Object.values(row[0])[0] })
  })

  db.close((err) => {
    err ? console.error(err.message) : generateAcomSnapshot();
    console.log('Daily acomul snapshot sucessfully generated.');
  });

  function generateAcomSnapshot() {

    let dailySumAcomEvo = new Array(MONTH_DAYS).fill(0);
    let initialSumCalculated = 0;

    initialSum.forEach((sum, i) => {
      if (sum !== null) { i === 0 ? initialSumCalculated += sum : initialSumCalculated = Number((initialSumCalculated - sum).toFixed(2)) }
    });

    dailySumAcomEvo[0] += initialSumCalculated;
    monthlyMovments.forEach(movement => movement.type === 'expense' ?
      dailySumAcomEvo[new Date(movement.date).getDate()-1] = Number((dailySumAcomEvo[new Date(movement.date).getDate()-1]-movement.value).toFixed(2)) :
      dailySumAcomEvo[new Date(movement.date).getDate()-1] += movement.value);
    for (let i = 1; i < MONTH_DAYS; i++) { dailySumAcomEvo[i] += dailySumAcomEvo[i - 1] }

    console.log(dailySumAcomEvo)
    res.send(dailySumAcomEvo);

  }
}
