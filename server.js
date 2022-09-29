const express = require('express');
const app = express();
const Server = require('http').Server;
const server = new Server(app);
const port = 16190;

server.listen(port, () => console.log(".: MI GQ - Listening on por 16190 :."));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get('/getcats', function (req, res) { return getCats(req, res); });
function getCats(req, res) {
  const sqlite3 = require('sqlite3').verbose();

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });

  let categories = [];
  db.serialize(() => { db.each(`SELECT * FROM categories`, (err, cat) => { if (err) { console.error(err.message) } else { cat.subcats = []; categories.push(cat); } }); });
  db.serialize(() => { db.each(`SELECT * FROM subcategories`, (err, subcat) => { err ? console.error(err.message) : pushToCategory(subcat); }); });

  function pushToCategory(subcat) {
    console.log('gere');
    categories.forEach((category, i) => {
      if (category.id === subcat.maincatid) { catIndex = i };
      return
    });
    categories[catIndex].subcats.push(subcat)
  }

  db.close((err) => {
    err ? console.error(err.message) : res.send(categories);
    console.log('Connection to MI HQ database has been closed.');
  });
}