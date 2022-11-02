import sqlite3 from 'sqlite3';

// ######> fetch à bd de todos os movimentos
export function fetchTreasuryLogs(req, res) {
  console.log('---------------------------');
  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 1] Erro ao ligar à bd'); };
    console.log('[TRE 1] A carregar movimentos de tesouraria');
  });

  let tlogs = [];

  DB.serialize(() => {
    DB.each(`SELECT * FROM treasurylog ORDER BY date DESC`, (err, tlog) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[TRE 1] Erro ao carregar movimentos'); } else {
        tlog.nif === 'true' ? tlog.nif = true : tlog.nif = false; // conversão string para boolean (o sqlite não tem colunas do tipo boolean)
        tlog.efatcheck === 'true' ? tlog.efatcheck = true : tlog.efatcheck = false; // conversão string para boolean (o sqlite não tem colunas do tipo boolean)
        tlogs.push(tlog);
      }
    });
  });

  DB.close((err) => {
    if (err || dbErrors) { console.error(err.message); console.log('[CAT 1] Erro ao encerrar a ligação à bd'); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { res.send(tlogs); console.log('[TRE 1] => ' + tlogs.length + ' movimentos carregados com sucesso'); }
  });
}


export function fetchBudgetLogs(req, res) {
  console.log('---------------------------');
  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[BUD 1] Erro ao ligar à bd'); };
    console.log('[BUD 1] A carregar orçamentos de tesouraria');
  });

  let budgets = [];

  DB.serialize(() => {
    DB.each(`SELECT * FROM budget ORDER BY date DESC`, (err, budget) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[BUD 1] Erro ao carregar orçamentos'); } else {

        budget.nif === 'true' ? budget.nif = true : budget.nif = false; // conversão string para boolean (o sqlite não tem colunas do tipo boolean)
        budget.efatcheck === 'true' ? budget.efatcheck = true : budget.efatcheck = false; // conversão string para boolean (o sqlite não tem colunas do tipo boolean)
        budgets.push(budget);
      }
    });
  });

  DB.close((err) => {
    if (err || dbErrors) { console.error(err.message); console.log('[BUD 1] Erro ao encerrar a ligação à bd'); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { res.send(budgets); console.log('[BUD 1] => ' + budgets.length + ' orçamentos carregados com sucesso'); }
  });
}

// ######> apagar o movimento da bd
export function deleteTreasuryLog(req, res) {

  if (req.body.type === 'tlog') {

    const TREASURY_LOG_ID = req.body.tlogID;

    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[TRE 2] Erro ao ligar à bd'); };
      console.log('---------------------------');
      console.log(`[TRE 2] A eliminar o movimento => ${TREASURY_LOG_ID}`);
    });

    DB.serialize(() => {
      DB.run(`DELETE FROM treasurylog WHERE id=${TREASURY_LOG_ID}`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log('[TRE 2] Erro ao apagar movimentos'); }
      });

      DB.close((err) => {
        if (err || dbErrors) { console.log('[TRE 2] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); } else {
          console.log('[TRE 2] Movimento => "' + TREASURY_LOG_ID + '" eliminado com sucesso'); res.send(['O movimento <b># ' + TREASURY_LOG_ID + '</b> foi eliminado com sucesso.'])
        }
      });
    });
  }

  if (req.body.type === 'budget') {

    const BUDGET_LOG = req.body.budgetID;

    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[BUD 2] Erro ao ligar à bd'); };
      console.log('---------------------------');
      console.log(`[BUD 2] A eliminar o orçamento => {${BUDGET_LOG}}`);
    });

    DB.serialize(() => {
      DB.run(`DELETE FROM budget WHERE id=${BUDGET_LOG}`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log('[BUD 2] Erro ao apagar orçamentos'); }
      });

      DB.close((err) => {
        if (err || dbErrors) { console.log('[BUD 2] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); } else {
          console.log('[BUD 2] Orçamento => "' + CATEGORY.title + '" eliminado com sucesso'); res.send(['O orçamento <b># ' + CATEGORY.title + '</b> foi eliminado com sucesso.'])
        }
      });
    });
  }

}

