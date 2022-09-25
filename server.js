const express = require('express');
const app = express();
const Server = require('http').Server;
const server = new Server(app);
const port = 16190;

server.listen(port, () => console.log(".: MI GQ - Listening on por 16190 :."));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.post('/updateapplanguage', function (req, res) { return updateAppLanguage(req, res); });
function updateAppLanguage(req, res) {
  const sqlite3 = require('sqlite3').verbose();

  let db = new sqlite3.Database('./mihq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to PHC GO UNDERGROUND database is now open.');
  });

  let rows = [];
  db.serialize(() => { db.each(`UPDATE appsettings SET language='${req.body.language}'`, (err, row) => { err ? console.error(err.message) : rows.push(row); }); });

  db.close((err) => {
    err ? console.error(err.message) : res.send(rows);
    console.log('Connection to PHC GO UNDERGROUND database has been closed.');
  });
}
