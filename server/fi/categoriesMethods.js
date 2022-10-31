import sqlite3 from 'sqlite3';

// ######>  vai ler à bd as categorias existentes
export function fetchCategories(req, res) {

  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 1] Erro ao ligar à bd'); };
    console.log('---------------------------');
    console.log('[CAT 1] A carregar categorias');
  });

  let categories = [];
  DB.serialize(() => {
    DB.each(`SELECT * FROM categories ORDER BY catorder`, (err, cat) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 1] Erro ao carregar categorias'); }
      else {
        cat.subcats = []; // na tabela categories, não existe a coluna subcats, tenho que a declarar aqui
        cat.active === 'true' ? cat.active = true : cat.active = false; // conversão string para boolean (o sqlite não tem colunas do tipo boolean)
        categories.push(cat);
      }
    });

    DB.each(`SELECT * FROM subcategories ORDER BY subcatorder`, (err, subcat) => {
      if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 1] Erro ao carregar subcategorias'); }
      pushSubcatToCategory(subcat)
    });
  });

  DB.close((err) => {
    if (err || dbErrors) { console.error(err.message); console.log('[CAT 1] Erro ao encerrar a ligação à bd'); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { res.send(categories); console.log('[CAT 1] => ' + categories.length + ' categorias carregadas com sucesso') }
  });

  function pushSubcatToCategory(subcat) {
    let catIndex;
    for (let i = 0; i < categories.length; i++) { if (categories[i].id === subcat.maincatid) { catIndex = i; break } }
    subcat.active === 'true' ? subcat.active = true : subcat.active = false;
    if (categories.length !== 0) { categories[catIndex].subcats.push(subcat) };
  }

}

// ######>  vai ler à bd o id mais alto das sub categorias
export function getSubcategorySequence(req, res) {

  let dbErrors = false;
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 2] Erro ao ligar à bd'); };
    console.log('---------------------------')
    console.log('[CAT 2] A carregar valor atual da sequência de subcategorias');
  });

  let currentSequence;
  DB.serialize(() => {
    DB.all(`SELECT * from sqlite_sequence where name='subcategories'`, (err, resp) => {
      if (err) { dbErrors = true; console.log('[CAT 2] Erro ao carregar o valor da sequência de subcategorias'); console.error(err.message); };
      currentSequence = resp[0].seq
    })
  })
  DB.close((err) => {
    if (err || dbErrors) { console.error(err.message); console.log('[CAT 2] Erro ao encerrar a ligação à bd'); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { res.send([currentSequence.toString()]); console.log('[CAT 2] Valor atual da sequência de subcategorias => ' + currentSequence) }
  });
}