// ######> atualiza o movimento
export function updateTreasuryLog(req, res) {
  console.log('---------------------------');

  if (req.body.type === 'tlog') {
    let TREASURY_LOG; try { TREASURY_LOG = JSON.parse(req.body.tlog); } catch { console.log('[TRE 3] Erro ao fazer parse do movimento'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }

    console.log(`[TRE 3] A atualizar o movimento => ${TREASURY_LOG.id}`);

    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[TRE 3] Erro ao ligar à bd'); };
    });

    DB.serialize(() => {
      DB.run(`UPDATE treasurylog SET title='${TREASURY_LOG.title}', date='${TREASURY_LOG.date}', value='${TREASURY_LOG.value}', cat='${TREASURY_LOG.cat}', subcat='${TREASURY_LOG.subcat}', type='${TREASURY_LOG.type}', obs='${TREASURY_LOG.obs}', nif='${TREASURY_LOG.nif}', efat='${TREASURY_LOG.efat}' WHERE id='${TREASURY_LOG.id}'`, (err, resp) => {
        if (err) { dbErrors = true; console.log('[TRE 3] Erro ao atualizar o movimento'); console.error(err.message); };
      });
    });

    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[TRE 3] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else { res.send(['O movimento <b>' + TREASURY_LOG.title + '</b> foi atualizado com sucesso.']); console.log('[TRE 3] Movimento => ' + TREASURY_LOG.id + ' atualizado com sucesso') }
    });
  }

  if (req.body.type === 'budget') {
    let BUDGET_LOG; try { BUDGET_LOG = JSON.parse(req.body.tlog); } catch { console.log('[BUD 3] Erro ao fazer parse do orçamento'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }
    console.log(`[BUD 3] A atualizar o orçamento => ${BUDGET_LOG.id}`);

    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[BUD 3] Erro ao ligar à bd'); };


    });

    DB.serialize(() => {
      DB.run(`UPDATE budget SET title='${BUDGET_LOG.title}', date='${BUDGET_LOG.date}', value='${BUDGET_LOG.value}', cat='${BUDGET_LOG.cat}', subcat='${BUDGET_LOG.subcat}', type='${BUDGET_LOG.type}', obs='${BUDGET_LOG.obs}', nif='${BUDGET_LOG.nif}', efat='${BUDGET_LOG.efat}' WHERE id='${BUDGET_LOG.id}'`, (err, resp) => {
        if (err) { dbErrors = true; console.log('[BUD 3] Erro ao atualizar o orçamento'); console.error(err.message); };
      });
    });

    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[BUD 3] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else { res.send(['O orçamento <b>' + BUDGET_LOG.id + '</b> foi atualizado com sucesso.']); console.log('[BUD 3] Orçamento => ' + BUDGET_LOG.id + ' atualizado com sucesso') }
    });
  }
}

