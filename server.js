const express = require('express');
const app = express();
const Server = require('http').Server;
const server = new Server(app);
const port = 16190;

server.listen(port, () => console.log(".: MI GQ - Listening on por 16190 :."));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/getcats', function (req, res) { return getCats(req, res); });
app.get('/gettlogs', function (req, res) { return getTLogs(req, res); });
app.post('/savecat', function (req, res) { return saveCat(req, res); });
app.post('/addsubcat', function (req, res) { return addSubCat(req, res); });
app.post('/removesubcat', function (req, res) { return removeSubCat(req, res); });
app.post('/addcat', function (req, res) { return addCat(req, res); });
app.post('/removecat', function (req, res) { return removeCat(req, res); });
app.post('/removetlog', function (req, res) { return removeTlog(req, res); });
app.post('/savetlog', function (req, res) { return saveTlog(req, res); });
app.post('/addtlog', function (req, res) { return addTlog(req, res); });

app.post('/dailysumevo', function (req, res) { return genDailySumEvo(req, res); });

function genDailySumEvo(req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });

  function isItExpense(value, type) {
    return type === 'expense' ? -value : value
  }

  const dateObj = new Date('2022-01-01T00:00:00.000Z')
  dateObj.setMonth(req.body.month)
  dateObj.setFullYear(req.body.year)
  const dateInMillisecs = dateObj.getTime();
  let acomulatedMovements = [];
  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date < ${dateInMillisecs}`, (err, row) => { err ? console.error(err.message) : acomulatedMovements.push(row) });

    // for each para todos os dias do mes (a enviar no chamada api). a cada dia, verifica se existem monthmovements. caso existam, atualiza o valor, e só depois manda para o array dos acomulados

  })

  function fuckyou3() {
    let dailySumEvo = [];

    for (i = 0; i < req.body.days; i++) {
      let dailysum = 0;

      if (i !== 0) { dailysum += dailySumEvo[i - 1] }


      acomulatedMovements.forEach(movement => {

        if ((new Date(movement.date).getDate()) === i + 1) {
          movement.type === 'expense' ? dailysum -= movement.value : dailysum += movement.value
        }
      });

      dailySumEvo.push(dailysum)
    }
    res.send(dailySumEvo)
  }

  db.close((err) => {
    err ? console.error(err.message) : fuckyou3();
    console.log('Connection to MI HQ database has been closed.');
  });
}


function addTlog(req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });

  const tlog = JSON.parse(req.body.tlog)
  let newTlogID;
  db.serialize(() => {
    db.run(`INSERT INTO treasurylog (title, date, value, cat, subcat, type, obs) VALUES ('${tlog.title}', '${tlog.date}', '${tlog.value}', '${tlog.cat}', '${tlog.subcat}', '${tlog.type}', '${tlog.obs}')`);

    db.all(`SELECT * from sqlite_sequence where name='treasurylog'`, (err, resp) => { err ? console.error(err.message) : fuckyou2(resp[0].seq) });

    function fuckyou2(newTLogID) {
      db.close((err) => {
        err ? console.error(err.message) : res.send(newTLogID.toString());
        console.log('Connection to MI HQ database has been closed.');
      });
    }
  });
}


function saveTlog(req, res) {

  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });

  const tlog = JSON.parse(req.body.tlog);

  db.serialize(() => {
    db.each(`UPDATE treasurylog SET title='${tlog.title}', date='${tlog.date}', value='${tlog.value}', cat='${tlog.cat}', subcat='${tlog.subcat}', type='${tlog.type}', obs='${tlog.obs}' WHERE id='${tlog.id}'`, (err, resp) => { err ? console.error(err.message) : []; });
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci');
    console.log('Connection to MI HQ database has been closed.');
  });
}


function getTLogs(req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });

  let tlogs = [];
  db.serialize(() => {
    db.each(`SELECT * FROM treasurylog ORDER BY id DESC`, (err, tlog) => { err ? console.error(err.message) : tlogs.push(tlog); });
  });


  db.close((err) => {
    err ? console.error(err.message) : res.send(tlogs);
    console.log('Connection to MI HQ database has been closed.');
  });
}

function removeCat(req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });

  db.serialize(() => {
    db.run(`DELETE FROM categories WHERE id=${req.body.cat}`)
    db.run(`DELETE FROM subcategories WHERE maincatid=${req.body.cat}`)
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci');
    console.log('Connection to MI HQ database has been closed.');
  });

}

function removeTlog(req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });

  db.serialize(() => {
    db.run(`DELETE FROM treasurylog WHERE id=${req.body.tlog}`)
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci');
    console.log('Connection to MI HQ database has been closed.');
  });

}


function removeSubCat(req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });

  db.serialize(() => {
    db.run(`DELETE FROM subcategories WHERE id=${req.body.subcat} and maincatid=${req.body.cat}`)
  });

  db.close((err) => {
    err ? console.error(err.message) : res.send('gucci');
    console.log('Connection to MI HQ database has been closed.');
  });

}

function addCat(req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });

  const cat = JSON.parse(req.body.cat);
  db.serialize(() => {

    db.run(`INSERT INTO categories (title, icon, type, bgcolor, textcolor, active) VALUES ('${cat.title}','${cat.icon}','${cat.type}','${cat.bgcolor}','${cat.textcolor}','${cat.active}')`, (err, resp) => { err ? console.error(err.message) : [] })

      .all(`SELECT * from sqlite_sequence where name='categories'`, (err, resp) => { err ? console.error(err.message) : fuckyou(resp[0].seq) });

    function fuckyou(catID) {
      if (cat.subcats.length > 0) {
        cat.subcats.forEach(subcat => {
          db.each(`INSERT INTO subcategories (maincatid, title, budget, active) VALUES ('${catID}', '${subcat.title}', '${subcat.budget}', '${subcat.active}' )`, (err, resp) => { err ? console.error(err.message) : []; });
        });
      }
      db.close((err) => {
        err ? console.error(err.message) : res.send('gucci');
        console.log('Connection to MI HQ database has been closed.');
      });
    }
  });
}

function addSubCat(req, res) {
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
    db.each(`UPDATE categories SET title='${cat.title}', type='${cat.type}', icon='${cat.icon}', bgcolor='${cat.bgcolor}', textcolor='${cat.textcolor}', active='${cat.active}' WHERE id='${cat.id}'`, (err, resp) => { err ? console.error(err.message) : []; });

    db.each(`DELETE FROM subcategories WHERE maincatid='${cat.id}'`, (err, resp) => { err ? console.error(err.message) : []; });

    if (cat.subcats.length > 0) {

      cat.subcats.forEach(subcat => {
        db.each(`INSERT INTO subcategories (id, maincatid, title, budget, active) VALUES ('${subcat.id}', '${subcat.maincatid}', '${subcat.title}', '${subcat.budget}', '${subcat.active}' )`, (err, resp) => { err ? console.error(err.message) : []; });
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
    db.each(`SELECT * FROM categories ORDER BY id DESC`, (err, cat) => {
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
      if (category.id === subcat.maincatid) { catIndex = i; return }
    });
    subcat.active === 'true' ? subcat.active = true : subcat.active = false;
    categories[catIndex].subcats.push(subcat)
  }
}

