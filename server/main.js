import { genDailySumAcomEvo, genDailyCategoriesEvo } from './overviewMethods.js';
import { addNewTreasurylog, updateTreasuryLog, fetchTreasuryLogs, deleteTreasuryLog } from './treasuryMethods.js';
import { getCategories, createNewCategory, deleteCategory, addSubCategory, removeSubCategory, saveCategory } from './categoriesMethods.js'
import express from 'express';

const app = express();
const port = 16190;

app.listen(port, () => console.log(".: MI HQ - Listening on por 16190 :."));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// overview
app.post('/dailysumevo', function (req, res) { return genDailySumAcomEvo(req, res); });
app.post('/dailycatsevo', function (req, res) { return genDailyCategoriesEvo(req, res); });

// categories
app.get('/getcats', function (req, res) { return getCategories(req, res); });
app.post('/addcat', function (req, res) { return createNewCategory(req, res); });
app.post('/removecat', function (req, res) { return deleteCategory(req, res); });
app.post('/addsubcat', function (req, res) { return addSubCategory(req, res); });
app.post('/removesubcat', function (req, res) { return removeSubCategory(req, res); });
app.post('/savecat', function (req, res) { return saveCategory(req, res); });

// treasury
app.get('/gettlogs', function (req, res) { return fetchTreasuryLogs(req, res); });
app.post('/removetlog', function (req, res) { return deleteTreasuryLog(req, res); });
app.post('/savetlog', function (req, res) { return updateTreasuryLog(req, res); });
app.post('/addtlog', function (req, res) { return addNewTreasurylog(req, res); });


// TODO SNAPSHOT PARA TODOS REDO
// no post, recebemos 1 array com as categorias para fazer snapshot
// por cada objeto de array, fazer uma query do genero select value from treasurylog where data < {data_recebida} and cat = {cat_recebida}
// no ultimo item do foreach, envia para a fuckyou4, onde fazemos o tratamento e fazemos o db.close, ssuka