// ######> adicionar um novo movimento
export function createTreasurylog(req, res) {
  console.log('---------------------------');

  let TREASURY_LOG; try { TREASURY_LOG = JSON.parse(req.body.tlog); } catch { console.log('[TRE 4] Erro ao fazer parse do movimento'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }
  let RECURRENCY_OPTIONS; try { RECURRENCY_OPTIONS = JSON.parse(req.body.recurrency); } catch { console.log('[TRE 4] Erro ao fazer parse das opções de recorrência'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }

  let rMonth = new Date(TREASURY_LOG.date).getMonth();
  let rYear = new Date(TREASURY_LOG.date).getFullYear();

  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[TRE 4] Erro ao ligar à bd'); };
  });


  if (RECURRENCY_OPTIONS.active) {

    DB.all(`SELECT MAX (recurrencyid) as recurrencyid from treasurylog`, (err, resp) => {
      if (err) { dbErrors = true; console.error(err.message); console.log(`[TRE 4] Erro ao ligar à bd'`); };
      switcheroo(resp[0].recurrencyid);
    });

    function switcheroo(currentRecurrencyID) {
      let recurrencyID = currentRecurrencyID + 1
      let date = new Date();

      switch (RECURRENCY_OPTIONS.type) {
        case 'm':
          for (let i = 0; i < RECURRENCY_OPTIONS.freq; i++) {
            date.setFullYear(rYear, rMonth, RECURRENCY_OPTIONS.date);
            if (rMonth === 11) { rMonth = 0; rYear++; } else { rMonth++ }

            DB.run(`INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('${TREASURY_LOG.title}', '${date.getTime()}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '${recurrencyID}', '${TREASURY_LOG.nif}', '${TREASURY_LOG.efat}')`, (err, resp) => {
              if (err) { dbErrors = true; console.error(err.message); console.log(`[TRE 4] Erro ao ligar à bd'`); }
              else { console.log(`[TRE 4] Recorrência mensal criada => loop: ${i + 1}`); }

              if (i === RECURRENCY_OPTIONS.freq - 1) {
                DB.all(`SELECT * from sqlite_sequence where name='treasurylog'`, (err, resp) => {
                  if (err) { dbErrors = true; console.error(err.message); console.log(`[TRE 4] Erro ao ligar à bd'`); }
                  close(resp[0].seq)
                });
              }
            });
          } break;

        case 'a':
          for (let i = 0; i < RECURRENCY_OPTIONS.freq; i++) {
            date.setFullYear((rYear + i), rMonth, RECURRENCY_OPTIONS.date);

            DB.run(`INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('${TREASURY_LOG.title}', '${date.getTime()}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '${recurrencyID}', '${TREASURY_LOG.nif}', '${TREASURY_LOG.efat}')`, (err, resp) => {
              if (err) { dbErrors = true; console.error(err.message); console.log(`[TRE 4] Erro ao ligar à bd'`); }
              else { console.log(`[TRE 4] Recorrência anual criada => loop: ${i + 1}`); }


              if (i === RECURRENCY_OPTIONS.freq - 1) {
                DB.all(`SELECT * from sqlite_sequence where name='treasurylog'`, (err, resp) => {
                  if (err) { dbErrors = true; console.error(err.message); console.log(`[TRE 4] Erro ao ligar à bd'`); }
                  close(resp[0].seq)
                });
              }
            });
          } break;

      }
    }
  }


  if (!RECURRENCY_OPTIONS.active) {
    DB.serialize(() => {

      DB.run(`INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('${TREASURY_LOG.title}', '${TREASURY_LOG.date}', '${TREASURY_LOG.value}', '${TREASURY_LOG.cat}', '${TREASURY_LOG.subcat}', '${TREASURY_LOG.type}', '${TREASURY_LOG.obs}', '0', '${TREASURY_LOG.nif}', '${TREASURY_LOG.efat}' )`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log(`[TRE 4] Erro ao ligar à bd'`); }
        else { console.log('[TRE 4] Movimento criado com sucesso') }
      });

      DB.all(`SELECT * from sqlite_sequence where name='treasurylog'`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log(`[TRE 4] Erro ao ligar à bd'`); }
        else { close(resp[0].seq) }
      });

    });
  }

  function close(newTlogID) {

    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[TRE 4] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else { res.send([newTlogID, 'O movimento <b>' + TREASURY_LOG.title + '</b> foi criado com sucesso.']); console.log('[TRE 4] Movimento => ' + TREASURY_LOG.title + ' criado com sucesso') }
    });

  }
}