// ######>  adiciona uma nova categoria, e respetivas subcategorias  à bd
export function createNewCategory(req, res) {

  let CATEGORY; try { CATEGORY = JSON.parse(req.body.category); } catch { console.log('[CAT 3] Erro ao fazer parse da categoria'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }


  let dbErrors = false;
  let otherErrors = [];
  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 3] Erro ao ligar à bd'); };
    console.log('---------------------------')
    console.log('[CAT 3] A criar categoria => "' + CATEGORY.title + '"');
  });

  DB.all(`SELECT * FROM categories WHERE lower(title) ='${CATEGORY.title.toLowerCase()}'`, (err, resp) => {

    if (err) { dbErrors = true; console.log('[CAT 3] Erro ao obter a lista de títulos das categorias'); console.error(err.message); }
    categoryTitleCheck(resp);
  });

  function categoryTitleCheck(categoryDB) {
    console.log('[CAT 3] A verificar a existência de conflitos para os títulos da categoria/subcategorias');

    if (categoryDB.length !== 0 && categoryDB[0].id !== CATEGORY.id) { console.log('[CAT 3] O título => "' + CATEGORY.title + '" já se encontra em uso.'); otherErrors.push('O título <b>' + CATEGORY.title + '</b> já se encontra em uso por uma outra categoria.') }
    const QUERY = `SELECT * FROM subcategories WHERE lower(title) IN `;
    let queryExtra = '';

    if (CATEGORY.subcats.length !== 0) {

      CATEGORY.subcats.forEach((subcat, i) => {
        if (i === 0) { queryExtra += '(' };
        queryExtra += `'${subcat.title.toLowerCase()}'`;
        if (i === CATEGORY.subcats.length - 1) { queryExtra += ')' } else { queryExtra += ',' };
      });

      DB.all(`${QUERY}${queryExtra}`, (err, resp) => {

        if (err) { dbErrors = true; console.log('[CAT 3] Erro ao obter a lista de títulos das subcategorias'); console.error(err.message); };
        categorySubTitleCheck(resp);
      });
    }
    else {
      categorySubTitleCheck([]);
    }

  }

  function categorySubTitleCheck(subcategoryArray) {
    console.log('[CAT 3] A verificar a existência de conflitos para o título das subcategorias');
    let tempSubcatsTitles = [] // titulos das subcategorias recebidas do front end
    for (let y = 0; y < CATEGORY.subcats.length; y++) {
      if (tempSubcatsTitles.includes(CATEGORY.subcats[y].title.toLowerCase())) {
        console.log('[CAT 3] Existem subcategorias com nome em duplicado => "' + CATEGORY.subcats[y].title + '"');
        otherErrors.push('O título <b>' + CATEGORY.subcats[y].title + '</b> foi definido para diferentes subcategorias.');
        break;
      }
      tempSubcatsTitles.push(CATEGORY.subcats[y].title.toLowerCase());
    };

    for (let z = 0; z < subcategoryArray.length; z++) {
      if (tempSubcatsTitles.includes(subcategoryArray[z].title.toLowerCase()) && subcategoryArray[z].maincatid !== CATEGORY.id) {
        console.log('[CAT 3] O título => "' + subcategoryArray[z].title + '" já se encontra em uso por outra subcategoria');
        otherErrors.push('O título <b>' + subcategoryArray[z].title + '</b> já se encontra em uso por uma outra subcategoria.');
        break;
      }
    };

    if (dbErrors) { return res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']) }
    if (otherErrors.length !== 0) { return res.send(['MHQERROR', ...otherErrors]) }

    checkComplete();
  }

  function checkComplete() {
    let currentOrder = 9998;

    DB.serialize(() => {

      DB.all(`SELECT MAX(catorder) as max from categories`, (err, resp) => {
        if (err) { dbErrors = true; console.log('[CAT 3] Erro ao carregar o valor da sequência da ordem de categorias'); console.error(err.message); };
        currentOrder = Number(resp[0].max) + 1;

        DB.serialize(() => {
          DB.run(`INSERT INTO categories (title, icon, type, bgcolor, textcolor, active, catorder) VALUES ('${CATEGORY.title}','${CATEGORY.icon}','${CATEGORY.type}','${CATEGORY.bgcolor}','${CATEGORY.textcolor}','${CATEGORY.active}', '${currentOrder}')`, (err) => {
            if (err) { dbErrors = true; console.log('[CAT 3] Erro na criação da categoria'); console.error(err.message); };
            console.log('[CAT 3] Categoria => "' + CATEGORY.title + '" criada com sucesso');
          })
            // obter o id atribuído à categoria introduzida
            .all(`SELECT * from sqlite_sequence where name='categories'`, (err, resp) => {
              if (err) { dbErrors = true; console.log('[CAT 3] Erro ao carregar o valor atribuído à categoria'); console.error(err.message); } else {
                console.log('[CAT 3] A criar subcategorias para a categoria "' + CATEGORY.title + '"'); insertSubcategories(resp[0].seq);
              }
            });
        })
      })


    });

    function insertSubcategories(assignedCategoryID) {
      if (CATEGORY.subcats.length !== 0) {
        CATEGORY.subcats.forEach((subcat, i) => {
          DB.run(`INSERT INTO subcategories (maincatid, title, budget, active, subcatorder) VALUES ('${assignedCategoryID}', '${subcat.title}', '${subcat.budget}', '${subcat.active}', '${Number(i)}' )`, (err) => {
            if (err) { dbErrors = true; console.log('[CAT 3] Erro na criação de subcategorias'); console.error(err.message); } else {
              console.log('[CAT 3] Subcategoria "' + subcat.title + '" criada com sucesso');
            }
          });
        });
      }

      DB.close((err) => {
        if (err || dbErrors) {
          console.log('[CAT 3] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
        } else { res.send([assignedCategoryID.toString()]); console.log('[CAT 3] Categoria "' + CATEGORY.title + '" e respetivas subcategorias criadas com sucesso') }
      });
    }
  }
}

// ######>  elimina categoria, e respetivas subcategorias, da bd
export function deleteCategory(req, res) {
  console.log('---------------------------')
  let dbErrors = false;

  let CATEGORY; try { CATEGORY = JSON.parse(req.body.cat); } catch { console.log('[CAT 4] Erro ao fazer parse da categoria'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 4] Erro ao ligar à bd'); };
    console.log('[CAT 4] A apagar a categoria => "' + CATEGORY.title + '"');
  });

  db.parallelize(() => {
    db.run(`DELETE FROM categories WHERE id=${CATEGORY.id}`, (err) => { if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 4] Erro ao apagar categorias'); } })
    db.run(`DELETE FROM subcategories WHERE maincatid=${CATEGORY.id}`, (err) => { if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 4] Erro ao apagar subcategorias'); } })
  });

  db.close((err) => {
    if (err || dbErrors) { console.log('[CAT 4] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); } else {
      console.log('[CAT 4] Categoria => "' + CATEGORY.title + '" eliminada com sucesso'); res.send(['A categoria <b>' + CATEGORY.title + '</b> foi eliminada com sucesso.'])
    }
  });

}

// ######>  re-ordenação de categorias
export function orderCategories(req, res) {
  console.log('---------------------------')
  let NEW_CAT_ORDER; try { NEW_CAT_ORDER = JSON.parse(req.body.newcatorder); } catch { console.log('[CAT 5] Erro ao fazer parse da ordenação das categorias'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }

  let dbErrors = false;

  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 5] Erro ao ligar à bd'); };
    console.log('[CAT 5] A re-ordenar categorias');
  });

  DB.serialize(() => {

    NEW_CAT_ORDER.forEach((CAT_ID, i) => {
      DB.run(`UPDATE categories SET catorder ='${i}' WHERE id='${CAT_ID}'`, (err) => { if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 5] Erro ao re-ordenar categorias'); } })
    });

  });

  DB.close((err) => {
    if (err || dbErrors) { console.log('[CAT 5] Erro ao terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { console.log('[CAT 5] Categorias re-ordenadas com sucesso'); res.send(['Categorias <b>re-ordenadas</b> com sucesso.']) } // desenvolver tratamento de erro do lado do front end
  });
}

// ######>  re-ordenação de subcategorias
export function orderSubCategories(req, res) {
  console.log('---------------------------')
  let NEW_SUBCAT_ORDER; try { NEW_SUBCAT_ORDER = JSON.parse(req.body.newsubcatorder); } catch { console.log('[CAT 6] Erro ao fazer parse da ordenação das subcategorias'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }


  let dbErrors = false;

  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 6] Erro ao ligar à bd'); };
    console.log('[CAT 6] A re-ordenar subcategorias');
  });

  DB.serialize(() => {

    NEW_SUBCAT_ORDER.forEach((SUBCAT_ID, i) => {
      DB.run(`UPDATE subcategories SET subcatorder ='${i}' WHERE id='${SUBCAT_ID}'`, (err) => { if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 6] Erro ao re-ordenar subcategorias'); } })
    });

  });


  DB.close((err) => {
    if (err || dbErrors) { console.log('[CAT 6] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']); }
    else { console.log('[CAT 6] Categorias re-ordenadas com sucesso'); res.send(['Subcategorias <b>re-ordenadas</b> com sucesso.']) } // desenvolver tratamento de erro do lado do front end
  });
}

// ######>  guardar alterações efetuadas à categoria
export function updateCategory(req, res) {

  console.log('---------------------------')
  let CATEGORY; try { CATEGORY = JSON.parse(req.body.category); } catch { console.log('[CAT 7] Erro ao fazer parse da categoria'); return res.send(['MHQERROR', 'O objeto enviado pela aplicação não está corretamente parametrizado.']) }

  let otherErrors = [];
  let dbErrors = false;

  const DB = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { dbErrors = true; console.error(err.message); console.log('[CAT 7] Erro ao ligar à bd'); };
    console.log('[CAT 7] A atualizar a categoria => "' + CATEGORY.title + '"');
  });

  DB.all(`SELECT * FROM categories WHERE lower(title) ='${CATEGORY.title.toLowerCase()}'`, (err, resp) => {

    if (err) { dbErrors = true; console.log('[CAT 7] Erro ao obter a lista de títulos das categorias'); console.error(err.message); }
    categoryTitleCheck(resp);
  });

  function categoryTitleCheck(categoryDB) {
    console.log('[CAT 7] A verificar a existência de conflitos para o título da categoria');

    if (categoryDB.length !== 0 && categoryDB[0].id !== CATEGORY.id) { console.log('[CAT 7] O título => "' + CATEGORY.title + '" já se encontra em uso.'); otherErrors.push('O título <b>' + CATEGORY.title + '</b> já se encontra em uso por uma outra categoria.') }

    if (CATEGORY.subcats.length !== 0) {
      const QUERY = `SELECT * FROM subcategories WHERE LOWER(title) IN `;
      let queryExtra = '';

      CATEGORY.subcats.forEach((subcat, i) => {
        if (i === 0) { queryExtra += '(' };
        queryExtra += `'${subcat.title.toLowerCase()}'`;
        if (i === CATEGORY.subcats.length - 1) { queryExtra += ')' } else { queryExtra += ',' };
      });

      DB.all(`${QUERY}${queryExtra}`, (err, resp) => {

        if (err) { dbErrors = true; console.log('[CAT 7] Erro ao obter a lista de títulos das subcategorias'); console.error(err.message); };
        categorySubTitleCheck(resp);
      });
    } else {
      categorySubTitleCheck([])
    }
  }

  function categorySubTitleCheck(subcategory) {
    console.log('[CAT 7] A verificar a existência de conflitos para o título das subcategorias');
    let tempSubcatsTitles = [] // titulos das subcategorias recebidas do front end
    for (let y = 0; y < CATEGORY.subcats.length; y++) {
      if (tempSubcatsTitles.includes(CATEGORY.subcats[y].title.toLowerCase())) {
        console.log('[CAT 7] Existem subcategorias com nome em duplicado => "' + CATEGORY.subcats[y].title + '"');
        otherErrors.push('O título <b>' + CATEGORY.subcats[y].title + '</b> foi definido para diferentes subcategorias.');
        break;
      }
      tempSubcatsTitles.push(CATEGORY.subcats[y].title.toLowerCase());
    };

    for (let z = 0; z < subcategory.length; z++) {
      if (tempSubcatsTitles.includes(subcategory[z].title.toLowerCase()) && subcategory[z].maincatid !== CATEGORY.id) {
        console.log('[CAT 7] O título => "' + subcategory[z].title + '" já se encontra em uso por outra subcategoria');
        otherErrors.push('O título <b>' + subcategory[z].title + '</b> já se encontra em uso por uma outra subcategoria.');
        break;
      }
    };

    if (dbErrors) { return res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']) }
    if (otherErrors.length !== 0) { return res.send(['MHQERROR', ...otherErrors]) }

    checkComplete();
  }

  function checkComplete() {


    DB.run(`UPDATE categories SET title='${CATEGORY.title}', type='${CATEGORY.type}', icon='${CATEGORY.icon}', bgcolor='${CATEGORY.bgcolor}', textcolor='${CATEGORY.textcolor}', active='${CATEGORY.active}', catorder='${CATEGORY.catorder}' WHERE id='${CATEGORY.id}'`, (err) => {
      if (err) { dbErrors = true; console.log('[CAT 7] Erro ao atualizar a categoria'); console.error(err.message); };
    })

    DB.serialize(() => {
      DB.run(`DELETE FROM subcategories WHERE maincatid='${CATEGORY.id}'`, (err) => {
        if (err) { dbErrors = true; console.log('[CAT 7] Erro ao substituir subcategorias (1)'); console.error(err.message); };
      });

      if (CATEGORY.subcats.length > 0) {
        CATEGORY.subcats.forEach((subcat, i) => {
          DB.run(`INSERT INTO subcategories (id, maincatid, title, budget, active, subcatorder) VALUES ('${subcat.id}', '${subcat.maincatid}', '${subcat.title}', '${subcat.budget}', '${subcat.active}', '${Number(i)}' )`, (err) => {
            if (err) { dbErrors = true; console.log('[CAT 7] Erro ao substituir subcategorias (2)'); console.error(err.message); };
          });
        });
      }
    });

    DB.close((err) => {
      if (err || dbErrors) {
        console.log('[CAT 7] Erro ao carregar terminar ligação com a BD'); console.error(err.message); res.send(['MHQERROR', 'Erro ao estabelecer comunicação com a base de dados.']);
      } else { res.send(['A categoria <b>' + CATEGORY.title + '</b> e respetivas subcategorias foram atualizadas com sucesso.']); console.log('[CAT 7] Categoria "' + CATEGORY.title + '" e respetivas subcategorias atualizadas com sucesso') }
    });

  }
}
