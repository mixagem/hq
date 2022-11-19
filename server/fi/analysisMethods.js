import sqlite3 from 'sqlite3';

function sumToFixed(...args) { return [...args].reduce((previousValue, currentValue) => Number((previousValue + currentValue).toFixed(2))); }



export function savingsGraphSnapshot(req, res) {

  const YEAR = JSON.parse(req.body.year);
  const DATA_INI = new Date('2022-01-01T00:00:00.000Z'); DATA_INI.setFullYear(YEAR - 1); const DATA_INI_MS = DATA_INI.getTime();
  const DATA_FINI = new Date('2022-01-01T00:00:00.000Z'); DATA_FINI.setFullYear(YEAR); const DATA_FINI_MS = DATA_FINI.getTime() - 1;

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[S1] generating savings graph snapshot');
  });

  let homeSnapshotArray = {
    name: 'Poupanças casa',
    series: []
  };

  let carSnapshotArray = {
    name: 'Poupanças carro',
    series: []
  };


  let homeMonthlyValues = new Array(24).fill(0);
  let carMonthlyValues = new Array(24).fill(0);


  db.serialize(() => {
    db.all(`SELECT
    (SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND cat = '2' AND subcat = '4' AND type = 'income') as homebadsum,
    (SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND cat = '2' AND subcat = '4' AND type = 'expense') as homegoodsum,
    (SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND cat = '2' AND subcat = '5' AND type = 'income') as carbadsum,
    (SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND cat = '2' AND subcat = '5' AND type = 'expense') as cargoodsum`, (err, result) => {

      if (err) { console.error(err.message) }
      else {

        if (result[0].homegoodsum == null) { result[0].homegoodsum = 0 }
        if (result[0].homebadsum == null) { result[0].homebadsum = 0 }
        if (result[0].cargoodsum == null) { result[0].cargoodsum = 0 }
        if (result[0].carbadsum == null) { result[0].carbadsum = 0 }

        homeMonthlyValues[0] = sumToFixed(homeMonthlyValues[0], -result[0].homebadsum, result[0].homegoodsum)
        carMonthlyValues[0] = sumToFixed(carMonthlyValues[0], -result[0].carbadsum, result[0].cargoodsum)
      }

    })


    db.each(`SELECT * FROM treasurylog WHERE date >= ${DATA_INI_MS} AND date < ${DATA_FINI_MS} AND cat = '2' and subcat = '4' ORDER BY date ASC `, (err, homeSavingLog) => {
      if (err) { console.error(err.message) } else {
        const MONTH = new Date(homeSavingLog.date).getMonth();
        if (homeSavingLog.type === 'income') {
          homeMonthlyValues[MONTH] = sumToFixed(homeMonthlyValues[MONTH], -homeSavingLog.value);
        } else {
          homeMonthlyValues[MONTH] = sumToFixed(homeMonthlyValues[MONTH], homeSavingLog.value);
        }
      }
    })


    db.each(`SELECT * FROM treasurylog WHERE date >= ${DATA_INI_MS} AND date < ${DATA_FINI_MS} AND cat = '2' and subcat = '5' ORDER BY date ASC `, (err, carSavingLog) => {
      if (err) { console.error(err.message) } else {
        const MONTH = new Date(carSavingLog.date).getMonth();
        if (carSavingLog.type === 'income') {
          carMonthlyValues[MONTH] = sumToFixed(carMonthlyValues[MONTH], -carSavingLog.value);
        } else {
          carMonthlyValues[MONTH] = sumToFixed(carMonthlyValues[MONTH], carSavingLog.value);
        }
      }
    })
  });

  db.close((err) => {

    let homeAcomulatedValues = new Array(24).fill(0);
    let carAcomulatedValues = new Array(24).fill(0);

    for (let i = 0; i < 24; i++) {

      if (i === 0) {
        homeAcomulatedValues[i] = homeMonthlyValues[i]
        carAcomulatedValues[i] = carMonthlyValues[i]
      }
      else {
        homeAcomulatedValues[i] = sumToFixed(homeAcomulatedValues[i - 1], homeMonthlyValues[i])
        carAcomulatedValues[i] = sumToFixed(carAcomulatedValues[i - 1], carMonthlyValues[i])
      }

      let MONTH = new Date(DATA_INI_MS); MONTH.setMonth(i);

      homeSnapshotArray.series.push({
        name: MONTH.toLocaleString('default', { year: 'numeric', month: 'short' }),
        value: homeAcomulatedValues[i]
      })

      carSnapshotArray.series.push({
        name: MONTH.toLocaleString('default', { year: 'numeric', month: 'short' }),
        value: carAcomulatedValues[i]
      })

    }

    err ? console.error(err.message) : res.send([homeSnapshotArray, carSnapshotArray]);
    console.log('[S1] complete');
  });

}








