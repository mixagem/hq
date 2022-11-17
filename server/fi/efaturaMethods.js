import sqlite3 from 'sqlite3';

export function fetchEFaturaSnapshots(req, res) {

  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[EFAT 1] Erro ao ligar à bd'); };
    console.log('---------------------------')
    console.log('[EFAT 1] A gerar snapshots efatura');
  });

  let eFaturas = [];
  DB.serialize(() => {
    for (let i = 1; i <= 12; i++) {
      DB.all(`SELECT SUM(value) AS sum FROM efatura WHERE efatcat='${i}'`, (err, resp) => {
        if (err) { dbErrors = true; console.log('[EFAT 1] Erro ao gerar snapshots efatura'); console.error(err.message); } else {
          if (resp[0].sum === null) { eFaturas.push(0) } else { eFaturas.push(resp[0].sum) }
        }
      })
    }
  })

  DB.close((err) => {
    if (err || dbErrors) { console.error(err.message); console.log('[EFAT 1 Erro ao encerrar a ligação à bd'); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { res.send(eFaturas); console.log('[EFAT 1] Snapshots efatura gerados com sucesso') }
  });

}

export function insertEFatura(req, res) {

  let EFATURA; try { EFATURA = JSON.parse(req.body.efatura); } catch { console.log('[EFAT 2] Erro ao fazer parse da efatura'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }

  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[EFAT 2] Erro ao ligar à bd'); };
    console.log('---------------------------')
    console.log('[EFAT 2] A introduzir efatura');
  });


  DB.all(`INSERT INTO efatura (tlogid, efatcat, value, year) VALUES ('${EFATURA.tlogid}', '${EFATURA.efat}', '${EFATURA.value}', '${EFATURA.year}')`, (err, resp) => {
    if (err) { dbErrors = true; console.log('[EFAT 2] Erro ao introduzir efatura'); console.error(err.message); }
    updateTLog();
  });

  function updateTLog() {
    DB.all(`UPDATE treasurylog SET efatcheck = 'true' WHERE id = '${EFATURA.tlogid}'`, (err, resp) => {
      if (err) { dbErrors = true; console.log('[EFAT 2] Erro ao atualizar o estado do movimento'); console.error(err.message); }
    });

    DB.close((err) => {
      if (err || dbErrors) { console.error(err.message); console.log('[EFAT 2 Erro ao encerrar a ligação à bd'); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
      else { res.send([`O movimento <b>${EFATURA.tlogtitle}</b> foi validado com sucesso.`]); console.log('[EFAT 2] Movimento => ' + EFATURA.tlogid + ' validado com sucesso') }
    });
  }

}

export function movmentsNotValidated(req, res) {

  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[EFAT 4] Erro ao ligar à bd'); };
    console.log('---------------------------')
    console.log('[EFAT 4] A obter faturas não validadas');
  });

  let movmentsArray = []
  DB.each(`SELECT * FROM treasurylog WHERE nif='true' AND efatcheck='false'`, (err, tlog) => {

    if (err) { dbErrors = true; console.log('[EFAT 4] Erro ao obter faturas não validadas'); console.error(err.message); }
    movmentsArray.push(tlog)
  });

  DB.close((err) => {
    if (err || dbErrors) { console.error(err.message); console.log('[EFAT 4 Erro ao encerrar a ligação à bd'); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { res.send(movmentsArray); console.log('[EFAT 4] Foram encontradaos => '+movmentsArray.length+' movimentos para validar.') }
  });
}


export function visibleEfatCats(req, res) {

  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[EFAT 5] Erro ao ligar à bd'); };
    console.log('---------------------------')
    console.log('[EFAT 5] ');
  });

  let efatcats;
  DB.each(`SELECT value FROM settings WHERE desc='efatcats'`, (err, efatcatsarray) => {

    if (err) { dbErrors = true; console.log('[EFAT 5] '); console.error(err.message); }
    efatcats = JSON.parse(efatcatsarray["value"]);
  });

  DB.close((err) => {
    if (err || dbErrors) { console.error(err.message); console.log('[EFAT 5 Erro ao encerrar a ligação à bd'); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { res.send(efatcats); console.log('[EFAT 5] ') }
  });
}
