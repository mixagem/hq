import sqlite3 from 'sqlite3';

export function fetchBudgetLogs(req, res) {
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[B1] budgeting logs fetch');
  });

  let tlogs = [];

  db.serialize(() => {
    db.each(`SELECT * FROM budget ORDER BY date DESC`, (err, tlog) => { err ? console.error(err.message) : tlogs.push(tlog); });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(tlogs);
    console.log('[b1] budgeting logs fetch complete');
  });
}



// ######> atualiza o movimento
export function updateBudgetLog(req, res) {
  const TREASURY_LOG = JSON.parse(req.body.budget);

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`[b3] updating budget log "${TREASURY_LOG.title}"`);
  });

  db.serialize(() => {
    db.run(`UPDATE budget SET title='${TREASURY_LOG.title}', date='${TREASURY_LOG.date}', value='${TREASURY_LOG.value}', cat='${TREASURY_LOG.cat}', subcat='${TREASURY_LOG.subcat}', type='${TREASURY_LOG.type}', obs='${TREASURY_LOG.obs}' WHERE id='${TREASURY_LOG.id}'`, (err, resp) => { err ? console.error(err.message) : console.log('[b3] budget log updated'); });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci');
  });
}

// ######> adicionar um novo movimento
export function createBudgetlog(req, res) {
  const TREASURY_LOG = JSON.parse(req.body.budget);

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`[b4] Creating new budget log => "${TREASURY_LOG.title}"`);
  });


  const RECURRENCY_OPTIONS = JSON.parse(req.body.recurrency); // active, type, freq, day

  let rMonth = new Date(TREASURY_LOG.date).getMonth();
  let rYear = new Date(TREASURY_LOG.date).getFullYear();
  console.log('mes/ano inicial: ', rMonth, rYear, RECURRENCY_OPTIONS.date)

  if (RECURRENCY_OPTIONS.active) {
    db.all(`SELECT MAX (recurrencyid) as recurrencyid from budget`, (err, resp) => { err ? console.error(err.message) : switcheroo(resp[0].recurrencyid) });
    function switcheroo(currentRecurrencyID) {
      let recurrencyID = currentRecurrencyID + 1
      let date = new Date();
      // date.setFullYear(rYear, rMonth, RECURRENCY_OPTIONS.date);

      switch (RECURRENCY_OPTIONS.type) {
        case 'm':
          for (let i = 0; i < RECURRENCY_OPTIONS.freq; i++) {
            date.setFullYear(rYear, rMonth, RECURRENCY_OPTIONS.date);
            if (rMonth === 11) { rMonth = 0; rYear++; } else { rMonth++ }


            db.serialize(() => {
              db.run(`INSERT INTO budget (title, date, value, cat, subcat, type, obs, recurrencyid) VALUES ('${TREASURY_LOG.title}', '${date.getTime()}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '${recurrencyID}')`, (err, resp) => { err ? console.error(err.message) : console.log('[b4 monthly] budget log created') });

              if (i === RECURRENCY_OPTIONS.freq - 1) {
                db.all(`SELECT * from sqlite_sequence where name='budget'`, (err, resp) => { err ? console.error(err.message) : close(resp[0].seq) });
              }
            });
          }
          break;

        case 'a':
          for (let i = 0; i < RECURRENCY_OPTIONS.freq; i++) {
            date.setFullYear((rYear + i), rMonth, RECURRENCY_OPTIONS.date);
            db.serialize(() => {
              db.run(`INSERT INTO budget (title, date, value, cat, subcat, type, obs, recurrencyid) VALUES ('${TREASURY_LOG.title}', '${date.getTime()}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '0')`, (err, resp) => { err ? console.error(err.message) : console.log('[b4 yearly] budget log created') });

              if (i === RECURRENCY_OPTIONS.freq - 1) {
                db.all(`SELECT * from sqlite_sequence where name='budget'`, (err, resp) => { err ? console.error(err.message) : close(resp[0].seq) });
              }
            });
          }
          break;
      }
    }
  }

  if (!RECURRENCY_OPTIONS.active) {
    db.serialize(() => {
      db.run(`INSERT INTO budget (title, date, value, cat, subcat, type, obs, recurrencyid) VALUES ('${TREASURY_LOG.title}', '${TREASURY_LOG.date}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '0')`, (err, resp) => { err ? console.error(err.message) : console.log('[C4] budget log created') });
      db.all(`SELECT * from sqlite_sequence where name='budget'`, (err, resp) => { err ? console.error(err.message) : close(resp[0].seq) });
    });
  }

  function close(newTlogID) {
    db.close((err) => {
      err ? console.error(err.message) : res.send(newTlogID.toString());
    });
  }
}

// ######> adicionar um novo movimento
export function getBudgetRecurencyLogs(req, res) {

  const TREASURY_LOG_ID = JSON.parse(req.body.tlogID);
  const RECURRENCY_ID = JSON.parse(req.body.recurID);

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`[b7] fetching recorrencies from id "${RECURRENCY_ID}"`);
  });

  let budgetLogsFromRecurrency = [];

  db.serialize(() => {
    db.each(`SELECT * FROM budget WHERE recurrencyid='${RECURRENCY_ID}' AND NOT id='${TREASURY_LOG_ID}' ORDER BY date DESC`, (err, resp) => { err ? console.error(err.message) : budgetLogsFromRecurrency.push(resp); });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(budgetLogsFromRecurrency);
  });
}


// ######> adicionar um novo movimento
export function updateBudgetRecurrency(req, res) {

  const TREASURY_LOG = JSON.parse(req.body.tlog);

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`[b8] updatinmg recorrencies from id "${TREASURY_LOG.recurrencyid}"`);
  });


  db.serialize(() => {
    db.run(`UPDATE budget SET title='${TREASURY_LOG.title}', value='${TREASURY_LOG.value}', cat='${TREASURY_LOG.cat}', subcat='${TREASURY_LOG.subcat}', type='${TREASURY_LOG.type}', obs='${TREASURY_LOG.obs}' WHERE recurrencyid='${TREASURY_LOG.recurrencyid}'`, (err, resp) => { err ? console.error(err.message) : []; });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci');
  });
}