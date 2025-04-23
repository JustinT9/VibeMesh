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
const upload                               = multer({ storage: storage }); 
const { doesTrackAnalysisExistinS3Bucket } = require("../util/S3"); 
const { renameUploadedFile } = require("../util/util"); 

const getTrackAnalysis = async(
    trackname
) => {
    try {
        const response = await fetch(`http://localhost:5000/api/track-analyze/${trackname}`, {
            method: "GET", 
            headers: {
                "Accept": "application/json", 
            }
        }); 

        if (!response.ok) {
            throw new Error(`status: ${response.status}`); 
        }

        const json = await response.json(); 
        return new Promise(resolve => resolve(json)); 
    } catch (error) {
        console.log(error); 
    }

}; 

const analyzeTrack = async(
    trackname
) => {
    try {
        const response = await fetch("http://localhost:5000/api/track-analyze/", {
            method: "POST", 
            headers: {
                "Accept": "application/json", 
                "Content-Type": "application/json"
            }, 
            body: JSON.stringify({
                trackname: trackname
            })
        }); 

        if (!response.ok) {
            throw new Error(`status: ${response.status}`); 
        }

        const json = await response.json(); 
        return new Promise(resolve => resolve(json)); 
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
        
        const trackname              = await renameUploadedFile(file); 
        const doesTrackAnalysisExist = await doesTrackAnalysisExistinS3Bucket(trackname); 
        if (!doesTrackAnalysisExist) {
            const trackStatus = await analyzeTrack(trackname); 
            res.status(201).send(trackStatus);  
        } else {
            const trackAnalysis = await getTrackAnalysis(trackname); 
            res.status(200).send(trackAnalysis); 
        }
    } catch (error) { 
        console.log(error); 
        res.status(500).json(error); 
    }
}); 

module.exports = router;