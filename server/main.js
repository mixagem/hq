import { genDailySumAcomEvo, genDailyCategoriesEvo, getDailyCatDetails, getDailySubCatDetails, getDailyDetails} from './overviewMethods.js';
import { addNewTreasurylog, updateTreasuryLog, fetchTreasuryLogs, deleteTreasuryLog } from './treasuryMethods.js';
import { fetchCategories, createNewCategory, deleteCategory, updateCategory, getSubcategorySequence } from './categoriesMethods.js'
import express from 'express';
import cors from 'cors';

const app = express();
const port = 16190;

app.listen(port, () => console.log(".: MI HQ - Listening on port 16190 :."));

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));




// overview
app.post('/dailysumevo', function (req, res) { return genDailySumAcomEvo(req, res); }); //snapshot
app.post('/dailycatsevo', function (req, res) { return genDailyCategoriesEvo(req, res); }); //snapshot
app.post('/getdailydetails', function(req,res) { return getDailyDetails(req,res)})
app.post('/getdailycatdetails', function(req,res) { return getDailyCatDetails(req,res)})
app.post('/getdailysubcatdetails', function(req,res) { return getDailySubCatDetails(req,res)})

// categories
app.get('/fetchcats', function (req, res) { return fetchCategories(req, res); });
app.get('/currentsubcategorysequence', function (req, res) { return getSubcategorySequence(req, res); });
app.post('/createnewcategory', function (req, res) { return createNewCategory(req, res); });
app.post('/deletecategory', function (req, res) { return deleteCategory(req, res); });
app.post('/updatecategory', function (req, res) { return updateCategory(req, res); });

// treasury
app.get('/fetchtreasurylogs', function (req, res) { return fetchTreasuryLogs(req, res); });
app.post('/deletetreasurylog', function (req, res) { return deleteTreasuryLog(req, res); });
app.post('/updatetreasurylog', function (req, res) { return updateTreasuryLog(req, res); });
// app.post('/createtreasurylog', function (req, res) { return addNewTreasurylog(req, res); });


// TODO SNAPSHOT PARA TODOS REDO
// no post, recebemos 1 array com as categorias para fazer snapshot
// por cada objeto de array, fazer uma query do genero select value from treasurylog where data < {data_recebida} and cat = {cat_recebida}
// no ultimo item do foreach, envia para a fuckyou4, onde fazemos o tratamento e fazemos o db.close, ssuka