const express = require("express"); 
const router  = express.Router(); 

const trackProcessRoute    = require("./trackProcess.js"); 
const trackAnalyzeRoute    = require("./trackAnalyze.js"); 
const trackCharacteristics = require("./trackCharacteristics.js"); 
const trackInfo            = require("./trackInfo.js"); 

router.use("/track-process", trackProcessRoute); 
router.use("/track-analyze", trackAnalyzeRoute); 
router.use("/track-characteristics", trackCharacteristics); 
router.use("/track-info", trackInfo); 

module.exports = router; 