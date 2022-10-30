import sqlite3 from 'sqlite3';

// ######> fetch à bd de todos os movimentos
export function fetchTreasuryLogs(req, res) {
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[C1] treasury logs fetch');
  });

  let tlogs = [];

  db.serialize(() => {
    db.each(`SELECT * FROM treasurylog ORDER BY date DESC`, (err, tlog) => { if (err) { console.error(err.message) } else {
      tlog.nif === 'true' ? tlog.nif = true : tlog.nif = false; // conversão string para boolean (o sqlite não tem colunas do tipo boolean)
      tlog.efatcheck === 'true' ? tlog.efatcheck = true : tlog.efatcheck = false; // conversão string para boolean (o sqlite não tem colunas do tipo boolean)
      tlogs.push(tlog);
     } });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(tlogs);
    console.log('[C1] treasury logs fetch complete');
  });
}

// ######> apagar o movimento da bd
export function deleteTreasuryLog(req, res) {

  if (req.body.type === 'tlog') {

    const TREASURY_LOG = req.body.tlogID;

    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { console.error(err.message); }
      console.log(`[C2] deleting treasury log nº. {${TREASURY_LOG}}`);
    });

    db.serialize(() => {
      db.run(`DELETE FROM treasurylog WHERE id=${TREASURY_LOG}`, (err, resp) => { err ? console.error(err.message) : console.log(`[C2] treasury log sucessfully deleted.`); });
    });

    db.close((err) => {
      err ? console.error(err.message) : res.send('gucci');
    });

  }


  if (req.body.type === 'budget') {


    const BUDGET_LOG = req.body.budgetID;

    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { console.error(err.message); }
      console.log(`[C2] deleting budget log nº. {${BUDGET_LOG}}`);
    });

    db.serialize(() => {
      db.run(`DELETE FROM budget WHERE id=${BUDGET_LOG}`, (err, resp) => { err ? console.error(err.message) : console.log(`[C2] budget log sucessfully deleted.`); });
    });

    db.close((err) => {
      err ? console.error(err.message) : res.send('gucci');
    });

  }
}

// ######> atualiza o movimento
export function updateTreasuryLog(req, res) {
  if (req.body.type === 'tlog') {
    const TREASURY_LOG = JSON.parse(req.body.tlog);
    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { console.error(err.message); }
      console.log(`[C3] updating treasury log "${TREASURY_LOG.title}"`);
    });

    db.serialize(() => {
      db.run(`UPDATE treasurylog SET title='${TREASURY_LOG.title}', date='${TREASURY_LOG.date}', value='${TREASURY_LOG.value}', cat='${TREASURY_LOG.cat}', subcat='${TREASURY_LOG.subcat}', type='${TREASURY_LOG.type}', obs='${TREASURY_LOG.obs}', nif='${TREASURY_LOG.nif}', efat='${TREASURY_LOG.efat}' WHERE id='${TREASURY_LOG.id}'`, (err, resp) => { err ? console.error(err.message) : console.log('[C3] treasury log updated'); });
    });

    db.close((err) => {
      err ? console.error(err.message) : res.send('gucci');
    });
  }


  if (req.body.type === 'budget') {
    console.log('aki')
    const BUDGET_LOG = JSON.parse(req.body.budget);

    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { console.error(err.message); }
      console.log(`[C3] updating treasury log "${BUDGET_LOG.title}"`);
    });

    db.serialize(() => {
      db.run(`UPDATE budget SET title='${BUDGET_LOG.title}', date='${BUDGET_LOG.date}', value='${BUDGET_LOG.value}', cat='${BUDGET_LOG.cat}', subcat='${BUDGET_LOG.subcat}', type='${BUDGET_LOG.type}', obs='${BUDGET_LOG.obs}', nif='${BUDGET_LOG.nif}', efat='${BUDGET_LOG.efat}' WHERE id='${BUDGET_LOG.id}'`, (err, resp) => { err ? console.error(err.message) : console.log('[C3] treasury log updated'); });
    });

    db.close((err) => {
      err ? console.error(err.message) : res.send('gucci');
    });
  }
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
  console.log('mes/ano inicial: ', rMonth, rYear, RECURRENCY_OPTIONS.date)

  if (RECURRENCY_OPTIONS.active) {
    db.all(`SELECT MAX (recurrencyid) as recurrencyid from treasurylog`, (err, resp) => { err ? console.error(err.message) : switcheroo(resp[0].recurrencyid) });
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
              db.run(`INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('${TREASURY_LOG.title}', '${date.getTime()}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '${recurrencyID}', '${TREASURY_LOG.nif}', '${TREASURY_LOG.efat}')`, (err, resp) => { err ? console.error(err.message) : console.log('[C4 monthly] treasury log created') });

              if (i === RECURRENCY_OPTIONS.freq - 1) {
                db.all(`SELECT * from sqlite_sequence where name='treasurylog'`, (err, resp) => { err ? console.error(err.message) : close(resp[0].seq) });
              }
            });
          }
          break;

        case 'a':
          for (let i = 0; i < RECURRENCY_OPTIONS.freq; i++) {
            date.setFullYear((rYear + i), rMonth, RECURRENCY_OPTIONS.date);
            db.serialize(() => {
              db.run(`INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('${TREASURY_LOG.title}', '${date.getTime()}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '0', '${BUDGET_LOG.nif}', '${BUDGET_LOG.efat}')`, (err, resp) => { err ? console.error(err.message) : console.log('[C4 yearly] treasury log created') });

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
      db.run(`INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('${TREASURY_LOG.title}', '${TREASURY_LOG.date}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '0', '${TREASURY_LOG.nif}', '${TREASURY_LOG.efat}' )`, (err, resp) => { err ? console.error(err.message) : console.log('[C4] treasury log created') });
      db.all(`SELECT * from sqlite_sequence where name='treasurylog'`, (err, resp) => { err ? console.error(err.message) : close(resp[0].seq) });
    });
  }

  function close(newTlogID) {
    db.close((err) => {
      err ? console.error(err.message) : res.send(newTlogID.toString());
    });
  }
}

