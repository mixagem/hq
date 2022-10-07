import sqlite3 from 'sqlite3';


// TODO SNAPSHOT PARA TODOS REDO
// no post, recebemos 1 array com as categorias para fazer snapshot
// por cada objeto de array, fazer uma query do genero select value from treasurylog where data < {data_recebida} and cat = {cat_recebida}
// no ultimo item do foreach, envia para a fuckyou4, onde fazemos o tratamento e fazemos o db.close, ssuka


//snapshot para categorias
export function genDailyCategoriesEvo(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Generating categories snapshots...');
  });

  const dataIni = new Date('2022-01-01T00:00:00.000Z')
  dataIni.setMonth(req.body.month - 1)
  dataIni.setFullYear(req.body.year)

  const dataFi = new Date('2022-01-01T00:00:00.000Z')
  dataFi.setMonth(req.body.month)
  dataFi.setFullYear(req.body.year)

  const dataIniMilli = dataIni.getTime();
  const dataFiMilli = dataFi.getTime();

  let categoryList = [];
  let subCategoryList = [];

  let monthlyMovments = [];
  let generatedCategorySnapshots = {};
  let generatedSubCategorySnapshots = {};

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date < ${dataFiMilli} AND date >= ${dataIniMilli}`, (err, row) => { err ? console.error(err.message) : monthlyMovments.push(row) })
      .each(`SELECT * FROM categories WHERE active = 'true' `,(err,row) => {err ? console.error(err.message) : categoryList.push(row.id)})
      .each(`SELECT * FROM subcategories WHERE active = 'true' `,(err,row) => {err ? console.error(err.message) : subCategoryList.push(row.id)})

  })



  db.close((err) => {
    err ? console.error(err.message) : generateSnapshots();
  });


  function generateSnapshots() {

    categoryList.forEach(category => {

      let categorySnapshot = [];

      for (let i = 0; i < req.body.days; i++) {

        let value = 0;
        monthlyMovments.forEach(movement => {

          // console.log(movement)
          // console.log(category)
          if ((new Date(movement.date).getDate()) === i + 1 && movement.cat == category) {
            value += movement.value;
          }

        });

        categorySnapshot[i] = value;
      }

      generatedCategorySnapshots[`${category}`] = categorySnapshot;

    });

    console.log('Categories snapshots sucessfully generated.');
    console.log('Generating subcategories snapshots...');

    subCategoryList.forEach(subcategory => {

      let subCategorySnapshot = [];

      for (let i = 0; i < req.body.days; i++) {

        let value = 0;
        monthlyMovments.forEach(movement => {

          if ((new Date(movement.date).getDate()) === i + 1 && movement.subcat === subcategory) {
            value += movement.value;
          }

        });

        subCategorySnapshot[i] = value;
      }

      generatedSubCategorySnapshots[`${subcategory}`] = subCategorySnapshot;

    });

    console.log('Subcategories snapshots sucessfully generated.');

    res.send([generatedCategorySnapshots,generatedSubCategorySnapshots])

  }
}







// // snapshot para subcategorias
// export function genDailySubCategoriesEvo(req, res) {

//   let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
//     if (err) { console.error(err.message); }
//     console.log('Generating subcategories snapshots...');
//   });

//   const dataIni = new Date('2022-01-01T00:00:00.000Z')
//   dataIni.setMonth(req.body.month - 1)
//   dataIni.setFullYear(req.body.year)

//   const dataFi = new Date('2022-01-01T00:00:00.000Z')
//   dataFi.setMonth(req.body.month)
//   dataFi.setFullYear(req.body.year)

//   const dataIniMilli = dataIni.getTime();
//   const dataFiMilli = dataFi.getTime();

//   let monthlyMovments = [];
//   let generatedSubCategorySnapshots = {};

//   const subCategoryList = req.body.subcategorylist; // select para as categorias que estão ativas

//   db.serialize(() => {

//     db.each(`SELECT * FROM treasurylog WHERE date < ${dataFiMilli} AND date >= ${dataIniMilli}`, (err, row) => { err ? console.error(err.message) : monthlyMovments.push(row) });

//   })

//   db.close((err) => {
//     err ? console.error(err.message) : generateSnapshots();
//   });


//   function generateSnapshots() {

//     subCategoryList.forEach(subcategory => {

//       let subCategorySnapshot = [];

//       for (let i = 0; i < req.body.days; i++) {

//         let value = 0;
//         monthlyMovments.forEach(movement => {

//           if ((new Date(movement.date).getDate()) === i + 1 && movement.subcat === subcategory) {
//             value += movement.value;
//           }

//         });

//         subCategorySnapshot[i] = value;
//       }

//       generatedSubCategorySnapshots[`${subcategory}`] = subCategorySnapshot;

//     });

//     console.log('Subcategories snapshots sucessfully generated.');

//     res.send(generatedCategorySnapshots)

//   }
// }











// snapshot total acumulado
export function genDailySumEvo(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err.message); }
    console.log('Connection to MI HQ database is now open.');
  });


  const dataIni = new Date('2022-01-01T00:00:00.000Z')
  dataIni.setMonth(req.body.month - 1)
  dataIni.setFullYear(req.body.year)

  const dataFi = new Date('2022-01-01T00:00:00.000Z')
  dataFi.setMonth(req.body.month)
  dataFi.setFullYear(req.body.year)

  const dataIniMilli = dataIni.getTime();
  const dataFiMilli = dataFi.getTime();

  let monthlyMovments = [];
  let initialSum = [];

  db.serialize(() => {

    db.each(`SELECT * FROM treasurylog WHERE date < ${dataFiMilli} AND date >= ${dataIniMilli}`, (err, row) => { err ? console.error(err.message) : monthlyMovments.push(row) })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='income' AND date < ${dataIniMilli - 1}`, (err, row) => { err ? console.error(err.message) : initialSum.push(Object.values(row[0])[0]) })
      .all(`SELECT SUM(value) FROM treasurylog WHERE type='expense' AND date < ${dataIniMilli - 1}`, (err, row) => { err ? console.error(err.message) : initialSum.push(Object.values(row[0])[0]) })
  })

  db.close((err) => {
    err ? console.error(err.message) : generateSnapshot();
    console.log('Connection to MI HQ database has been closed.');
  });

  function generateSnapshot() {
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


}