const express = require("express"); 
const fs      = require("fs"); 
const path    = require("path"); 
const router  = express.Router(); 

router.post("/", async(req, res) => {   
    console.log(req.body); 
}); 

module.exports = router; 