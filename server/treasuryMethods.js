import sqlite3 from 'sqlite3';

// ######> fetch à bd de todos os movimentos
export function fetchTreasuryLogs(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Fetching treasury logs...');
  });

  let tlogs = [];

  db.serialize(() => {
    db.each(`SELECT * FROM treasurylog ORDER BY id DESC`, (err, tlog) => { err ? console.error(err.message) : tlogs.push(tlog); });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(tlogs);
    console.log('Fetch complete.');
  });
}


// ######> apagar o movimento da bd
export function deleteTreasuryLog(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Deleting treasury log...');
  });

  db.serialize(() => {
    db.run(`DELETE FROM treasurylog WHERE id=${req.body.tlog}`, (err, resp) => { err ? console.error(err.message) : console.log('Treasury log sucessfully deleted.'); });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci');
  });

}


// ######> atualiza o movimento
export function updateTreasuryLog(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Updating treasury log...');
  });

  const tlog = JSON.parse(req.body.tlog);

  db.serialize(() => {
    db.run(`UPDATE treasurylog SET title='${tlog.title}', date='${tlog.date}', value='${tlog.value}', cat='${tlog.cat}', subcat='${tlog.subcat}', type='${tlog.type}', obs='${tlog.obs}' WHERE id='${tlog.id}'`, (err, resp) => { err ? console.error(err.message) : console.log('Treasury log sucessfully updated.'); });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci');
  });
}


// ######> adicionar um novo movimento
export function addNewTreasurylog(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Creating new treasury log...');
  });

  const tlog = JSON.parse(req.body.tlog);



  db.serialize(() => {

    db.run(`INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs) VALUES ('${tlog.title}', '${tlog.date}', '${tlog.value}', '${tlog.cat}', '${tlog.subcat}', '${tlog.type}', '${tlog.obs}')`, (err, resp) => { err ? console.error(err.message) : console.log('Treasury log sucessfully created.') });
    db.all(`SELECT * from sqlite_sequence where name='treasurylog'`, (err, resp) => { err ? console.error(err.message) : close(resp[0].seq) });

  });

  function close(newTlogID) {
    console.log(newTlogID)
    db.close((err) => {
      err ? console.error(err.message) : res.send(newTlogID.toString());
    });
  }

}