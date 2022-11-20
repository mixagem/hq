import sqlite3 from 'sqlite3';

// função para adição/subtração de valores decimais, com arredondamento 2 casas decimais
function sumToFixed(...args) { return [...args].reduce((previousValue, currentValue) => Number((previousValue + currentValue).toFixed(2))); }

export function getGraph(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] } }); console.log('[getGraph start]');

  let DATA_INI; let DATA_INI_MS;
  let DATA_FINI; let DATA_FINI_MS;
  let CONFIG = {}; // config do gráfico
  const TITLES = {}; // títulos categorias/subcategorias utilizadas nos gráficos
  let graphsArray = []; // array de graficos a ser enviado no final da chamada
  let dailyValuesArray = []; // array de valores mensais não acomulados
  let TABLE; let FIELD; // tabela e coluna a serem utilizado de acordo com o target definmido

  (function start() {
    db.all(`SELECT * FROM graphs WHERE id = '${req.body.graphid}'`, (err, result) => {
      if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] }

      // tratamento da config do gráfico
      CONFIG = JSON.parse(result[0]['params']);
      CONFIG.title = result[0]['title'];
      CONFIG.target = result[0]['target'];
      CONFIG.acomul = (result[0]['acomul'] === 'true' ? true : false);

      // tratamento ano/duração definidos
      DATA_INI = new Date('2022-01-01T00:00:00.000Z'); DATA_INI.setFullYear(CONFIG.year); DATA_INI_MS = DATA_INI.getTime();
      DATA_FINI = new Date('2022-01-01T00:00:00.000Z'); DATA_FINI.setFullYear(CONFIG.year + CONFIG.duration); DATA_FINI_MS = DATA_FINI.getTime() - 1;
      CONFIG.duration = CONFIG.duration * 12

      // tabela e colunas a serem utilizados em queries
      if (CONFIG.target === 'subcat') { TABLE = 'subcategories'; FIELD = 'subcat' }
      if (CONFIG.target === 'cat') { TABLE = 'categories'; FIELD = 'cat' }

      // passo seguinte, obter títulos da categoria/subcategorias para o gráfico
      catTitles();
    })
  })();

  function catTitles() {

    // títulos gráficos
    db.each(`SELECT id,title FROM ${TABLE} WHERE id IN(${CONFIG[FIELD].join(', ')})`, (err, result) => {
      if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] }
      TITLES[result['id']] = result['title'];
    })

    db.close((err) => {
      if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] }
      // passo seguinte, obter snapshot dos valores mensais
      initialValue();
    });

  }

  function initialValue() {
    db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] } });

    // query generator
    let query = `SELECT`;

    // por cada categoria/subcategoria da config...
    CONFIG[FIELD].forEach(subcatID => {
      graphsArray.push({ name: TITLES[subcatID], series: [] });  // criar um gráfico
      dailyValuesArray.push(new Array(CONFIG.duration).fill(0)); // criar array de valores

      // obter saldo incial da categoria/subcategoria até à data inicial ao gráfico (caso acomulado)
      if (CONFIG.acomul) {
        query += `
(SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND ${FIELD} = '${subcatID}' AND type = 'income') as ${FIELD}${subcatID}isum,
(SELECT SUM(value)FROM treasurylog WHERE date < ${DATA_INI_MS} AND ${FIELD} = '${subcatID}' AND type = 'expense') as ${FIELD}${subcatID}esum,`
      }
    });

    if (CONFIG.acomul) {
      query = query.slice(0, -1) // remover a vírgula final skyr

      db.all(query, (err, result) => {

        if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] }

        // por cada categoria/subcategoria da config...
        CONFIG[FIELD].forEach((subcatID, i) => {
          // tratamento de resultados nulos
          if (result[0][`${FIELD}${subcatID}esum`] == null) { result[0][`${FIELD}${subcatID}esum`] = 0 }
          if (result[0][`${FIELD}${subcatID}isum`] == null) { result[0][`${FIELD}${subcatID}esum`] = 0 }
          // enviar o saldo inicial para o array de valores
          dailyValuesArray[i][0] = sumToFixed(dailyValuesArray[i][0], -result[0][`${FIELD}${subcatID}isum`], result[0][`${FIELD}${subcatID}esum`]);

          // passo seguinte, geração array de valores
          if (i + 1 === CONFIG[FIELD].length) { graphGen(); }
        });

      });
      // passo seguinte, geração array de valores
    } else { graphGen(); }
  }


  function graphGen() {

    // por cada categoria/subcategoria da config...
    CONFIG[FIELD].forEach((subcatID, i) => {

      // obter todos os movimentos associdados à categoria
      db.each(`SELECT * FROM treasurylog WHERE date >= ${DATA_INI_MS} AND date < ${DATA_FINI_MS} AND ${FIELD} = '${subcatID}' ORDER BY date ASC`, (err, tlog) => {

        if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] }

        let MONTH = new Date(tlog.date).getMonth(); //obter o mês do movimento
        MONTH = MONTH + (((new Date(tlog.date).getFullYear()) - CONFIG.year) * 12) // ajustar o mês do movimento de acordo com o ano do movimento

        // quando invertido, despesas são positivas, rendimentos negativos
        if (CONFIG['inverted'][i]) {
          if (tlog.type === 'income') { dailyValuesArray[i][MONTH] = sumToFixed(dailyValuesArray[i][MONTH], -tlog.value); }
          if (tlog.type === 'expense') { dailyValuesArray[i][MONTH] = sumToFixed(dailyValuesArray[i][MONTH], tlog.value); }
        }

        if (!CONFIG['inverted'][i]) {
          if (tlog.type === 'income') { dailyValuesArray[i][MONTH] = sumToFixed(dailyValuesArray[i][MONTH], tlog.value); }
          if (tlog.type === 'expense') { dailyValuesArray[i][MONTH] = sumToFixed(dailyValuesArray[i][MONTH], -tlog.value); }
        }

      });

    });
    // passo seguinte, tratar acomulumação de valores e títulos dos mêses
    closure();
  }

  function closure() {

    db.close((err) => {

      switch (CONFIG.acomul) {

        case true:
          // criar um novo array para valores acomulados
          let dailyAcomulatedValuesArray = [];
          for (let z = 0; z < CONFIG[FIELD].length; z++) { dailyAcomulatedValuesArray.push(new Array(CONFIG.duration).fill(0)) }

          for (let i = 0; i < CONFIG.duration; i++) {

            // o primeiro "tick" já tem o valor calculado com o saldo inicial até à data do gráfico
            if (i === 0) { dailyAcomulatedValuesArray.forEach((subcat, y) => { subcat[i] = dailyValuesArray[y][i] }); }

            // para os restantes "ticks", o seu valor é incrementado com o valor anterior do registo anterior
            if (i !== 0) { dailyAcomulatedValuesArray.forEach((subcat, y) => { subcat[i] = sumToFixed(subcat[i - 1], dailyValuesArray[y][i]) }); }

            // geração do título do "tick"
            const MONTH = new Date(DATA_INI_MS); MONTH.setMonth(i); const MONTH_TITLE = MONTH.toLocaleString('default', { year: 'numeric', month: 'short' });

            // enviar o valor do título e do "tick" acomulado e para o array
            graphsArray.forEach((graph, y) => { graph.series.push({ name: MONTH_TITLE, value: dailyAcomulatedValuesArray[y][i] }) })

          }
          break;

        // caso não seja acomulado, dá skip a uns quantos cicuitos. era mais fácil para ler partir aqui, apesar do código repetido
        case false:

          for (let i = 0; i < CONFIG.duration; i++) {
            const MONTH = new Date(DATA_INI_MS); MONTH.setMonth(i); const MONTH_TITLE = MONTH.toLocaleString('default', { year: 'numeric', month: 'short' });
            graphsArray.forEach((graph, y) => { graph.series.push({ name: MONTH_TITLE, value: dailyValuesArray[y][i] }) })
          }
          break;

      }

      if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] }
      res.send([CONFIG.title,...graphsArray]); console.log('[getGraph end]');
    });
  }
}

