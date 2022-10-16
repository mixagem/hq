import sqlite3 from 'sqlite3';

// ######> fetch à bd de todos os movimentos
export function fetchTreasuryLogs(req, res) {
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[C1] treasury logs fetch');
  });

  let tlogs = [];

  db.serialize(() => {
    db.each(`SELECT * FROM treasurylog ORDER BY date DESC`, (err, tlog) => { err ? console.error(err.message) : tlogs.push(tlog); });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(tlogs);
    console.log('[C1] treasury logs fetch complete');
  });
}

// ######> apagar o movimento da bd
export function deleteTreasuryLog(req, res) {
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`[C2] deleting treasury log nº. {${req.body.tlog}}`);
  });

  db.serialize(() => {
    db.run(`DELETE FROM treasurylog WHERE id=${req.body.tlog}`, (err, resp) => { err ? console.error(err.message) : console.log(`[C2] treasury log sucessfully deleted.`); });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci');
  });
}

// ######> atualiza o movimento
export function updateTreasuryLog(req, res) {
  const TREASURY_LOG = JSON.parse(req.body.tlog);

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`[C3] updating treasury log "${TREASURY_LOG.title}"`);
  });

  db.serialize(() => {
    db.run(`UPDATE treasurylog SET title='${TREASURY_LOG.title}', date='${TREASURY_LOG.date}', value='${TREASURY_LOG.value}', cat='${TREASURY_LOG.cat}', subcat='${TREASURY_LOG.subcat}', type='${TREASURY_LOG.type}', obs='${TREASURY_LOG.obs}' WHERE id='${TREASURY_LOG.id}'`, (err, resp) => { err ? console.error(err.message) : console.log('[C3] treasury log updated'); });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci');
  });
}

// ######> adicionar um novo movimento
export function createTreasurylog(req, res) {
  const TREASURY_LOG = JSON.parse(req.body.tlog);

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log(`[C4] Creating new treasury log => "${TREASURY_LOG.title}"`);
  });


  const RECURRENCY_OPTIONS = JSON.parse(req.body.recurrency); // active, type, freq, day

  let rMonth = new Date(TREASURY_LOG.date).getMonth();
  let rYear = new Date(TREASURY_LOG.date).getFullYear();
  console.log('mes/ano inicial: ', rMonth, rYear,RECURRENCY_OPTIONS.date)

  if (RECURRENCY_OPTIONS.active) {
    db.all(`SELECT MAX (recurrencyid) as recurrencyid from treasurylog`, (err, resp) => { err ? console.error(err.message) : switcheroo(resp[0].recurrencyid) });
    function switcheroo(currentRecurrencyID) {
      let recurrencyID = currentRecurrencyID + 1
      let date = new Date();
      date.setFullYear(rYear, rMonth, RECURRENCY_OPTIONS.date);

      switch (RECURRENCY_OPTIONS.type) {
        case 'm':
          for (let i = 0; i < RECURRENCY_OPTIONS.freq; i++) {
            if (i !== 0) {
              if (rMonth + i === 12) { rMonth = 0; rYear++; } else { rMonth++; }
              date.setFullYear(rYear, rMonth, RECURRENCY_OPTIONS.date);
            }

            db.serialize(() => {
              db.run(`INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs, recurrencyid) VALUES ('${TREASURY_LOG.title}', '${date.getTime()}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '${recurrencyID}')`, (err, resp) => { err ? console.error(err.message) : console.log('[C4 monthly] treasury log created') });

              if (i === RECURRENCY_OPTIONS.freq - 1) {
                db.all(`SELECT * from sqlite_sequence where name='treasurylog'`, (err, resp) => { err ? console.error(err.message) : close(resp[0].seq) });
              }
            });
          }
          break;

        case 'a':
          for (let i = 0; i < RECURRENCY_OPTIONS.freq; i++) {
            date.setFullYear((rYear+i), rMonth, RECURRENCY_OPTIONS.date);
            db.serialize(() => {
              db.run(`INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs, recurrencyid) VALUES ('${TREASURY_LOG.title}', '${date.getTime()}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '0')`, (err, resp) => { err ? console.error(err.message) : console.log('[C4 yearly] treasury log created') });

              if (i === RECURRENCY_OPTIONS.freq - 1) {
                db.all(`SELECT * from sqlite_sequence where name='treasurylog'`, (err, resp) => { err ? console.error(err.message) : close(resp[0].seq) });
              }
            });
          }
          break;
      }
    }
  }

  if (!RECURRENCY_OPTIONS.active) {
    db.serialize(() => {
      db.run(`INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs, recurrencyid) VALUES ('${TREASURY_LOG.title}', '${TREASURY_LOG.date}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '0')`, (err, resp) => { err ? console.error(err.message) : console.log('[C4] treasury log created') });
      db.all(`SELECT * from sqlite_sequence where name='treasurylog'`, (err, resp) => { err ? console.error(err.message) : close(resp[0].seq) });
    });
  }

  function close(newTlogID) {
    db.close((err) => {
      err ? console.error(err.message) : res.send(newTlogID.toString());
    });
  }
}