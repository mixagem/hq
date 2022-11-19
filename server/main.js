import { evoGraph, saveGraphConfig, fetchGraphConfig, savingsGraphSnapshot, generateCatGraphSnapshot } from './fi/analysisMethods.js'
import { insertEFatura, fetchEFaturaSnapshots, movmentsNotValidated, saveEfatCatsSelection } from './fi/efaturaMethods.js'
import { dailyTotalAcomulatedSnapshot, monthlySnapshots, dailyCatDetails, dailySubCatDetails, dailyTotalDetails } from './fi/grid-view/monthlyViewMethods.js';
import { monthlyTotalAcomulatedSnapshot, yearlySnapshots, monthlyCatDetails, monthlySubCatDetails, monthlyTotalDetails } from './fi/grid-view/yearlyViewMethods.js';
import { orderCategories, orderSubCategories, fetchCategories, createNewCategory, deleteCategory, updateCategory, getSubcategorySequence } from './fi/categoriesMethods.js'
import { deleteAllRecurrencies, dettachRecurrency, updateRecurrency, getRecurencyLogs, createTreasurylog, updateTreasuryLog, fetchTreasuryLogs, deleteTreasuryLog, createBudgetlog, fetchBudgetLogs } from './fi/treasuryMethods.js';
import { tlogSearch, saveSearch, fetchAdvancedSearches, getSearchParamsSequence, addNewSearch, deleteSearch, advancedTlogSearch } from './fi/searchMethods.js'

import express from 'express';
import cors from 'cors';

const APP = express();
const PORT = 16190;

APP.use(express.json());
APP.use(cors());
APP.use(express.urlencoded({ extended: true }));
APP.listen(PORT, () => console.log(".: MI HQ - Listening on port 16190 :."));

// finance -V

// categories
APP.get('/fetchcats', function (req, res) { return fetchCategories(req, res); });
APP.get('/currentsubcategorysequence', function (req, res) { return getSubcategorySequence(req, res); });
APP.post('/createnewcategory', function (req, res) { return createNewCategory(req, res); });
APP.post('/deletecategory', function (req, res) { return deleteCategory(req, res); });
APP.post('/updatecategory', function (req, res) { return updateCategory(req, res); });
APP.post('/ordercategories', function (req, res) { return orderCategories(req, res); });
APP.post('/ordersubcategories', function (req, res) { return orderSubCategories(req, res); });

// treasury / budget
APP.get('/fetchtreasurylogs', function (req, res) { return fetchTreasuryLogs(req, res); });
APP.get('/fetchbudgets', function (req, res) { return fetchBudgetLogs(req, res); });
APP.post('/createtreasurylog', function (req, res) { return createTreasurylog(req, res); });
APP.post('/createbudgetlog', function (req, res) { return createBudgetlog(req, res); });
APP.post('/deletetreasurylog', function (req, res) { return deleteTreasuryLog(req, res); });
APP.post('/updatetreasurylog', function (req, res) { return updateTreasuryLog(req, res); });
APP.post('/getrecurencylogs', function (req, res) { return getRecurencyLogs(req, res); });
APP.post('/updaterecurrency', function (req, res) { return updateRecurrency(req, res); });
APP.post('/dettachrecurrency', function (req, res) { return dettachRecurrency(req, res); });
APP.post('/deleteallrecurrencies', function (req, res) { return deleteAllRecurrencies(req, res); });

// grid :: yearly-view
APP.post('/monthlysumevo', function (req, res) { return monthlyTotalAcomulatedSnapshot(req, res); }); //snapshot
APP.post('/monthlycatsevo', function (req, res) { return yearlySnapshots(req, res); }); //snapshot
APP.post('/monthlydetails', function (req, res) { return monthlyTotalDetails(req, res) })
APP.post('/monthlycatdetails', function (req, res) { return monthlyCatDetails(req, res) })
APP.post('/monthlysubcatdetails', function (req, res) { return monthlySubCatDetails(req, res) })
// grid :: monthly-view
APP.post('/dailysumevo', function (req, res) { return dailyTotalAcomulatedSnapshot(req, res); }); //snapshot
APP.post('/dailycatsevo', function (req, res) { return monthlySnapshots(req, res); }); //snapshot
APP.post('/dailydetails', function (req, res) { return dailyTotalDetails(req, res) })
APP.post('/dailycatdetails', function (req, res) { return dailyCatDetails(req, res) })
APP.post('/dailysubcatdetails', function (req, res) { return dailySubCatDetails(req, res) })

// efatura
APP.post('/insertefatura', function (req, res) { return insertEFatura(req, res); });
APP.get('/efaturasnapshots', function (req, res) { return fetchEFaturaSnapshots(req, res); });
APP.get('/tlogstovalidate', function (req, res) { return movmentsNotValidated(req, res); });
APP.post('/efatcatselectionsave', function (req, res) { return saveEfatCatsSelection(req, res); });

// analysis
APP.post('/savingsgraphsnapshot', function (req, res) { return savingsGraphSnapshot(req, res); });
APP.post('/testesnapshot', function (req, res) { return generateCatGraphSnapshot(req, res); });
APP.post('/fetchgraphconfig', function (req, res) { return fetchGraphConfig(req, res); });
APP.post('/savegraphconfig', function (req, res) { return saveGraphConfig(req, res); });
APP.get('/evograph', function (req, res) { return evoGraph(req, res); });

// advanced search
APP.get('/fetchsearches', function (req, res) { return fetchAdvancedSearches(req, res); });
APP.get('/currentsearchparamssequence', function (req, res) { return getSearchParamsSequence(req, res); });
APP.post('/savesearch', function (req, res) { return saveSearch(req, res); });
APP.post('/addnewsearch', function (req, res) { return addNewSearch(req, res); });
APP.post('/tlogsearch', function (req, res) { return tlogSearch(req, res); });
APP.post('/advancedtlogserach', function (req, res) { return advancedTlogSearch(req, res); });
APP.post('/deletesearch', function (req, res) { return deleteSearch(req, res); });


