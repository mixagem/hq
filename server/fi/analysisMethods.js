import sqlite3 from 'sqlite3';

function sumToFixed(...args) { return [...args].reduce((previousValue, currentValue) => Number((previousValue + currentValue).toFixed(2))); }

export function getGraph(req, res) {

  const TYPE = req.body.type
  const INVERTED = req.body.inverted
  let TABLE; let FIELD;
  if (TYPE === 'evo' ) { TABLE = 'subcategories'; FIELD = 'subcat' }
  if (TYPE === 'h2h' || TYPE === 'stack' ) { TABLE = 'categories'; FIELD = 'cat' }

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); } console.log('[S] '); });

  let DATA_INI; let DATA_INI_MS;
  let DATA_FINI; let DATA_FINI_MS;
  let CONFIG = {}; // titulo pesquisa, cat, subcats, year, duration,
  const TITLES = {}; // títulos subcategorias
  let graphsArray = []; // array de graficos a ser enviado
  let subcatDailyValuesArray = []; // array de valores n acomulados


  (function start() {
    db.all(`SELECT * FROM graphs WHERE type = '${TYPE}'`, (err, result) => {
      if (err) { console.error(err.message); return res.send['MHQERROR', err.message] }

      CONFIG = JSON.parse(result[0]['params']);
      CONFIG.title = result[0]['title'];
      DATA_INI = new Date('2022-01-01T00:00:00.000Z'); DATA_INI.setFullYear(CONFIG.year); DATA_INI_MS = DATA_INI.getTime();
      DATA_FINI = new Date('2022-01-01T00:00:00.000Z'); DATA_FINI.setFullYear(CONFIG.year + CONFIG.duration); DATA_FINI_MS = DATA_FINI.getTime() - 1;
      CONFIG.duration = CONFIG.duration * 12

      catTitles();
    })
  })();

  function catTitles() {


    db.each(`SELECT id,title FROM ${TABLE} WHERE id IN(${CONFIG[FIELD].join(', ')})`, (err, result) => {
      if (err) { console.error(err.message); return res.send['MHQERROR', err.message] }
      console.log(result)
      TITLES[result['id']] = result['title'];
    })
    db.close((err) => {
      if (err) { console.error(err.message); return res.send['MHQERROR', err.message] }

      initialValue();

    });

  }

  function initialValue() {
    db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); } console.log('[S] '); });
    let query = `SELECT`


    CONFIG[FIELD].forEach(subcatID => {
      graphsArray.push({ name: TITLES[subcatID], series: [] });
      subcatDailyValuesArray.push(new Array(CONFIG.duration).fill(0));

      if (TYPE === 'evo') {
        query += `
(SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND ${FIELD} = '${subcatID}' AND type = 'income') as ${FIELD}${subcatID}isum,
(SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND ${FIELD} = '${subcatID}' AND type = 'expense') as ${FIELD}${subcatID}esum,`
      }
    });

    if (TYPE === 'evo') {
      query = query.slice(0, -1) // remover a vírgula final skyr

      db.all(query, (err, result) => {

        if (err) { console.error(err.message); return res.send['MHQERROR', err.message] }

        CONFIG[FIELD].forEach((subcatID, i) => {
          if (result[0][`${FIELD}${subcatID}esum`] == null) { result[0][`${FIELD}${subcatID}esum`] = 0 }
          if (result[0][`${FIELD}${subcatID}isum`] == null) { result[0][`${FIELD}${subcatID}esum`] = 0 }
          subcatDailyValuesArray[i][0] = sumToFixed(subcatDailyValuesArray[i][0], -result[0][`${FIELD}${subcatID}isum`], result[0][`${FIELD}${subcatID}esum`]);

          if (i + 1 === CONFIG[FIELD].length) { graphGen(); }

        });

      });
    } else { graphGen(); }
  }


  function graphGen() {

    CONFIG[FIELD].forEach((subcatID, i) => {

      db.each(`SELECT * FROM treasurylog WHERE date >= ${DATA_INI_MS} AND date < ${DATA_FINI_MS} AND ${FIELD} = '${subcatID}' ORDER BY date ASC`, (err, tlog) => {

        if (err) { console.error(err.message); return res.send['MHQERROR', err.message] }

        let MONTH = new Date(tlog.date).getMonth();
        MONTH = MONTH + (((new Date(tlog.date).getFullYear()) - CONFIG.year) * 12)

        if (INVERTED) {
          if (tlog.type === 'income') { subcatDailyValuesArray[i][MONTH] = sumToFixed(subcatDailyValuesArray[i][MONTH], -tlog.value); }
          if (tlog.type === 'expense') { subcatDailyValuesArray[i][MONTH] = sumToFixed(subcatDailyValuesArray[i][MONTH], tlog.value); }
        }

        if (!INVERTED) {
          if (tlog.type === 'income') { subcatDailyValuesArray[i][MONTH] = sumToFixed(subcatDailyValuesArray[i][MONTH], tlog.value); }
          if (tlog.type === 'expense') { subcatDailyValuesArray[i][MONTH] = sumToFixed(subcatDailyValuesArray[i][MONTH], -tlog.value); }
        }

      });

    });
    closure();
  }

  function closure() {

    db.close((err) => {

      switch (TYPE) {

        case 'evo':
          let subcatDailyAcomulatedValuesArray = [];

          for (let z = 0; z < CONFIG[FIELD].length; z++) {
            subcatDailyAcomulatedValuesArray.push(new Array(CONFIG.duration).fill(0))
          }


          for (let i = 0; i < CONFIG.duration; i++) {

            if (i === 0) {
              subcatDailyAcomulatedValuesArray.forEach((subcat, y) => {
                subcat[i] = subcatDailyValuesArray[y][i]
              });
            }

            if (i !== 0) {
              subcatDailyAcomulatedValuesArray.forEach((subcat, y) => {
                subcat[i] = sumToFixed(subcat[i - 1], subcatDailyValuesArray[y][i])
              });
            }

            const MONTH = new Date(DATA_INI_MS); MONTH.setMonth(i);

            graphsArray.forEach((graph, y) => {
              graph.series.push({
                name: MONTH.toLocaleString('default', { year: 'numeric', month: 'short' }),
                value: subcatDailyAcomulatedValuesArray[y][i]
              })
            })

          }
          break;

        case 'h2h': default:

          for (let i = 0; i < CONFIG.duration; i++) {
            const MONTH = new Date(DATA_INI_MS); MONTH.setMonth(i);

            graphsArray.forEach((graph, y) => {
              graph.series.push({
                name: MONTH.toLocaleString('default', { year: 'numeric', month: 'short' }),
                value: subcatDailyValuesArray[y][i]
              })
            })

          }
          break;

      }


      if (err) { console.error(err.message); return res.send['MHQERROR', err.message] }
      res.send(graphsArray)
      console.log('[S1] complete');
    });
  }
}

export function fetchGraphConfig(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[S2] ');
  });

  let graphConfig = {};
  db.each(`SELECT * FROM graphs WHERE type = '${req.body.type}'`, (err, row) => {
    if (err) { console.error(err.message) } else {

      graphConfig = JSON.parse(row['params'])
      graphConfig.title = row['title']

    }
  })

  db.close((err) => {
    err ? console.error(err.message) : res.send(graphConfig);
    console.log('[S2] ');
  });
}

export function saveGraphConfig(req, res) {

  const GRAPH_CONFIG = JSON.parse(req.body.config);
  const TITLE = GRAPH_CONFIG.title
  delete GRAPH_CONFIG.title
  // return
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[S2] ');
  });

  // return
  db.run(`UPDATE graphs SET title = '${TITLE}', params='${JSON.stringify(GRAPH_CONFIG)}' WHERE type='${req.body.type}'`, (err) => {
    if (err) { console.error(err.message) }
  })

  db.close((err) => {
    err ? console.error(err.message) : res.send(['Gucci']);
    console.log('[S2] ');
  });
}