export function fetchGraphConfig(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] } }); console.log('[fetchGraphConfig start]');

  let CONFIG = {}; // config do gráfico

  // obter config do gráfico
  db.each(`SELECT * FROM graphs WHERE id = '${req.body.graphid}'`, (err, row) => {
    if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] }

    // tratamento da config do gráfico
    CONFIG = JSON.parse(row['params']);
    CONFIG.title = row['title'];
    CONFIG.target = row['target'];
    CONFIG.acomul = (row['acomul'] === 'true' ? true : false);
  })

  db.close((err) => {
    if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] }
    res.send(CONFIG); console.log('[fetchGraphConfig end]');
  });
}

export function saveGraphConfig(req, res) {

  let db = new sqlite3.Database('./mhq.db', sqlite3.OPEN_READWRITE, (err) => { if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] } console.log('[fetchGraphConfig start]'); });

  const CONFIG = JSON.parse(req.body.config);  // config do gráfico
  // tratamento da config do gráfico para guardar em bd
  const TITLE = CONFIG.title; const TARGET = CONFIG.target; const ACOMUL = CONFIG.acomul;
  delete CONFIG.title; delete CONFIG.target; delete CONFIG.acomul;

  // atualizar a config em bd
  db.run(`UPDATE graphs SET title = '${TITLE}', target = '${TARGET}', acomul = '${ACOMUL}', params='${JSON.stringify(CONFIG)}' WHERE id='${req.body.graphid}'`, (err) => {
    if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] }
  })

  db.close((err) => {
    if (err) { console.error(err.message); return res.send['MHQERROR', 'getGraph error: ' + err.message] }
    res.send(['Gucci']); console.log('[saveGraphConfig end]');
  });
}