export function createBudgetlog(req, res) {
  console.log('---------------------------');

  let BUDGET_LOG; try { BUDGET_LOG = JSON.parse(req.body.budget); } catch { console.log('[TRE 4] Erro ao fazer parse do movimento'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }
  let RECURRENCY_OPTIONS; try { RECURRENCY_OPTIONS = JSON.parse(req.body.recurrency); } catch { console.log('[BUD 4] Erro ao fazer parse das opções de recorrência'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }


  let rMonth = new Date(TREASURY_LOG.date).getMonth();
  let rYear = new Date(TREASURY_LOG.date).getFullYear();

  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[BUD 4] Erro ao ligar à bd'); };
  });


  if (RECURRENCY_OPTIONS.active) {

    DB.all(`SELECT MAX (recurrencyid) as recurrencyid from budget`, (err, resp) => { err ? console.error(err.message) : switcheroo(resp[0].recurrencyid) });
    function switcheroo(currentRecurrencyID) {
      let recurrencyID = currentRecurrencyID + 1
      let date = new Date();
      // date.setFullYear(rYear, rMonth, RECURRENCY_OPTIONS.date);

      switch (RECURRENCY_OPTIONS.type) {
        case 'm':
          for (let i = 0; i < RECURRENCY_OPTIONS.freq; i++) {
            date.setFullYear(rYear, rMonth, RECURRENCY_OPTIONS.date);
            if (rMonth === 11) { rMonth = 0; rYear++; } else { rMonth++ }

            DB.run(`INSERT INTO budget (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('${BUDGET_LOG.title}', '${date.getTime()}', '${BUDGET_LOG.value}', '${BUDGET_LOG.cat}', '${BUDGET_LOG.subcat}', '${BUDGET_LOG.type}', '${BUDGET_LOG.obs}', '${recurrencyID}', '${BUDGET_LOG.nif}', '${BUDGET_LOG.efat}')`, (err, resp) => {
              if (err) { dbErrors = true; console.error(err.message); console.log(`[BUD 4] Erro ao ligar à bd'`); }
              else { console.log(`[BUD 4] Recorrência mensal criada => loop: ${i + 1}`); };

              if (i === RECURRENCY_OPTIONS.freq - 1) {
                DB.all(`SELECT * from sqlite_sequence where name='budget'`, (err, resp) => {
                  if (err) { dbErrors = true; console.error(err.message); console.log(`[BUD 4] Erro ao ligar à bd'`); }
                  close(resp[0].seq)
                });
              }
            });
          } break;

        case 'a':
          for (let i = 0; i < RECURRENCY_OPTIONS.freq; i++) {
            date.setFullYear((rYear + i), rMonth, RECURRENCY_OPTIONS.date);

            DB.run(`INSERT INTO budget (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('${BUDGET_LOG.title}', '${date.getTime()}', '${BUDGET_LOG.value}', '${BUDGET_LOG.cat}', '${BUDGET_LOG.subcat}', '${BUDGET_LOG.type}', '${BUDGET_LOG.obs}', '0', '${BUDGET_LOG.nif}', '${BUDGET_LOG.efat}')`, (err, resp) => {

              if (err) { dbErrors = true; console.error(err.message); console.log(`[BUD 4] Erro ao ligar à bd'`); }
              else { console.log(`[BUD 4] Recorrência anual criada => loop: ${i + 1}`); }

              if (i === RECURRENCY_OPTIONS.freq - 1) {
                DB.all(`SELECT * from sqlite_sequence where name='budget'`, (err, resp) => {
                  if (err) { dbErrors = true; console.error(err.message); console.log(`[BUD 4] Erro ao ligar à bd'`); }
                  close(resp[0].seq)
                });
              }
            });
          }
          break;
      }
    }
  }

  if (!RECURRENCY_OPTIONS.active) {
    DB.serialize(() => {

      DB.run(`INSERT INTO budget (title, date, value, cat, subcat, type, obs, recurrencyid, nif, efat) VALUES ('${BUDGET_LOG.title}', '${BUDGET_LOG.date}', '${BUDGET_LOG.value}', '${BUDGET_LOG.cat}', '${BUDGET_LOG.subcat}', '${BUDGET_LOG.type}', '${BUDGET_LOG.obs}', '0', '${BUDGET_LOG.nif}', '${BUDGET_LOG.efat}')`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log(`[BUD 4] Erro ao ligar à bd'`); }
        else { console.log('[BUD 4] Orçamento criado com sucesso') }
      });
      DB.all(`SELECT * from sqlite_sequence where name='budget'`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log(`[BUD 4] Erro ao ligar à bd'`); }
        else { close(resp[0].seq) }
      });
    });
  }

  function close(newBudgetID) {
    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[TRE 4] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else { res.send([newBudgetID, 'O orçamento <b>' + BUDGET_LOG.title + '</b> foi criado com sucesso.']); console.log('[TRE 4] Orçamento => ' + BUDGET_LOG.title + ' criado com sucesso') }
    });
  }
}

