const express = require("express");
const path    = require("path");
const router  = express.Router(); 
const fs      = require("fs"); 
const asyncFS = require("fs").promises;

const { pipeline }   = require("stream"); 
const { promisify }  = require("util");  
const streamPipeline = promisify(pipeline); 

const { 
    retrieveTrackPath, 
    getTrackMetadata
} = require("../util/util"); 

const { 
    uploadTrackAnalysisToS3Bucket, 
    getTrackAnalysisFromS3Bucket
} = require("../util/s3"); 

require("dotenv").config(); 

const getAccessToken = async() => { 
    try {
        console.log("In getAccessToken()"); 
        const auth     = Buffer.from(`${process.env.TRACK_ANALYZE_KEY}:${process.env.TRACK_ANALYZE_SECRET}`).toString("base64"); 
        const response = await fetch("https://api.dolby.io/v1/auth/token", {
            method: "POST", 
            headers: {
                "Authorization": `Basic ${auth}`,
                "Accept": "application/json", 
                "Cache-Control": "no-cache", 
                "Content-Type": "application/x-www-form-urlencoded" 
            }, 
            body: new URLSearchParams({
                grant_type: "client_credentials", 
            }) 
        });  

        if (!response.ok) {
            throw new Error(`status: ${response.status}`); 
        }
    
        const json        = await response.json(); 
        const accessToken = json.access_token;
        return new Promise(resolve => resolve(accessToken)); 
    } catch (error) {
        console.log(error); 
    }
}; 

const retrieveUploadURL = async(
    accessToken, 
    trackname 
) => {
    try {
        console.log("In retrieveUploadURL()"); 
        const response = await fetch("https://api.dolby.com/media/input", {
            method: "POST", 
            headers: {
                "Authorization": `Bearer ${accessToken}`, 
                "Accept": "application/json", 
                "Content-Type": "application/json" 
            }, 
            body: JSON.stringify({
                url: `dlb://vibemesh/${trackname}.mp3`
            })
        }); 

        if (!response.ok) {
            throw new Error(`Status: ${response.status}`); 
        }

        const url = await response.json();
        return new Promise(resolve => resolve(url)); 
    } catch (error) {
        console.log(error); 
    } 
}; 

const uploadTrackToCloud = async(
    accessToken,    
    trackname, 
    trackPath
) => {
    try {
        console.log("In uploadTrackToCloud()");
        const requestUploadURL    = await retrieveUploadURL(accessToken, trackname); 
        const endpoint            = requestUploadURL.url;   
        const readableTrackStream = fs.createReadStream(trackPath); 
        const trackStats          = fs.statSync(trackPath); 

        const response = await fetch(endpoint, {
            method: "PUT", 
            headers: {
                "Content-Type": "application/octet-stream", 
                "Content-Length": trackStats.size
            }, 
            body: readableTrackStream 
        }); 

        if (!response.ok) {
            throw new Error(`Status: ${response.status}`); 
        }

        return new Promise((resolve) => resolve()); 
    } catch (error) {
        console.log(error); 
    }
}; 

const getTrackJobAnalysisID = async(
    accessToken, 
    trackname
) => {
    try {
        console.log("In getTrackJobAnalysisID()"); 
        const response = await fetch("https://api.dolby.com/media/analyze/music", {
            method: "POST", 
            headers: {
                "Authorization": `Bearer ${accessToken}`, 
                "Accept": "application/json", 
                "Content-Type": "application/json"
            }, 
            body: JSON.stringify({
                input: `dlb://vibemesh/${trackname}.mp3`,
                output: `dlb://vibemesh/${trackname}.json`
            }) 
        }); 

        if (!response.ok) {
            throw new Error(`status: ${response.status}`); 
        }
        
        const json  = await response.json(); 
        const jobID = json.job_id; 
        return new Promise(resolve => resolve(jobID)); 
    } catch (error) {
        console.log(error); 
    }
}; 

