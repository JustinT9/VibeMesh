const express = require("express"); 
const router  = express.Router(); 

const trackProcessRoute = require("./trackProcess.js"); 
const trackAnalyzeRoute = require("./trackAnalyze.js"); 

router.use("/track-process", trackProcessRoute); 
router.use("/track-analyze", trackAnalyzeRoute); 

module.exports = router; 