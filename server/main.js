import { savingsGraphSnapshot, generateCatGraphSnapshot } from './savingsMethods.js'
import { createBudgetlog,  fetchBudgetLogs } from './budgetingMethods.js';
import { dailyTotalAcomulatedSnapshot, monthlySnapshots, dailyCatDetails, dailySubCatDetails, dailyTotalDetails } from './monthlyViewMethods.js';
import { monthlyTotalAcomulatedSnapshot, yearlySnapshots, monthlyCatDetails, monthlySubCatDetails, monthlyTotalDetails } from './yearlyViewMethods.js';
import { orderCategories, orderSubCategories, fetchCategories, createNewCategory, deleteCategory, updateCategory, getSubcategorySequence } from './categoriesMethods.js'
import { deleteAllRecurrencies, dettachRecurrency, updateRecurrency, getRecurencyLogs, createTreasurylog, updateTreasuryLog, fetchTreasuryLogs, deleteTreasuryLog } from './treasuryMethods.js';


import express from 'express';
import cors from 'cors';

const APP = express();
const PORT = 16190;

APP.use(express.json());
APP.use(cors());
APP.use(express.urlencoded({ extended: true }));
APP.listen(PORT, () => console.log(".: MI HQ - Listening on port 16190 :."));

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
APP.post('/createtreasurylog', function (req, res) { return createTreasurylog(req, res); });
APP.post('/deletetreasurylog', function (req, res) { return deleteTreasuryLog(req, res); });
APP.post('/updatetreasurylog', function (req, res) { return updateTreasuryLog(req, res); });
APP.post('/getrecurencylogs', function (req, res) { return getRecurencyLogs(req, res); });
APP.post('/updaterecurrency', function (req, res) { return updateRecurrency(req, res); });
APP.post('/dettachrecurrency', function (req, res) { return dettachRecurrency(req, res); });
APP.post('/deleteallrecurrencies', function (req, res) { return deleteAllRecurrencies(req, res); });

// budgeting
APP.get('/fetchbudgets', function (req, res) { return fetchBudgetLogs(req, res); });
APP.post('/createbudgetlog', function (req, res) { return createBudgetlog(req, res); });

// savings
APP.post('/savingsgraphsnapshot', function (req, res) { return savingsGraphSnapshot(req, res); });
APP.post('/testesnapshot', function (req, res) { return generateCatGraphSnapshot(req, res); });
