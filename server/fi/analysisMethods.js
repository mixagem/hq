import sqlite3 from 'sqlite3';

function sumToFixed(...args) { return [...args].reduce((previousValue, currentValue) => Number((previousValue + currentValue).toFixed(2))); }

export function getGraph(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); } console.log('[S] '); });

  let DATA_INI; let DATA_INI_MS;
  let DATA_FINI; let DATA_FINI_MS;
  let CONFIG = {}; // titulo pesquisa, cat, subcats, year, duration,
  const TITLES = {}; // títulos subcategorias
  let graphsArray = []; // array de graficos a ser enviado
  let dailyValuesArray = []; // array de valores n acomulados
  let TABLE; let FIELD;

  (function start() {
    db.all(`SELECT * FROM graphs WHERE id = '${req.body.graphid}'`, (err, result) => {
      if (err) { console.error(err.message); return res.send['MHQERROR', err.message] }

      CONFIG = JSON.parse(result[0]['params']);
      CONFIG.title = result[0]['title'];
      CONFIG.acomul = (result[0]['acomul'] === 'true' ? true : false)
      CONFIG.target = result[0]['target'];
      DATA_INI = new Date('2022-01-01T00:00:00.000Z'); DATA_INI.setFullYear(CONFIG.year); DATA_INI_MS = DATA_INI.getTime();
      DATA_FINI = new Date('2022-01-01T00:00:00.000Z'); DATA_FINI.setFullYear(CONFIG.year + CONFIG.duration); DATA_FINI_MS = DATA_FINI.getTime() - 1;
      CONFIG.duration = CONFIG.duration * 12

      if (CONFIG.target === 'subcat') { TABLE = 'subcategories'; FIELD = 'subcat' }
      if (CONFIG.target === 'cat') { TABLE = 'categories'; FIELD = 'cat' }
      catTitles();
    })
  })();

  function catTitles() {


    db.each(`SELECT id,title FROM ${TABLE} WHERE id IN(${CONFIG[FIELD].join(', ')})`, (err, result) => {
      if (err) { console.error(err.message); return res.send['MHQERROR', err.message] }
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
      dailyValuesArray.push(new Array(CONFIG.duration).fill(0));

      if (CONFIG.acomul) {
        query += `
(SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND ${FIELD} = '${subcatID}' AND type = 'income') as ${FIELD}${subcatID}isum,
(SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND ${FIELD} = '${subcatID}' AND type = 'expense') as ${FIELD}${subcatID}esum,`
      }
    });

    if (CONFIG.acomul) {
      query = query.slice(0, -1) // remover a vírgula final skyr

      db.all(query, (err, result) => {

        if (err) { console.error(err.message); return res.send['MHQERROR', err.message] }

        CONFIG[FIELD].forEach((subcatID, i) => {
          if (result[0][`${FIELD}${subcatID}esum`] == null) { result[0][`${FIELD}${subcatID}esum`] = 0 }
          if (result[0][`${FIELD}${subcatID}isum`] == null) { result[0][`${FIELD}${subcatID}esum`] = 0 }
          dailyValuesArray[i][0] = sumToFixed(dailyValuesArray[i][0], -result[0][`${FIELD}${subcatID}isum`], result[0][`${FIELD}${subcatID}esum`]);

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

        if (CONFIG['inverted'][i]) {
          if (tlog.type === 'income') { dailyValuesArray[i][MONTH] = sumToFixed(dailyValuesArray[i][MONTH], -tlog.value); }
          if (tlog.type === 'expense') { dailyValuesArray[i][MONTH] = sumToFixed(dailyValuesArray[i][MONTH], tlog.value); }
        }

        if (!CONFIG['inverted'][i]) {
          if (tlog.type === 'income') { dailyValuesArray[i][MONTH] = sumToFixed(dailyValuesArray[i][MONTH], tlog.value); }
          if (tlog.type === 'expense') { dailyValuesArray[i][MONTH] = sumToFixed(dailyValuesArray[i][MONTH], -tlog.value); }
        }

      });

    });
    closure();
  }

  function closure() {

    db.close((err) => {

      switch (CONFIG.acomul) {

        case true:
          let subcatDailyAcomulatedValuesArray = [];

          for (let z = 0; z < CONFIG[FIELD].length; z++) {
            subcatDailyAcomulatedValuesArray.push(new Array(CONFIG.duration).fill(0))
          }


          for (let i = 0; i < CONFIG.duration; i++) {

            if (i === 0) {
              subcatDailyAcomulatedValuesArray.forEach((subcat, y) => {
                subcat[i] = dailyValuesArray[y][i]
              });
            }

            if (i !== 0) {
              subcatDailyAcomulatedValuesArray.forEach((subcat, y) => {
                subcat[i] = sumToFixed(subcat[i - 1], dailyValuesArray[y][i])
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

        case false:

          for (let i = 0; i < CONFIG.duration; i++) {
            const MONTH = new Date(DATA_INI_MS); MONTH.setMonth(i);

            graphsArray.forEach((graph, y) => {
              graph.series.push({
                name: MONTH.toLocaleString('default', { year: 'numeric', month: 'short' }),
                value: dailyValuesArray[y][i]
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
  db.each(`SELECT * FROM graphs WHERE id = '${req.body.graphid}'`, (err, row) => {
    if (err) { console.error(err.message) } else {

      graphConfig = JSON.parse(row['params'])
      graphConfig.title = row['title']
      graphConfig.target = row['target']
      graphConfig.acomul = (row['acomul'] === 'true' ? true : false)
    }
  })

  db.close((err) => {
    err ? console.error(err.message) : res.send(graphConfig);
    console.log('[S2] ');
  });
}

export function saveGraphConfig(req, res) {

  const GRAPH_CONFIG = JSON.parse(req.body.config);
  const TITLE = GRAPH_CONFIG.title; const TARGET = GRAPH_CONFIG.target; const ACOMUL = GRAPH_CONFIG.acomul;
  delete GRAPH_CONFIG.title; delete GRAPH_CONFIG.target; delete GRAPH_CONFIG.acomul;
  // return
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[S2] ');
  });

  // return
  db.run(`UPDATE graphs SET title = '${TITLE}', target = '${TARGET}', acomul = '${ACOMUL}', params='${JSON.stringify(GRAPH_CONFIG)}' WHERE id='${req.body.graphid}'`, (err) => {
    if (err) { console.error(err.message) }
  })

  db.close((err) => {
    err ? console.error(err.message) : res.send(['Gucci']);
    console.log('[S2] ');
  });
}