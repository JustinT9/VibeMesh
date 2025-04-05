const express = require("express"); 
const router  = express.Router(); 

const trackProcessRoute = require("./trackProcess.js"); 
const trackAnalyzeRoute = require("./trackAnalyze.js"); 
const trackInfoRoute    = require("./trackInfo.js"); 

router.use("/track-process", trackProcessRoute); 
router.use("/track-analyze", trackAnalyzeRoute); 
router.use("/track-info", trackInfoRoute); 

module.exports = router; 