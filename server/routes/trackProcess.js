const express = require("express"); 
const fs      = require("fs"); 
const path    = require("path"); 
const router  = express.Router();

const multer  = require("multer"); 
const dest    = path.resolve(__dirname, "..", "uploads"); 
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, dest); 
    }, 
    filename: function(req, file, cb) {
        cb(null, file.originalname); 
    }
})
const upload = multer({ storage: storage }); 

router.post("/", upload.single("trackFile"), async(req, res) => {  
    console.log(req.file);  

    res.sendStatus(200); 
}); 

module.exports = router;