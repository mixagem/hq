import sqlite3 from 'sqlite3';

// ######>  vai buscar à bd as acategorias existentes
export function fetchCategories(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Fetching categories...');
  });

  let categories = [];

  db.serialize(() => {

    db.each(`SELECT * FROM categories ORDER BY id DESC`, (err, cat) => {
      if (err) { console.error(err.message) }
      else {
        cat.subcats = []; // na tabela da bd, não existe a coluna subcats, tenho que a declarar aqui
        cat.active === 'true' ? cat.active = true : cat.active = false; // conversão string para boolean (o sqlite não tem colunas do tipo boolean)
        categories.push(cat);
      }
    });

    db.each(`SELECT * FROM subcategories`, (err, subcat) => { err ? console.error(err.message) : pushSubcatToCategory(subcat); });

  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(categories);
    console.log('Fetch complete.');
  });


  function pushSubcatToCategory(subcat) {

    let catIndex;

    categories.forEach((category, i) => { if (category.id === subcat.maincatid) { catIndex = i; return } });
    subcat.active === 'true' ? subcat.active = true : subcat.active = false;
    categories[catIndex].subcats.push(subcat);

  }

}


// ######>  adiciona uma nova categoria (e respetivas sub-categorias)
export function createNewCategory(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Creating category...');
  });

  const category = JSON.parse(req.body.cat);

  db.serialize(() => {

    db.run(`INSERT INTO categories (title, icon, type, bgcolor, textcolor, active) VALUES ('${category.title}','${category.icon}','${category.type}','${category.bgcolor}','${category.textcolor}','${category.active}')`, (err, resp) => { err ? console.error(err.message) : console.log('Category sucessfully created.') })

      // obter o id atribuído à categoria introduzida
      .all(`SELECT * from sqlite_sequence where name='categories'`, (err, resp) => { err ? console.error(err.message) : insertSubcategories(resp[0].seq) });

  });

  function insertSubcategories(catID) {

    if (category.subcats.length > 0) {

      console.log('Creating sub-categories...');

      category.subcats.forEach((subcat,i) => {
        db.run(`INSERT INTO subcategories (maincatid, title, budget, active) VALUES ('${catID}', '${subcat.title}', '${subcat.budget}', '${subcat.active}' )`, (err, resp) => { err ? console.error(err.message) : console.log('Sub-category sucessfully created ('+(i+1)+') .'); });
      });
    }

    db.close((err) => {
      err ? console.error(err.message) : res.send(catID.toString()); // desenvolver tratamento de erro do lado do front end
    });
  }
}

// ######>  apaga a categoria (e subcategorias associadas)
export function deleteCategory(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Deleting category...');
  });

  db.serialize(() => {
    db.run(`DELETE FROM categories WHERE id=${req.body.cat}`)
    db.run(`DELETE FROM subcategories WHERE maincatid=${req.body.cat}`)
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci'); // desenvolver tratamento de erro do lado do front end
    console.log('Category sucessfully deleted.');
  });

}

// ######> adiciona a sub-categoria
export function addSubCategory(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Adding sub-category...');
  });

  const subcat = JSON.parse(req.body.subcat)

  db.serialize(() => {
    db.run(`INSERT INTO subcategories (maincatid, title, budget, active) VALUES (${subcat.maincat},'${subcat.title}',${subcat.budget},'${subcat.active}')`)
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci'); // desenvolver tratamento de erro do lado do front end
    console.log('Sub-category sucessfully added.');
  });

}

// ######> remove a sub-categoria
export function removeSubCategory(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Removing sub-category...');
  });

  db.serialize(() => {
    db.run(`DELETE FROM subcategories WHERE id=${req.body.subcat} and maincatid=${req.body.cat}`)
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci'); // desenvolver tratamento de erro do lado do front end
    console.log('Sub-category sucessfully removed.');
  });

}

// ######> guardar alterações efetuadas à categoria
export function saveCategory(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Updating category...');
  });

  const cat = JSON.parse(req.body.cat);

  db.serialize(() => {

    db.run(`UPDATE categories SET title='${cat.title}', type='${cat.type}', icon='${cat.icon}', bgcolor='${cat.bgcolor}', textcolor='${cat.textcolor}', active='${cat.active}' WHERE id='${cat.id}'`, (err, resp) => { err ? console.error(err.message) : console.log('Category sucessfully updated.'); });

    db.run(`DELETE FROM subcategories WHERE maincatid='${cat.id}'`, (err, resp) => { err ? console.error(err.message) : console.log('Updating sub-categories...'); });

    if (cat.subcats.length > 0) {

      cat.subcats.forEach((subcat,i) => {
        db.run(`INSERT INTO subcategories (id, maincatid, title, budget, active) VALUES ('${subcat.id}', '${subcat.maincatid}', '${subcat.title}', '${subcat.budget}', '${subcat.active}' )`, (err, resp) => { err ? console.error(err.message) : console.log('Sub-category sucessfully updated ('+i+') .'); });
      });
    }

  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci'); // desenvolver tratamento de erro do lado do front end
  });

}