export function evoGraph(req, res) {
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); } console.log('[S] '); });

  let DATA_INI; let DATA_INI_MS;
  let DATA_FINI; let DATA_FINI_MS;
  let CONFIG = {}; // titulo pesquisa, cat, subcats, year, duration,
  const TITLES = {}; // títulos subcategorias
  let graphsArray = []; // array de graficos a ser enviado
  let subcatDailyValuesArray = []; // array de valores n acomulados


  (function start() {
    db.all(`SELECT * FROM graphs WHERE type = 'evo'`, (err, result) => {
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
    db.each(`SELECT id,title FROM subcategories WHERE id IN(${CONFIG.subcats.join(', ')})`, (err, result) => {
      if (err) { console.error(err.message); return res.send['MHQERROR', err.message] }
      TITLES[result['id']] = result['title'];
    })
    initialValue();
  }

  function initialValue() {

    let query = `SELECT`

    CONFIG.subcats.forEach(subcatID => {
      graphsArray.push({ name: TITLES[subcatID], series: [] });
      subcatDailyValuesArray.push(new Array(CONFIG.duration).fill(0));
      query += `
(SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND subcat = '${subcatID}' AND type = 'income') as subcat${subcatID}isum,
(SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND subcat = '${subcatID}' AND type = 'expense') as subcat${subcatID}esum,`
    });
    query = query.slice(0, -1) // remover a vírgula final skyr

    db.all(query, (err, result) => {

      if (err) { console.error(err.message); return res.send['MHQERROR', err.message] }

      CONFIG.subcats.forEach((subcatID, i) => {
        if (result[0][`subcat${subcatID}esum`] == null) { result[0][`subcat${subcatID}esum`] = 0 }
        if (result[0][`subcat${subcatID}isum`] == null) { result[0][`subcat${subcatID}esum`] = 0 }
        subcatDailyValuesArray[i][0] = sumToFixed(subcatDailyValuesArray[i][0], -result[0][`subcat${subcatID}isum`], result[0][`subcat${subcatID}esum`]);

        if (i + 1 === CONFIG.subcats.length) { graphGen(); }

      });

    });
  }


  function graphGen() {

    CONFIG.subcats.forEach((subcatID, i) => {

      db.each(`SELECT * FROM treasurylog WHERE date >= ${DATA_INI_MS} AND date < ${DATA_FINI_MS} AND subcat = '${subcatID}' ORDER BY date ASC`, (err, tlog) => {

        if (err) { console.error(err.message); return res.send['MHQERROR', err.message] }

        let MONTH = new Date(tlog.date).getMonth();
        MONTH = MONTH + (((new Date(tlog.date).getFullYear()) - CONFIG.year) * 12)
        if (tlog.type === 'income') { subcatDailyValuesArray[i][MONTH] = sumToFixed(subcatDailyValuesArray[i][MONTH], -tlog.value); }
        if (tlog.type === 'expense') { subcatDailyValuesArray[i][MONTH] = sumToFixed(subcatDailyValuesArray[i][MONTH], tlog.value); }

      });

    });
    closure();
  }

  function closure() {

    db.close((err) => {
      let subcatDailyAcomulatedValuesArray = [];

      for (let z = 0; z < CONFIG.subcats.length; z++) {
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

      if (err) { console.error(err.message); return res.send['MHQERROR', err.message] }
      res.send(graphsArray)
      console.log('[S1] complete');
    });
  }
}

export function generateCatGraphSnapshot(req, res) {

  const YEAR = req.body.year;
  const CAT_IDS = JSON.parse(req.body.cats);
  const CAT_TITLES = JSON.parse(req.body.titles);
  const CAT_OR_SUBCAT = req.body.type;

  const DATA_INI = new Date('2022-01-01T00:00:00.000Z'); DATA_INI.setFullYear(YEAR); const DATA_INI_MS = DATA_INI.getTime();
  const DATA_FINI = new Date('2022-01-01T00:00:00.000Z'); DATA_FINI.setFullYear(YEAR + 1); const DATA_FINI_MS = DATA_FINI.getTime();

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[S2] generating cat graph snapshot');
  });

  // agrupador dos snapshots
  let snapshotsArray = [];


  CAT_IDS.forEach((CAT_ID, i) => {
    snapshotsArray.push({
      name: CAT_TITLES[i],
      series: []
    });

    for (let y = 0; y < 12; y++) {

      const DATA_MENSAL_LOCALE = new Date(DATA_INI_MS); DATA_MENSAL_LOCALE.setFullYear(YEAR, y);
      snapshotsArray[i].series.push({
        name: DATA_MENSAL_LOCALE.toLocaleString('default', { month: 'short' }).slice(0, -1),
        value: 0,
      })
    }

    db.serialize(() => {
      db.each(`SELECT value, date FROM treasurylog WHERE date >= ${DATA_INI_MS} AND date < ${DATA_FINI_MS} AND ${CAT_OR_SUBCAT} = '${CAT_ID}' ORDER BY date`, (err, row) => {
        if (err) { console.error(err.message) }
        else {
          if (row.value !== null) {
            const LOG_DATE = new Date(row.date); const LOG_MONTH = LOG_DATE.getMonth();
            if (row.type === 'income') { snapshotsArray[i].series[LOG_MONTH].value = sumToFixed(snapshotsArray[i].series[LOG_MONTH].value, -row.value) }
            else { snapshotsArray[i].series[LOG_MONTH].value = sumToFixed(snapshotsArray[i].series[LOG_MONTH].value, row.value) }
          }
        }
      })
    })

  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(snapshotsArray);
    console.log('[S2] complete');
  });


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