import sqlite3 from 'sqlite3';

function sumToFixed(...args) { return [...args].reduce((previousValue, currentValue) => Number((previousValue + currentValue).toFixed(2))); }


export function savingsGraphSnapshot(req, res) {

  const YEAR = JSON.parse(req.body.year);

  const DATA_INI = new Date('2022-01-01T00:00:00.000Z'); DATA_INI.setFullYear(YEAR); const DATA_INI_MS = DATA_INI.getTime();
  const DATA_FINI = new Date('2022-01-01T00:00:00.000Z'); DATA_FINI.setFullYear(YEAR + 1); const DATA_FINI_MS = DATA_FINI.getTime() - 1;

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('[S1] generating savings graph snapshot');
  });

  let homeSnapshotArray = {
    name: 'Poupanças casa',
    series: []
  };

  let carSnapshotArray = {
    name: 'Poupanças carro',
    series: []
  };

  let homeMonthlyValues = new Array(12).fill(0);
  let carMonthlyValues = new Array(12).fill(0);


  db.serialize(() => {
    db.all(`SELECT
    (SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND cat = '2' AND subcat = '5' AND type = 'income') as homebadsum,
    (SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND cat = '2' AND subcat = '5' AND type = 'expense') as homegoodsum,
    (SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND cat = '2' AND subcat = '4' AND type = 'income') as carbadsum,
    (SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND cat = '2' AND subcat = '4' AND type = 'expense') as cargoodsum`, (err, result) => {

      console.log(DATA_INI_MS)
      if (err) { console.error(err.message) }
      else {

        if(result[0].homegoodsum == null){result[0].homegoodsum = 0}
        if(result[0].homebadsum == null){result[0].homebadsum = 0}
        if(result[0].cargoodsum == null){result[0].cargoodsum = 0}
        if(result[0].carbadsum == null){result[0].carbadsum = 0}

        homeMonthlyValues[0] = sumToFixed(homeMonthlyValues[0], -result[0].homebadsum, result[0].homegoodsum)
        carMonthlyValues[0] = sumToFixed(carMonthlyValues[0], -result[0].carbadsum, result[0].cargoodsum)
      }

    })



    db.each(`SELECT * FROM treasurylog WHERE date >= ${DATA_INI_MS} AND date < ${DATA_FINI_MS} AND cat = '2' and subcat = '5' ORDER BY date ASC `, (err, homeSavingLog) => {
      if (err) { console.error(err.message) } else {
        const MONTH = new Date(homeSavingLog.date).getMonth();
        homeMonthlyValues[MONTH] = sumToFixed(homeMonthlyValues[MONTH], homeSavingLog.value);


        // homeSnapshotArray.series.push({
        //   date: new Date(savingLog.date).toLocaleString('default', { month: 'long' }),
        //   value: acomulated
        // });
      }
    })


    db.each(`SELECT * FROM treasurylog WHERE date >= ${DATA_INI_MS} AND date < ${DATA_FINI_MS} AND cat = '2' and subcat = '4' ORDER BY date ASC `, (err, carSavingLog) => {
      if (err) { console.error(err.message) } else {
        const MONTH = new Date(carSavingLog.date).getMonth();
        carMonthlyValues[MONTH] = sumToFixed(carMonthlyValues[MONTH], carSavingLog.value);


        // homeSnapshotArray.series.push({
        //   date: new Date(savingLog.date).toLocaleString('default', { month: 'long' }),
        //   value: acomulated
        // });
      }
    })
  });




  db.close((err) => {

    let homeAcomulatedValues = new Array(12).fill(0);
    let carAcomulatedValues = new Array(12).fill(0);

    for (let i = 0; i < 12; i++) {

      if (i === 0) {
        homeAcomulatedValues[i] = homeMonthlyValues[i]
        carAcomulatedValues[i] = carMonthlyValues[i]

      }
      else {
        homeAcomulatedValues[i] = sumToFixed(homeAcomulatedValues[i - 1], homeMonthlyValues[i])
        carAcomulatedValues[i] = sumToFixed(carAcomulatedValues[i - 1], carMonthlyValues[i])
      }

      homeSnapshotArray.series.push({
        name: i,
        value: homeAcomulatedValues[i]
      })

      carSnapshotArray.series.push({
        name: i,
        value: carAcomulatedValues[i]
      })

    }

    console.log(homeSnapshotArray)
    err ? console.error(err.message) : res.send([homeSnapshotArray, carSnapshotArray]);
    console.log('[C1] treasury logs fetch complete');
  });

}
