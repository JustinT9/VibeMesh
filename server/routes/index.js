const express = require("express"); 
const router  = express.Router(); 

const trackProcessRoute    = require("./trackProcess.js"); 
const trackAnalyzeRoute    = require("./trackAnalyze.js"); 
const trackCharacteristics = require("./trackCharacteristics.js"); 

router.use("/track-process", trackProcessRoute); 
router.use("/track-analyze", trackAnalyzeRoute); 
router.use("/track-characteristics", trackCharacteristics); 

module.exports = router; 