// ######> adicionar um novo movimento
export function getRecurencyLogs(req, res) {

  console.log('---------------------------');

  if (req.body.type === 'tlog') {
    const TREASURY_LOG_ID = req.body.tlogID;
    const RECURRENCY_ID = req.body.recurID;

    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log(`[TRE 5] Erro ao ligar à bd'`); }
      console.log(`[TRE 5] A carregar movimentos com da recorrência => "${RECURRENCY_ID}"`);
    });

    let tLogsFromRecurrency = [];

    DB.serialize(() => {
      DB.each(`SELECT * FROM treasurylog WHERE recurrencyid='${RECURRENCY_ID}' AND NOT id='${TREASURY_LOG_ID}' ORDER BY date DESC`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log(`[TRE 5] Erro ao ligar à bd'`); }
        tLogsFromRecurrency.push(resp);
      });
    });

    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[TRE 5] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      }
      else { res.send(tLogsFromRecurrency); }
    });
  }

  if (req.body.type === 'budget') {

    const BUDGET_LOG_ID = req.body.budgetID;
    const RECURRENCY_ID = req.body.recurID;

    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log(`[BUD 5] Erro ao ligar à bd'`); }
      console.log(`[BUD 5] A carregar orçamentos com da recorrência => "${RECURRENCY_ID}"`);
    });

    let tLogsFromRecurrency = [];

    DB.serialize(() => {
      DB.each(`SELECT * FROM budget WHERE recurrencyid='${RECURRENCY_ID}' AND NOT id='${BUDGET_LOG_ID}' ORDER BY date DESC`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log(`[BUD 5] Erro ao ligar à bd'`); }
        tLogsFromRecurrency.push(resp);
      });
    });

    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[BUD 5] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      }
      else { res.send(tLogsFromRecurrency); }
    });
  }
}

// ######> adicionar um novo movimento
export function updateRecurrency(req, res) {

  console.log('---------------------------');

  if (req.body.type === 'tlog') {

    let TREASURY_LOG; try { TREASURY_LOG = JSON.parse(req.body.tlog); } catch { console.log('[TRE 6] Erro ao fazer parse do movimento'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }
    let FIELDS_TO_UPDATE; try { FIELDS_TO_UPDATE = JSON.parse(req.body.fields); } catch { console.log('[TRE 6] Erro ao fazer parse dos campos a atualizar'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }

    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[TRE 6] Erro ao ligar à bd'); }
      console.log(`[TRE 6] A atualizar as recorrências com o id => ${TREASURY_LOG.recurrencyid}`);
    });

    const QUERY = `UPDATE treasurylog SET`;
    let queryExtra = ``;
    FIELDS_TO_UPDATE.forEach((FIELD, i) => {
      if (i === 0) { queryExtra += ` ${FIELD}='${TREASURY_LOG[FIELD]}'` }
      else { queryExtra += `, ${FIELD}='${TREASURY_LOG[FIELD]}'` }
    });
    queryExtra += ` WHERE recurrencyid='${TREASURY_LOG.recurrencyid}'`;
    console.log(QUERY+queryExtra)
    DB.serialize(() => {
      DB.run(`${QUERY}${queryExtra}`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log('[TRE 6] Erro ao ligar à bd'); }
      });
    });

    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[TRE 6] Erro ao terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else { res.send(['Foram atualizados <b>todos</b> os movimentos da recorrência.']) }
    });
  }

  if (req.body.type === 'budget') {

    let BUDGET_LOG; try { BUDGET_LOG = JSON.parse(req.body.budget); } catch { console.log('[BUD 6] Erro ao fazer parse do orçamento'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }
    let FIELDS_TO_UPDATE; try { FIELDS_TO_UPDATE = JSON.parse(req.body.fields); } catch { console.log('[BUD 6] Erro ao fazer parse dos campos a atualizar'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }

    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[BUD 6] Erro ao ligar à bd'); }
      console.log(`[BUD 6] A atualizar as recorrências com o id => ${BUDGET_LOG.recurrencyid}`);
    });

    const QUERY = `UPDATE budget SET`;
    let queryExtra = ``;
    FIELDS_TO_UPDATE.forEach((FIELD, i) => {
      if (i === 0) { queryExtra += ` ${FIELD}='${BUDGET_LOG[FIELD]}'` }
      else { queryExtra += `, ${FIELD}='${BUDGET_LOG[FIELD]}'` }
    });
    queryExtra += ` WHERE recurrencyid='${BUDGET_LOG.recurrencyid}'`;

    DB.serialize(() => {
      DB.run(`${QUERY}${queryExtra}`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log('[BUD 6] Erro ao ligar à bd'); }
      });
    });

    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[BUD 6] Erro ao terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else { res.send(['Foram atualizados <b>todos</b> os orçamentos da recorrência.']) }
    });
  }
}

