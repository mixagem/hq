const express = require('express');
const app = express();
const Server = require('http').Server;
const server = new Server(app);
const port = 16190;

server.listen(port, () => console.log(".: MI GQ - Listening on por 16190 :."));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get('/getcats', function (req, res) { return getCats(req, res); });
app.post('/savecat', function (req, res) { return saveCat(req, res); });
app.post('/addsubcat', function (req, res) { return addSubCat(req, res); });


function addSubCat(req,res){
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });

  const subcat = JSON.parse(req.body.subcat)

  db.serialize(() => {
    db.run(`INSERT INTO subcategories (maincatid, title, budget, active) VALUES (${subcat.maincat},'${subcat.title}',${subcat.budget},'${subcat.active}')`)
  });


  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci');
    console.log('Connection to MI HQ database has been closed.');
  });

}
function saveCat(req, res) {

  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });

  const cat = JSON.parse(req.body.cat);

  db.serialize(() => {
    db.each(`UPDATE categories SET title='${cat.title}', type='${cat.type}', icon='${cat.icon}', bgcolor='${cat.bgcolor}', textcolor='${cat.textcolor}', active='${cat.active}' WHERE id='${cat.id}'`, (err, resp) => { err ? console.error(err.message) : console.log(resp); });

    db.each(`DELETE FROM subcategories WHERE maincatid='${cat.id}'`, (err, resp) => { err ? console.error(err.message) : console.log(resp); });

    if (cat.subcats.length > 0) {

        cat.subcats.forEach(subcat => {
          console.log(subcat)
          db.each(`INSERT INTO subcategories (maincatid, title, budget, active) VALUES ('${subcat.maincatid}', '${subcat.title}', '${subcat.budget}', '${subcat.active}' )`, (err, resp) => { err ? console.error(err.message) : console.log(resp); });
        });
    }
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci');
    console.log('Connection to MI HQ database has been closed.');
  });
}

function getCats(req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });
  let categories = [];
  db.serialize(() => {
    db.each(`SELECT * FROM categories`, (err, cat) => {
      if (err) { console.error(err.message) } else {
        cat.subcats = [];
        cat.active === 'true' ? cat.active = true : cat.active = false;
        categories.push(cat);
      }
    });
    db.each(`SELECT * FROM subcategories`, (err, subcat) => { err ? console.error(err.message) : pushToCategory(subcat); });
  });
  db.close((err) => {
    err ? console.error(err.message) : res.send(categories);
    console.log('Connection to MI HQ database has been closed.');
  });
  function pushToCategory(subcat) {
    let catIndex;
    categories.forEach((category, i) => {
      if (category.id === subcat.maincatid) { catIndex = i };
      return
    });
    subcat.active === 'true' ? subcat.active = true : subcat.active = false;
    categories[catIndex].subcats.push(subcat)
  }
}

