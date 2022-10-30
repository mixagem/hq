import sqlite3 from 'sqlite3';

export function fetchBudgetLogs(req, res) {
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[B1] budgeting logs fetch');
  });

  let tlogs = [];

  db.serialize(() => {
    db.each(`SELECT * FROM budget ORDER BY date DESC`, (err, tlog) => {
      if (err) { console.error(err.message) } else {

        tlog.nif === 'true' ? tlog.nif = true : tlog.nif = false; // conversão string para boolean (o sqlite não tem colunas do tipo boolean)
        tlog.efatcheck === 'true' ? tlog.efatcheck = true : tlog.efatcheck = false; // conversão string para boolean (o sqlite não tem colunas do tipo boolean)
        tlogs.push(tlog);

      }
    });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(tlogs);
    console.log('[b1] budgeting logs fetch complete');
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
              db.run(`INSERT INTO budget (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('${TREASURY_LOG.title}', '${date.getTime()}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '${recurrencyID}', '${TREASURY_LOG.nif}', '${TREASURY_LOG.efat}')`, (err, resp) => { err ? console.error(err.message) : console.log('[b4 monthly] budget log created') });

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
              db.run(`INSERT INTO budget (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('${TREASURY_LOG.title}', '${date.getTime()}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '0', '${TREASURY_LOG.nif}', '${TREASURY_LOG.efat}')`, (err, resp) => { err ? console.error(err.message) : console.log('[b4 yearly] budget log created') });

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
      db.run(`INSERT INTO budget (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('${TREASURY_LOG.title}', '${TREASURY_LOG.date}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '0', '${TREASURY_LOG.nif}', '${TREASURY_LOG.efat}')`, (err, resp) => { err ? console.error(err.message) : console.log('[C4] budget log created') });
      db.all(`SELECT * from sqlite_sequence where name='budget'`, (err, resp) => { err ? console.error(err.message) : close(resp[0].seq) });
    });
  }

  function close(newTlogID) {
    db.close((err) => {
      err ? console.error(err.message) : res.send(newTlogID.toString());
    });
  }
}