// ######> adicionar um novo movimento
export function getRecurencyLogs(req, res) {

  if (req.body.type === 'tlog') {
    const TREASURY_LOG_ID = JSON.parse(req.body.tlogID);
    const RECURRENCY_ID = JSON.parse(req.body.recurID);

    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { console.error(err.message); }
      console.log(`[C7] fetching recorrencies from id "${RECURRENCY_ID}"`);
    });

    let tLogsFromRecurrency = [];

    db.serialize(() => {
      db.each(`SELECT * FROM treasurylog WHERE recurrencyid='${RECURRENCY_ID}' AND NOT id='${TREASURY_LOG_ID}' ORDER BY date DESC`, (err, resp) => { err ? console.error(err.message) : tLogsFromRecurrency.push(resp); });
    });

    db.close((err) => {
      err ? console.error(err.message) : res.send(tLogsFromRecurrency);
    });
  }

  if (req.body.type === 'budget') {
    const BUDGET_LOG_ID = JSON.parse(req.body.budgetID);
    const RECURRENCY_ID = JSON.parse(req.body.recurID);

    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { console.error(err.message); }
      console.log(`[C7] fetching recorrencies from id "${RECURRENCY_ID}"`);
    });

    let tLogsFromRecurrency = [];

    db.serialize(() => {
      db.each(`SELECT * FROM budget WHERE recurrencyid='${RECURRENCY_ID}' AND NOT id='${BUDGET_LOG_ID}' ORDER BY date DESC`, (err, resp) => { err ? console.error(err.message) : tLogsFromRecurrency.push(resp); });
    });

    db.close((err) => {
      err ? console.error(err.message) : res.send(tLogsFromRecurrency);
    });
  }
}


