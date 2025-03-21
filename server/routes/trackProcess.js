const express = require("express"); 
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

const analyzeTrack = async(
    trackName
) => {
    try {
        const response = await fetch(`http://localhost:5000/api/track-analyze/${trackName}`, {
            method: "GET", 
            headers: {
                "Accept": "application/json", 
            }
        }); 

        if (!response.ok) {
            throw new Error(`status: ${response.status}`); 
        }

        const json = await response.json(); 
        // console.log(json); 

        return json; 
    } catch (error) {
        console.log(error); 
    }
}; 

router.post("/", upload.single("trackFile"), async(req, res) => {  
    try {
        const file = req.file; 
        if (!file) {
            throw new Error("error"); 
        }

        const trackName     = file.originalname.split(".")[0]; 
        const trackAnalysis = await analyzeTrack(trackName); 
        // console.log(trackAnalysis); 

        res.status(200).send(trackAnalysis);  
    } catch (error) {
        console.log(error); 
        res.status(500).json(error); 
    }
}); 

module.exports = router;