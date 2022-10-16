import { genDailySumAcomEvo, genDailyCategoriesEvo, getDailyCatDetails, getDailySubCatDetails, getDailyDetails} from './overviewMethods.js';
import { addNewTreasurylog, updateTreasuryLog, fetchTreasuryLogs, deleteTreasuryLog } from './treasuryMethods.js';
import { fetchCategories, createNewCategory, deleteCategory, updateCategory, getSubcategorySequence } from './categoriesMethods.js'
import express from 'express';
import cors from 'cors';

const APP = express();
const PORT = 16190;

APP.use(express.json());
APP.use(cors());
APP.use(express.urlencoded({ extended: true }));


APP.listen(PORT, () => console.log(".: MI HQ - Listening on port 16190 :."));


// overview
APP.post('/dailysumevo', function (req, res) { return genDailySumAcomEvo(req, res); }); //snapshot
APP.post('/dailycatsevo', function (req, res) { return genDailyCategoriesEvo(req, res); }); //snapshot
APP.post('/getdailydetails', function(req,res) { return getDailyDetails(req,res)})
APP.post('/getdailycatdetails', function(req,res) { return getDailyCatDetails(req,res)})
APP.post('/getdailysubcatdetails', function(req,res) { return getDailySubCatDetails(req,res)})

// categories
APP.get('/fetchcats', function (req, res) { return fetchCategories(req, res); });
APP.get('/currentsubcategorysequence', function (req, res) { return getSubcategorySequence(req, res); });
APP.post('/createnewcategory', function (req, res) { return createNewCategory(req, res); });
APP.post('/deletecategory', function (req, res) { return deleteCategory(req, res); });
APP.post('/updatecategory', function (req, res) { return updateCategory(req, res); });

// treasury
APP.get('/fetchtreasurylogs', function (req, res) { return fetchTreasuryLogs(req, res); });
APP.post('/deletetreasurylog', function (req, res) { return deleteTreasuryLog(req, res); });
APP.post('/updatetreasurylog', function (req, res) { return updateTreasuryLog(req, res); });
APP.post('/createtreasurylog', function (req, res) { return addNewTreasurylog(req, res); });


// TODO SNAPSHOT PARA TODOS REDO
// no post, recebemos 1 array com as categorias para fazer snapshot
// por cada objeto de array, fazer uma query do genero select value from treasurylog where data < {data_recebida} and cat = {cat_recebida}
// no ultimo item do foreach, envia para a fuckyou4, onde fazemos o tratamento e fazemos o db.close, ssuka