// ######> adicionar um novo movimento
export function updateRecurrency(req, res) {


  if (req.body.type === 'tlog') {
    const TREASURY_LOG = JSON.parse(req.body.tlog);
    const FIELDS_TO_UPDATE = JSON.parse(req.body.fields);

    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { console.error(err.message); }
      console.log(`[C8] updatinmg recorrencies from id "${TREASURY_LOG.recurrencyid}"`);
    });

    const QUERY = `UPDATE treasurylog SET`;
    let queryExtra = ``;
    FIELDS_TO_UPDATE.forEach((FIELD,i )=> {
      if(i===0){queryExtra += ` ${FIELD}='${TREASURY_LOG[FIELD]}'`}
      else {queryExtra += `, ${FIELD}='${TREASURY_LOG[FIELD]}'`}

    });
    queryExtra += ` WHERE recurrencyid='${TREASURY_LOG.recurrencyid}'`;
    db.serialize(() => {
      db.run(`${QUERY}${queryExtra}`, (err, resp) => { err ? console.error(err.message) : []; });
    });

    db.close((err) => {
      err ? console.error(err.message) : res.send('gucci');
    });
  }

  if (req.body.type === 'budget') {
    const BUDGET_LOG = JSON.parse(req.body.budget);

    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { console.error(err.message); }
      console.log(`[C8] updatinmg recorrencies from id "${BUDGET_LOG.recurrencyid}"`);
    });


    db.serialize(() => {
      db.run(`UPDATE budget SET title='${BUDGET_LOG.title}', value='${BUDGET_LOG.value}', cat='${BUDGET_LOG.cat}', subcat='${BUDGET_LOG.subcat}', type='${BUDGET_LOG.type}', obs='${BUDGET_LOG.obs}', nif='${BUDGET_LOG.nif}' WHERE recurrencyid='${BUDGET_LOG.recurrencyid}'`, (err, resp) => { err ? console.error(err.message) : []; });
    });

    db.close((err) => {
      err ? console.error(err.message) : res.send('gucci');
    });
  }
}


export function dettachRecurrency(req, res) {

  if (req.body.type === 'tlog') {
    const TREASURY_LOG = JSON.parse(req.body.tlog);

    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { console.error(err.message); }
      console.log(`[C9] detaching movimento from recurrency "${TREASURY_LOG.recurrencyid}"`);
    });

    db.serialize(() => {
      db.run(`UPDATE treasurylog SET recurrencyid='0' WHERE id='${TREASURY_LOG.id}'`, (err, resp) => { err ? console.error(err.message) : []; });
    });

    db.close((err) => {
      err ? console.error(err.message) : res.send('gucci');
    });
  }

  if (req.body.type === 'budget') {
    const BUDGET_LOG = JSON.parse(req.body.budget);

    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { console.error(err.message); }
      console.log(`[C9] detaching orçamento from recurrency "${BUDGET_LOG.recurrencyid}"`);
    });

    db.serialize(() => {
      db.run(`UPDATE budget SET recurrencyid='0' WHERE id='${BUDGET_LOG.id}'`, (err, resp) => { err ? console.error(err.message) : []; });
    });

    db.close((err) => {
      err ? console.error(err.message) : res.send('gucci');
    });
  }



}

export function deleteAllRecurrencies(req, res) {

  if (req.body.type === 'tlog') {
    const TREASURY_LOG_RECURRENCY_ID = Number(req.body.recurrencyID);

    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { console.error(err.message); }
      console.log(`[C10] deletting all movments from recorrency from "${TREASURY_LOG_RECURRENCY_ID}"`);
    });

    db.serialize(() => {
      db.run(`DELETE from treasurylog WHERE recurrencyid='${TREASURY_LOG_RECURRENCY_ID}'`, (err, resp) => { err ? console.error(err.message) : []; });
    });

    db.close((err) => {
      err ? console.error(err.message) : res.send('gucci');
    });
  }

  if (req.body.type === 'budget') {
    const BUDGET_LOG_RECURRENCY_ID = Number(req.body.recurrencyID);

    let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { console.error(err.message); }
      console.log(`[C10] deletting all orçamentos from recorrency from "${BUDGET_LOG_RECURRENCY_ID}"`);
    });

    db.serialize(() => {
      db.run(`DELETE from budget WHERE recurrencyid='${BUDGET_LOG_RECURRENCY_ID}'`, (err, resp) => { err ? console.error(err.message) : []; });
    });

    db.close((err) => {
      err ? console.error(err.message) : res.send('gucci');
    });
  }

}