export function dettachRecurrency(req, res) {
  console.log('---------------------------');
  if (req.body.type === 'tlog') {

    let TREASURY_LOG; try { TREASURY_LOG = JSON.parse(req.body.tlog); } catch { console.log('[TRE 7] Erro ao fazer parse do movimento'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }

    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[TRE 7] Erro ao ligar à bd'); }
      console.log(`[TRE 7] A remover movimento => ${TREASURY_LOG.id} da recorrência => ${TREASURY_LOG.recurrencyid}`);
    });

    DB.serialize(() => {
      DB.run(`UPDATE treasurylog SET recurrencyid='0' WHERE id='${TREASURY_LOG.id}'`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log('[TRE 7] Erro ao ligar à bd'); }
      });
    });

    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[TRE 7] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else { res.send(['O movimento <b>' + TREASURY_LOG.title + '</b> foi desancorado da recorrência com sucesso.']); console.log('[TRE 7] Movimento => ' + TREASURY_LOG.id + ' removido da recorrência => ' + TREASURY_LOG.recurrencyid + ' com sucesso') }
    });

  }

  if (req.body.type === 'budget') {

    let BUDGET_LOG; try { BUDGET_LOG = JSON.parse(req.body.budget); } catch { console.log('[BUD 7] Erro ao fazer parse do orçamento'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }

    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[BUD 7] Erro ao ligar à bd'); }
      console.log(`[BUD 7] A remover movimento => ${BUDGET_LOG.id} da recorrência => ${BUDGET_LOG.recurrencyid}`);
    });

    DB.serialize(() => {
      DB.run(`UPDATE budget SET recurrencyid='0' WHERE id='${BUDGET_LOG.id}'`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log('[BUD 7] Erro ao ligar à bd'); }
      });
    });

    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[BUD 7] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else { res.send(['O movimento <b>' + BUDGET_LOG.title + '</b> foi desancorado da recorrência com sucesso.']); console.log('[BUD 7] Movimento => ' + BUDGET_LOG.id + ' removido da recorrência => ' + BUDGET_LOG.recurrencyid + ' com sucesso') }
    });
  }
}

export function deleteAllRecurrencies(req, res) {
  console.log('---------------------------');
  if (req.body.type === 'tlog') {
    const TREASURY_LOG_RECURRENCY_ID = Number(req.body.recurrencyID);

    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[TRE 8] Erro ao ligar à bd'); }
      console.log(`[TRE 8] A eliminar todos os os movimentos da recorrência => ${TREASURY_LOG_RECURRENCY_ID}`);
    });

    DB.serialize(() => {
      DB.run(`DELETE from treasurylog WHERE recurrencyid='${TREASURY_LOG_RECURRENCY_ID}'`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log('[TRE 8] Erro ao ligar à bd'); }
      });
    });

    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[TRE 8] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else { res.send(['Foram eliminados com sucesso <b>todos os movimentos</b> da mesma recorrência.']); console.log('[TRE 8] Foram eliminados todos os movimentos da recorrência => ' + TREASURY_LOG_RECURRENCY_ID + ' com sucesso') }
    });

  }

  if (req.body.type === 'budget') {
    const BUDGET_LOG_RECURRENCY_ID = Number(req.body.recurrencyID);

    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[TRE 8] Erro ao ligar à bd'); }
      console.log(`[BUD 8] A eliminar todos os os movimentos da recorrência => ${BUDGET_LOG_RECURRENCY_ID}`);
    });

    DB.serialize(() => {
      DB.run(`DELETE from budget WHERE recurrencyid='${BUDGET_LOG_RECURRENCY_ID}'`, (err, resp) => {
        if (err) { dbErrors = true; console.error(err.message); console.log('[BUD 8] Erro ao ligar à bd'); }
      });
    });

    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[BUD 8] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else { res.send(['Foram eliminados com sucesso <b>todos os orçamentos</b> da mesma recorrência.']); console.log('[BUD 8] Foram eliminados todos os orçamentos da recorrência => ' + BUDGET_LOG_RECURRENCY_ID + ' com sucesso') }
    });

  }

}
