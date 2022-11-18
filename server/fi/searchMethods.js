import sqlite3 from 'sqlite3';



export function advancedTlogSearch(req, res) {
  console.log('---------------------------');
  if (req.body.type === 'tlog') {

    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[ADS 7] Erro ao ligar à bd'); }
      console.log(`[ADS 2] ${req.body.query}`);
    });

    let filteredLogs = [];
    const QUERY = req.body.query;

    DB.serialize(() => {
      DB.each(`${QUERY}`, (err, tlog) => {
        if (err) { dbErrors = true; console.error(err.message); console.log('[ADS 7] Erro ao ligar à bd'); }
        filteredLogs.push(tlog)
      });
    });



    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[ADS 7] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else {
        res.send(filteredLogs); console.log('[ADS 7] Foram encontrados => ' + filteredLogs.length + ' movimentos através das pesquisa avançada')
      }
    });

  }
}

export function tlogSearch(req, res) {
  console.log('---------------------------');
  if (req.body.type === 'tlog') {

    const SEARCH_STRING_ARRAY = req.body.search.split(' ');
    let dbErrors = false;
    const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[ADS 2] Erro ao ligar à bd'); }
      console.log(`[ADS 2] A efetuar procura com base no título => ${req.body.search}`);
    });

    let filteredLogs = [];
    const QUERY = 'SELECT * from treasurylog WHERE'
    let queryExtra = '';

    SEARCH_STRING_ARRAY.forEach((keyword, i) => {
      if (i === 0) { queryExtra += ` (title LIKE '%${keyword}%' OR value LIKE '%${keyword}%')` } else { { queryExtra += ` AND (title LIKE '%${keyword}%' OR value LIKE '%${keyword}%')` } }
      if (i === SEARCH_STRING_ARRAY.length - 1) { queryExtra += ' ORDER BY date DESC' }
    });
    console.log(QUERY + queryExtra)

    DB.serialize(() => {
      DB.each(`${QUERY}${queryExtra}`, (err, tlog) => {
        if (err) { dbErrors = true; console.error(err.message); console.log('[ADS 2] Erro ao ligar à bd'); }

        console.log(tlog)
        filteredLogs.push(tlog)
      });
    });



    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[ADS 2] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else {
        res.send(filteredLogs); console.log('[ADS 2] Foram encontrados => ' + filteredLogs.length + ' movimentos através das strings ' + req.body.search)
      }
    });

  }
}


export function fetchAdvancedSearches(req, res) {

  console.log('---------------------------');
  let dbErrors = false;

  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[ADS 2] Erro ao ligar à bd'); };
    console.log('[ADS 2] A carregar pesquisas avançadas');
  });

  let advancedsearches = {};

  DB.serialize(() => {
    DB.each(`SELECT * FROM advancedsearch ORDER BY id`, (err, search) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[ADS 1] Erro ao carregar pesquisas avançadas'); }
      search.parameters = [];
      advancedsearches[search.id] = search;
    });
    DB.serialize(() => {
      DB.each(`SELECT * FROM searchparams`, (err, param) => {
        if (err) { dbErrors = true; console.error(err.message); console.log('[ADS 1] Erro ao carregar pesquisas avançadas'); }
        advancedsearches[param.searchid].parameters.push(param)
      })
    });
  });

  DB.close((err) => {
    if (err || dbErrors) { console.error(err.message); console.log('[ADS 1] Erro ao encerrar a ligação à bd'); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { res.send(advancedsearches); console.log('[ADS 1] => ' + advancedsearches.length + ' pesquisas avançadas carregadas com sucesso'); }
  });

  // select * from advancedsearches
  // foreach ^ das linas, adicionar ao obje

  /// tenho que enviar um objeto do tipo {title: titulo da search, paramsArray[]}
  // os params array, é qe tems os mambos
}



export function saveSearch(req, res) {

  console.log('---------------------------');
  let SEARCH; try { SEARCH = JSON.parse(req.body.search); } catch { console.log('[ADS 3] Erro ao fazer parse da pesquisa avançada'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }


  let dbErrors = false;

  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[ADS 3] Erro ao ligar à bd'); };
    console.log('[ADS 3] A guardar pesquisa avançada');
  });

  DB.run(`UPDATE advancedsearch SET title = '${SEARCH.title}', active = '${SEARCH.active}', entity = '${SEARCH.entity}' WHERE id = '${SEARCH.id}'`, (err) => {
    if (err) { dbErrors = true; console.log('[ADS 3] Erro ao atualizar a pesquisa avançada'); console.error(err.message); };
  })

  DB.serialize(() => {
    DB.run(`DELETE FROM searchparams WHERE searchid = '${SEARCH.id}'`, (err) => {
      if (err) { dbErrors = true; console.log('[ADS 3] Erro ao substituir os parâmetros da pesquisa avançada (1)'); console.error(err.message); };
    });

    if (SEARCH.parameters.length > 0) {
      SEARCH.parameters.forEach(param => {
        DB.run(`INSERT INTO searchparams (id, searchid, type, field, condition, value) VALUES ('${param.id}', '${SEARCH.id}', '${param.type}', '${param.field}', '${param.condition}','${param.value}')`, (err) => {
          if (err) { dbErrors = true; console.log('[ADS 3] Erro ao substituir os parâmetros da pesquisa avançada (2)'); console.error(err.message); };
        });
      });
    }
  });

  DB.close((err) => {
    if (err || dbErrors) {
      console.log('[ADS 3] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
    } else { res.send(['A pesquisa <b>' + SEARCH.title + '</b> e respetivos parâmetros foram atualizados com sucesso.']); console.log('[ADS 3] Pesquisa "' + SEARCH.title + '" e respetivos parâmetros atualizados com sucesso') }
  });


}




