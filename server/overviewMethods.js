import sqlite3 from 'sqlite3';

// snapshot total acumulado
export function genDailySumEvo(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });


  const dateObj = new Date('2022-01-01T00:00:00.000Z')
  dateObj.setMonth(req.body.month-1)
  dateObj.setFullYear(req.body.year)

  const dateObj2 = new Date('2022-01-01T00:00:00.000Z')
  dateObj2.setMonth(req.body.month)
  dateObj2.setFullYear(req.body.year)

  const dateInMillisecs = dateObj.getTime();
  const dateInMillisecs2 = dateObj2.getTime();

  let monthlyMovments = [];
  let initialSum = [];

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date < ${dateInMillisecs2} AND date >= ${dateInMillisecs}`, (err, row) => { err ? console.error(err.message) : monthlyMovments.push(row) })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='income' AND date < ${dateInMillisecs - 1}`, (err, row) => { err ? console.error(err.message) : initialSum.push(Object.values(row[0])[0]) })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='expense' AND date < ${dateInMillisecs - 1}`, (err, row) => { err ? console.error(err.message) : initialSum.push(Object.values(row[0])[0]) })
  })

  function fuckyou3() {
    let dailySumEvo = [];
    let initialSumCalculated = 0;

    initialSum.forEach((sum, i) => {
      if (sum !== null) { i === 0 ? initialSumCalculated += sum : initialSumCalculated -= sum }
    });

    for (let i = 0; i < req.body.days; i++) {

      let dailysum = 0;

      if (i === 0) { dailysum += initialSumCalculated }
      if (i !== 0) { dailysum += dailySumEvo[i - 1] }


      monthlyMovments.forEach(movement => {

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