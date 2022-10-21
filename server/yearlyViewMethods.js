import sqlite3 from 'sqlite3';

export function monthlyTotalDetails(req, res) {

  const MONTH = Number(req.body.month);
  const YEAR = Number(req.body.year);
  const DATA_INI = new Date('2022-01-01T00:00:00.000Z'); DATA_INI.setFullYear(YEAR, MONTH); const DATA_INI_MS = DATA_INI.getTime();
  const DATA_FINI = new Date('2022-01-01T00:00:00.000Z'); DATA_FINI.setFullYear(YEAR, MONTH + 1); const DATA_FINI_MS = DATA_FINI.getTime() - 1;

  let monthlyMovments = [];

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`Fetching ${MONTH}/${YEAR} details from ${req.body.subcat}...`);
  });
  db.serialize(() => {
    db.each(`SELECT * FROM treasurylog WHERE date >= ${DATA_INI_MS} AND date <= ${DATA_FINI_MS}`, (err, row) => { err ? console.error(err.message) : monthlyMovments.push(row) })
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(monthlyMovments)
    console.log('Fetching complete')
  });

}

export function monthlySubCatDetails(req, res) {

  const MONTH = Number(req.body.month);
  const YEAR = Number(req.body.year);
  const DATA_INI = new Date('2022-01-01T00:00:00.000Z'); DATA_INI.setFullYear(YEAR, MONTH); const DATA_INI_MS = DATA_INI.getTime();
  const DATA_FINI = new Date('2022-01-01T00:00:00.000Z'); DATA_FINI.setFullYear(YEAR, MONTH + 1); const DATA_FINI_MS = DATA_FINI.getTime() - 1;

  let monthlyMovments = [];

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`Fetching ${MONTH}/${YEAR} details from ${req.body.subcat}...`);
  });
  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date >= ${DATA_INI_MS} AND date <= ${DATA_FINI_MS} AND subcat=${req.body.subcat}`, (err, row) => { err ? console.error(err.message) : monthlyMovments.push(row) })

  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(monthlyMovments)
    console.log('Fetching complete')
  });
}

export function monthlyCatDetails(req, res) {

  const MONTH = Number(req.body.month);
  const YEAR = Number(req.body.year);
  const DATA_INI = new Date('2022-01-01T00:00:00.000Z'); DATA_INI.setFullYear(YEAR, MONTH); const DATA_INI_MS = DATA_INI.getTime();
  const DATA_FINI = new Date('2022-01-01T00:00:00.000Z'); DATA_FINI.setFullYear(YEAR, MONTH + 1); const DATA_FINI_MS = DATA_FINI.getTime() - 1;

  let monthlyMovments = [];

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`Fetching ${MONTH}/${YEAR} details from ${req.body.cat}...`);
  });

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date >= ${DATA_INI_MS} AND date <= ${DATA_FINI_MS} AND cat=${req.body.cat}`, (err, row) => { err ? console.error(err.message) : monthlyMovments.push(row) })

  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(monthlyMovments)
    console.log('Fetching complete')
  });

}