export function getSearchParamsSequence(req, res) {

  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[ADS 4] Erro ao ligar à bd'); };
    console.log('---------------------------')
    console.log('[ADS 4] A carregar valor atual da sequência de parametros pesquisas avançadas');
  });

  let currentSequence;
  DB.serialize(() => {
    DB.all(`SELECT * from sqlite_sequence where name='searchparams'`, (err, resp) => {
      if (err) { dbErrors = true; console.log('[ADS 4 Erro ao carregar o valor da sequência de parametros pesquisas avançadas'); console.error(err.message); };
      currentSequence = resp[0].seq
    })
  })
  DB.close((err) => {
    if (err || dbErrors) { console.error(err.message); console.log('[ADS 4] Erro ao encerrar a ligação à bd'); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { res.send([currentSequence.toString()]); console.log('[ADS 4] Valor atual da sequência de parametros pesquisas avançadas => ' + currentSequence) }
  });
}



export function addNewSearch(req, res) {

  console.log('---------------------------');
  let SEARCH; try { SEARCH = JSON.parse(req.body.search); } catch { console.log('[ADS 5] Erro ao fazer parse da pesquisa avançada'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }

  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[ADS 5] Erro ao ligar à bd'); };
    console.log('[ADS 5] A introduzir nova pesquisa avançada');
  });

  DB.serialize(() => {
    DB.run(`INSERT INTO advancedsearch (title, active, entity) VALUES ('${SEARCH.title}','${SEARCH.active}','${SEARCH.entity}')`, (err) => {
      if (err) { dbErrors = true; console.log('[ADS 5] Erro na criação da categoria'); console.error(err.message); };
      console.log('[ADS 5] Pesquisa => "' + SEARCH.title + '" criada com sucesso');
    })
      // obter o id atribuído à categoria introduzida
      .all(`SELECT * from sqlite_sequence where name='advancedsearch'`, (err, resp) => {
        if (err) { dbErrors = true; console.log('[ADS 5] Erro ao carregar o valor atribuído à pesquisa'); console.error(err.message); } else {
          console.log('[ADS 5] A criar subcategorias para a pesquisa "' + SEARCH.title + '"'); insertParameters(resp[0].seq);
        }
      });
  })

  function insertParameters(assignedSearchID) {

    console.log(assignedSearchID)
    if (SEARCH.parameters.length !== 0) {
      SEARCH.parameters.forEach((param, i) => {
        DB.run(`INSERT INTO searchparams (searchid, type, field, condition, value) VALUES ('${assignedSearchID}', '${param.type}', '${param.field}', '${param.condition}','${param.value}')`, (err) => {
          if (err) { dbErrors = true; console.log('[ADS 5] Erro na criação de subcategorias'); console.error(err.message); } else {
            console.log('[ADS 5] Parâmetro "' + (i + 1) + '" criado com sucesso');
          }
        });
      });
    }

    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[ADS 5] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else { res.send(['A pesquisa <b>' + SEARCH.title + '</b> foi introduzida com sucesso.', assignedSearchID.toString()]); console.log('[ADS 5] Pesquisa "' + SEARCH.title + '" e respetivos parametros criados com sucesso') }
    });
  }

}

export function deleteSearch(req, res) {
  console.log('---------------------------')
  let dbErrors = false;

  let SEARCH; try { SEARCH = JSON.parse(req.body.search); } catch { console.log('[ADS 6] Erro ao fazer parse da categoria'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[ADS 6] Erro ao ligar à bd'); };
    console.log('[ADS 6] A apagar a pesquisa => "' + SEARCH.title + '"');
  });

  db.parallelize(() => {
    db.run(`DELETE FROM advancedsearch WHERE id=${SEARCH.id}`, (err) => { if (err) { dbErrors = true; console.error(err.message); console.log('[ADS 6] Erro ao apagar pesquisa'); } })
    db.run(`DELETE FROM searchparams WHERE searchid=${SEARCH.id}`, (err) => { if (err) { dbErrors = true; console.error(err.message); console.log('[ADS 6] Erro ao apagar pesquisas'); } })
  });

  db.close((err) => {
    if (err || dbErrors) { console.log('[ADS 6] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); } else {
      console.log('[ADS 6] Pesquisa => "' + SEARCH.title + '" eliminada com sucesso'); res.send(['A pesquisa <b>' + SEARCH.title + '</b> foi eliminada com sucesso.'])
    }
  });
}