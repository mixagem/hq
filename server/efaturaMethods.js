import sqlite3 from 'sqlite3';

export function fetchEFaturaSnapshots(req, res) {


  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[EFATURA 1] Erro ao ligar à bd'); };
    console.log('---------------------------')
    console.log('[EFATURA 1] A buscar snapshots efatura');
  });

  let eFaturas = [];
  DB.serialize(() => {
    for (let i = 1; i <= 6; i++) {
      DB.all(`SELECT SUM(value) AS sum FROM efatura WHERE efatcat='${i}'`, (err, resp) => {
        if (err) { dbErrors = true; console.log('[EFATURA 1] Erro ao carregar o valor da sequência de subcategorias'); console.error(err.message); } else {
          if (resp[0].sum === null) { eFaturas.push(0) } else { eFaturas.push(resp[0].sum) }
        }
      })
    }
  })
  DB.close((err) => {
    if (err || dbErrors) { console.error(err.message); console.log('[EFATURA 1 Erro ao encerrar a ligação à bd'); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { res.send(eFaturas); console.log('[EFATURA 1] donezo') }
  });


}


export function insertEFatura(req, res) {

  const TREASURY_LOG = JSON.parse(req.body.tlog)

  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[EFATURA 2] Erro ao ligar à bd'); };
    console.log('---------------------------')
    console.log('[EFATURA 2] A introduzior efatura');
  });

  // INSERT INTO efatura (tlogid, efatcat, value) VALUES ('${TREASURY_LOG.id}', '${TREASURY_LOG.efatcat}', '${TREASURY_LOG.value}')
  // UPDATE treasury SET efatcat = '${TREASURY_LOG.efatcat}' WHERE id = '${TREASURY_LOG.id}'

  DB.close((err) => {
    if (err || dbErrors) { console.error(err.message); console.log('[EFATURA 2 Erro ao encerrar a ligação à bd'); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { res.send(eFaturas); console.log('[EFATURA 2] donezo') }
  });


}


export function insertMultipleEFatura(req, res) {

  const TREASURY_LOG_ARRAY = JSON.parse(req.body.tlogarray)

  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[EFATURA 3] Erro ao ligar à bd'); };
    console.log('---------------------------')
    console.log('[EFATURA 3] A introduzior bue efatura');
  });

  TREASURY_LOG_ARRAY.forEach(TLOG => {
    // INSERT INTO efatura (tlogid, efatcat, value) VALUES ('${TLOG.id}', '${TLOG.efatcat}', '${TLOG.value}')
    // UPDATE treasury SET efatcat = '${TLOG.efatcat}' WHERE id = '${TLOG.id}'
  });


  DB.close((err) => {
    if (err || dbErrors) { console.error(err.message); console.log('[EFATURA 3 Erro ao encerrar a ligação à bd'); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { res.send(eFaturas); console.log('[EFATURA 3] donezo') }
  });


}







// 35% das gerasi -> max 250
// 15% da saude - > max 1000
// 15% DO IVA do restaurante -> max 250
// 15% DO IVA do ginasio -> max 250
// 15% DO IVA do cabeleireiros -> max 250
// 100% DO IVA dos passes -> max 250