//snapshots das categorias / subcategorias
export function yearlySnapshots(req, res) {

  const YEAR = Number(req.body.year);
  const DATA_INI = new Date('2022-01-01T00:00:00.000Z');
  const DATA_FINI = new Date('2022-01-01T00:00:00.000Z');
  DATA_INI.setFullYear(YEAR); const DATA_INI_MS = DATA_INI.getTime();
  DATA_FINI.setFullYear(YEAR + 1); const DATA_FINI_MS = DATA_FINI.getTime() - 1;

  let categoryList = []; //array com categorias ativas
  let subCategoryList = []; // array com as subcategorias ativas, das categorias ativas


  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Generating categories snapshots...');
  });

  db.serialize(() => {
    db.each(`SELECT * FROM categories WHERE active = 'true' `, (err, row) => { err ? console.error(err.message) : categoryList.push(row.id) })
      .each(`SELECT * FROM subcategories WHERE active = 'true' `, (err, row) => { err ? console.error(err.message) : categoryList.includes(row.maincatid) ? subCategoryList.push(row.id) : [] })
  })
  db.close((err) => { err ? console.error(err.message) : fetchMovments(); });

  let yearlyMovments = []; //movimentos para as categorias ativas
  let generatedCategorySnapshots = {}; //snapshots categorias
  let generatedSubCategorySnapshots = {}; //snapshots subcategorias


  function fetchMovments() {
    const QUERY = `SELECT * FROM treasurylog WHERE date <= ${DATA_FINI_MS} AND date >= ${DATA_INI_MS}`
    let queryExtra = ''

    categoryList.forEach((category, i) => {
      i === 0 ? queryExtra += ` AND ( cat='${category}'` : queryExtra += ` OR cat='${category}'`;
      if (i === categoryList.length - 1) { queryExtra += ' )' }
      generatedCategorySnapshots[`${category}`] = Array(12).fill(0)
    });

    subCategoryList.forEach((subcategory, i) => { generatedSubCategorySnapshots[`${subcategory}`] = Array(12).fill(0) });

    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); } });
    db.serialize(() => {
      db.each(`${QUERY}${queryExtra}`, (err, row) => { err ? console.error(err.message) : yearlyMovments.push(row) })
    });

    db.close((err) => {
      err ? console.error(err.message) : generateSnapshots();
    });

    function generateSnapshots() {
      yearlyMovments.forEach(movement => {
        if (movement.type === 'expense') {
          generatedCategorySnapshots[`${movement.cat}`][Number(new Date(movement.date).getMonth())] =
            Number((generatedCategorySnapshots[`${movement.cat}`][Number(new Date(movement.date).getMonth())] - movement.value).toFixed(2))

          if (subCategoryList.includes(movement.subcat)) {
            generatedSubCategorySnapshots[`${movement.subcat}`][Number(new Date(movement.date).getMonth())] =
              Number((generatedSubCategorySnapshots[`${movement.subcat}`][Number(new Date(movement.date).getMonth())] - movement.value).toFixed(2));
          };

        } else {
          generatedCategorySnapshots[`${movement.cat}`][Number(new Date(movement.date).getMonth())] =
            Number((generatedCategorySnapshots[`${movement.cat}`][Number(new Date(movement.date).getMonth())] + movement.value).toFixed(2));
          if (subCategoryList.includes(movement.subcat)) {
            generatedSubCategorySnapshots[`${movement.subcat}`][Number(new Date(movement.date).getMonth())] =
            Number((generatedSubCategorySnapshots[`${movement.subcat}`][Number(new Date(movement.date).getMonth())] + movement.value).toFixed(2));
          };
        }
      })

      let monthlySumEvo = Array(12).fill(0);
      yearlyMovments.forEach(movement => {
        movement.type === 'expense' ?
          monthlySumEvo[(new Date(movement.date).getMonth())] = Number((monthlySumEvo[(new Date(movement.date).getMonth())] - movement.value).toFixed(2)) :
          monthlySumEvo[(new Date(movement.date).getMonth())] = Number((monthlySumEvo[(new Date(movement.date).getMonth())] + movement.value).toFixed(2));
      });
      console.log(generatedCategorySnapshots)
      res.send([generatedCategorySnapshots, generatedSubCategorySnapshots, monthlySumEvo]);
    }
  }
}

// snapshot total acumulado
export function monthlyTotalAcomulatedSnapshot(req, res) {

  const YEAR = Number(req.body.year);
  const DATA_INI = new Date('2022-01-01T00:00:00.000Z'); DATA_INI.setFullYear(YEAR,); const DATA_INI_MS = DATA_INI.getTime();
  const DATA_FINI = new Date('2022-01-01T00:00:00.000Z'); DATA_FINI.setFullYear(YEAR + 1); const DATA_FINI_MS = DATA_FINI.getTime() - 1;

  let yearlyMovments = [];
  let initialSum = [];

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Generating daily acomul snapshot...');
  });

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date <= ${DATA_FINI_MS} AND date >= ${DATA_INI_MS}`, (err, row) => { err ? console.error(err.message) : yearlyMovments.push(row) })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='income' AND date <= ${DATA_INI_MS - 1}`, (err, row) => { err ? console.error(err.message) : initialSum[0] = Object.values(row[0])[0] })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='expense' AND date <= ${DATA_INI_MS - 1}`, (err, row) => { err ? console.error(err.message) : initialSum[1] = Object.values(row[0])[0] })
  })

  db.close((err) => {
    err ? console.error(err.message) : generateAcomSnapshot();
    console.log('Daily acomul snapshot sucessfully generated.');
  });

  function generateAcomSnapshot() {

    let monthlySumAcomEvoEvo = new Array(12).fill(0);
    let initialSumCalculated = 0;

    initialSum.forEach((sum, i) => {
      if (sum !== null) { i === 0 ? initialSumCalculated = Number((initialSumCalculated + sum).toFixed(2)) : initialSumCalculated = Number((initialSumCalculated - sum).toFixed(2)) }
    });

    monthlySumAcomEvoEvo[0] = Number((monthlySumAcomEvoEvo[0] + initialSumCalculated).toFixed(2));
    yearlyMovments.forEach(movement => movement.type === 'expense' ?
      monthlySumAcomEvoEvo[new Date(movement.date).getMonth()] = Number((monthlySumAcomEvoEvo[new Date(movement.date).getMonth()] - movement.value).toFixed(2)) :
      monthlySumAcomEvoEvo[new Date(movement.date).getMonth()] = Number((monthlySumAcomEvoEvo[new Date(movement.date).getMonth()] + movement.value).toFixed(2)));
    for (let i = 1; i < 12; i++) { monthlySumAcomEvoEvo[i] = Number((monthlySumAcomEvoEvo[i] + monthlySumAcomEvoEvo[i - 1]).toFixed(2)) }

    res.send(monthlySumAcomEvoEvo);
  }
}