const getTrackJobAnalysisStatus = async(
    accessToken, 
    jobID
) => {
    try {
        console.log("In getTrackJobAnalysisStatus()"); 
        let status = "Pending"; 
        while (status !== "Success" && status !== "Failed" && status !== "Cancelled") {
            const response = await fetch(`https://api.dolby.com/media/analyze/music?job_id=${jobID}`, {
                method: "GET", 
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Accept": "application/json", 
                    "Content-Type": "application/json"
                }
            }); 
    
            if (!response.ok) {
                throw new Error(`status: ${response.status}`); 
            }
            
            const json = await response.json(); 
            status     = json.status; 
            console.log(json); 
        } 

        return new Promise(resolve => resolve()); 
    } catch (error) {
        throw new Error(error); 
    }
}

const retrieveDownloadURL = async(
    accessToken, 
    trackname
) => {
    try {
        console.log("In retrieveDownloadURL()"); 
        const response = await fetch("https://api.dolby.com/media/output", {
            method: "POST", 
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }, 
            body: JSON.stringify({
                url: `dlb://vibemesh/${trackname}.json`
            })
        }); 

        if (!response.ok) {
            throw new Error(`Status ${response.status}`); 
        }

        const url = await response.json();
        return new Promise(resolve => resolve(url)); 
    } catch (error) {
        console.log(error); 
    }
}; 

const downloadTrackAnalysis = async(
    accessToken, 
    trackname 
) => {
    try {
        console.log("In downloadTrackAnalysis()"); 
        const downloadURL = await retrieveDownloadURL(accessToken, trackname); 
        const endpoint    = downloadURL.url;
        const outputPath  = path.resolve(__dirname, "..", "logs", `${trackname}.json`);
    
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`status: ${response.status}`); 
        } 

        fs.open(outputPath, "w+", (error, f) => { 
            if (error) {
                throw new Error(error); 
            }; 
            console.log("File opened!"); 
        });

        await streamPipeline(response.body, fs.createWriteStream(outputPath)); 
        console.log(`${trackname}.json downloaded!`); 
        return new Promise(resolve => resolve()); 
    } catch (error) {
        console.log(error); 
    }
};  

const parseTrackAnalysis = async(
    trackname
) => {
    try {
        console.log("In parseTrackAnalysis()"); 
        const analysisPath  = path.resolve(__dirname, "..", "logs", `${trackname}.json`); 
        const data          = await asyncFS.readFile(analysisPath, { encoding: "utf-8" }); 
        const trackAnalysis = JSON.parse(data);
        
        const trackMetadata     = await getTrackMetadata(trackname); 
        const sections          = trackAnalysis["processed_region"]["audio"]["music"]["sections"][0]; 
        const trackAnalysisJSON = {
            name: trackname, 
            ...trackMetadata, 
            duration: sections["duration"], 
            loudness: sections["loudness"], 
            bpm: sections["bpm"], 
            keys: sections["key"], 
            genres: sections["genre"], 
            instrumentals: sections["instrument"]
        }; 

        console.log("analysis parsed..."); 
        return new Promise(resolve => resolve(JSON.stringify(trackAnalysisJSON))); 
    } catch (error) {
        console.log(error); 
    }
}

router.get("/:trackname", async(req, res) => {
    try {
        const trackname           = req.params.trackname; 
        const data                = await getTrackAnalysisFromS3Bucket(trackname);
        const parsedTrackAnalysis = JSON.parse(data.Body.toString("utf8")); 

        res.status(200).json(parsedTrackAnalysis); 
    } catch (error) {
        console.log(error); 
        res.status(500).json(error); 
    }
}); 

router.post("/", async(req, res) => {
    try {
        const trackname = req.body.trackname; 
        const trackPath = await retrieveTrackPath(trackname); 
        
        const accessToken = await getAccessToken(); 
        await uploadTrackToCloud(accessToken, trackname, trackPath); 

        const jobID = await getTrackJobAnalysisID(accessToken, trackname); 
        await getTrackJobAnalysisStatus(accessToken, jobID); 
        await downloadTrackAnalysis(accessToken, trackname);  

        const parsedTrackAnalysis = await parseTrackAnalysis(trackname);         
        await uploadTrackAnalysisToS3Bucket(trackname, parsedTrackAnalysis); 
        res.status(201).json(parsedTrackAnalysis); 
    } catch (error) {
        console.log(error); 
        res.status(500).json(error); 
    }
}); 

module.exports = router;  