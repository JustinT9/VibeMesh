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

/**
 * Retrieves track analysis from a remote service.
 *
 * @async
 * @function
 * @param {string} trackname - The track's name.
 * @returns {Promise<object>} The analysis data of the track.
 */
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

/**
 * Triggers track analysis for a given track.
 *
 * @async
 * @function
 * @param {string} trackname - The track's name to analyze.
 * @returns {Promise<object>} The status of the analysis request.
 */
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

/**
 * POST /upload
 * Handles track file uploads and checks if track analysis exists.
 * If analysis exists in the S3 bucket, it retrieves and returns it. 
 * If analysis doesn't exist, it triggers the analysis and then returns the status.
 *
 * @route POST /upload
 * @param {object} req.body - The request body contains the track file uploaded by the user.
 * @param {object} req.file - The uploaded file object.
 * @returns {object} JSON response with track analysis status or details.
 *
 * Example response:
 * - If analysis exists: 
 *   {
 *     "track": "cool_song",
 *     "analysisStatus": "success"
 *   }
 * - If analysis doesn't exist and has been triggered:
 *   {
 *     "track": "cool_song",
 *     "status": "analysis in progress"
 *   }
 * 
 * @throws {Error} If there's an error during upload, analysis, or retrieval.
 */
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