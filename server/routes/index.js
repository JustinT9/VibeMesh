const express = require("express"); 
const trackAnalyzeRoute = require("./trackAnalyze.js"); 

const router = express.Router(); 

router.use("/track-analyze", trackAnalyzeRoute); 

module.exports = router; 