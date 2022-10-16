import sqlite3 from 'sqlite3';

// ######>  vai buscar à bd as acategorias existentes
export function fetchCategories(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[C1] categories fetch');
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

    console.log('[C1] categories fetch complete');
  });


  function pushSubcatToCategory(subcat) {

    let catIndex;

    categories.forEach((category, i) => { if (category.id === subcat.maincatid) { catIndex = i; return } });
    subcat.active === 'true' ? subcat.active = true : subcat.active = false;
    categories[catIndex].subcats.push(subcat);

  }

}

// ######>  vai buscar o valor atual da sequencia de subcategorias
export function getSubcategorySequence(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[C2] subcategory sequence');
  });

  let currentSequence;

  db.serialize(() => {
    db.all(`SELECT * from sqlite_sequence where name='subcategories'`, (err, resp) => { err ? console.error(err.message) : currentSequence=resp[0].seq });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send(currentSequence.toString()); // desenvolver tratamento de erro do lado do front end
    console.log('[C2] Current subcategory sequence => {'+currentSequence)+'}';
  });

}

// ######>  adiciona uma nova categoria (e respetivas sub-categorias)
export function createNewCategory(req, res) {

  const category = JSON.parse(req.body.category);

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[C3] creating category => "'+category.title+'"');
  });

  db.serialize(() => {

    db.run(`INSERT INTO categories (title, icon, type, bgcolor, textcolor, active, catorder) VALUES ('${category.title}','${category.icon}','${category.type}','${category.bgcolor}','${category.textcolor}','${category.active}', '9999')`, (err, resp) => { err ? console.error(err.message) : console.log('[C3] category "'+category.title+'" created') })
      // obter o id atribuído à categoria introduzida
      .all(`SELECT * from sqlite_sequence where name='categories'`, (err, resp) => { err ? console.error(err.message) : insertSubcategories(resp[0].seq) });

  });

  function insertSubcategories(assignedCategoryID) {

    if (category.subcats.length > 0) {
      console.log('[C4] creating sub-categories');

      category.subcats.forEach((subcat,i) => {
        db.run(`INSERT INTO subcategories (maincatid, title, budget, active, subcatorder) VALUES ('${assignedCategoryID}', '${subcat.title}', '${subcat.budget}', '${subcat.active}', '${i+1}' )`, (err, resp) => { err ? console.error(err.message) : console.log('[C4b] sub-category "'+subcat.title+'" created'); });
      });
    }

    db.close((err) => {
      if (err) {
        console.error(err.message);
        res.send('MHQ_ERROR');
      } else {
        res.send(assignedCategoryID.toString());
      }
    });
  }
}

// ######>  apaga a categoria (e subcategorias associadas)
export function deleteCategory(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[C5] deleting category nº. {'+req.body.cat+'}');
  });

  db.serialize(() => {
    db.run(`DELETE FROM categories WHERE id=${req.body.cat}`)
    db.run(`DELETE FROM subcategories WHERE maincatid=${req.body.cat}`)
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci'); // desenvolver tratamento de erro do lado do front end
    console.log('[C5] category nº. {'+req.body.cat+'} deleted');
  });

}

// ######> guardar alterações efetuadas à categoria
export function updateCategory(req, res) {

  const cat = JSON.parse(req.body.category);

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[C6] updating category "'+cat.title+'"');
  });

  db.serialize(() => {

    db.run(`UPDATE categories SET title='${cat.title}', type='${cat.type}', icon='${cat.icon}', bgcolor='${cat.bgcolor}', textcolor='${cat.textcolor}', active='${cat.active}', catorder='${cat.catorder}' WHERE id='${cat.id}'`, (err, resp) => { err ? console.error(err.message) : console.log('Category sucessfully updated.'); });
    db.run(`DELETE FROM subcategories WHERE maincatid='${cat.id}'`, (err, resp) => { err ? console.error(err.message) : console.log('[C6b] updating "'+cat.title+'" sub-categories'); });

    if (cat.subcats.length > 0) {

      cat.subcats.forEach((subcat, i) => {
        db.run(`INSERT INTO subcategories (id, maincatid, title, budget, active, subcatorder) VALUES ('${subcat.id}', '${subcat.maincatid}', '${subcat.title}', '${subcat.budget}', '${subcat.active}', '${subcat.subcatorder}' )`, (err, resp) => { err ? console.error(err.message) : console.log('[C6b] sub-category "'+subcat.title+'" updated'); });
      });
    }

  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('1'); // desenvolver tratamento de erro do lado do front end
  });

}