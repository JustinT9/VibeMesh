const express = require("express"); 
const trackProcessRoute = require("./trackProcess.js"); 
const trackAnalyzeRoute = require("./trackAnalyze.js"); 

const router = express.Router(); 

router.use("/track-process", trackProcessRoute); 
router.use("/track-analyze", trackAnalyzeRoute); 

module.exports = router; 