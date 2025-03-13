const express        = require("express");
const path           = require("path");
const router         = express.Router(); 
const fs             = require("fs"); 
const asyncFS        = require("fs").promises;
const { pipeline }   = require("stream"); 
const { promisify }  = require("util");
const streamPipeline = promisify(pipeline); 

const { retrieveMediaUsage, retrieveJobs } = require("../logger"); 

require("dotenv").config();

const getAccessToken = async() => {
    try {
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
        
        return accessToken; 
    } catch (error) {
        console.log(error); 
    }
}; 

// Assumes it exists in the directory 
const retrieveTrackandPath = async() => {
    try {   
        const trackName = "ItJustFeelsGood";
        const tracks    = await asyncFS.readdir("./tracks");
        if (tracks.includes(`${trackName}.mp3`)) {
            const trackPath = path.resolve(__dirname, "..", "tracks", `${trackName}.mp3`);
            return { trackName: trackName, trackPath: trackPath }; 
        }
    } catch (err) {
        console.log(err); 
    }
}; 

const retrieveUploadURL = async(
    accessToken, 
    trackName 
) => {
    try {
        const response = await fetch("https://api.dolby.com/media/input", {
            method: "POST", 
            headers: {
                "Authorization": `Bearer ${accessToken}`, 
                "Accept": "application/json", 
                "Content-Type": "application/json" 
            }, 
            body: JSON.stringify({
                url: `dlb://vibemesh/${trackName}.mp3`
            })
        }); 

        if (!response.ok) {
            throw new Error(`Status: ${response.status}`); 
        }

        const url = await response.json();

        return url; 
    } catch (error) {
        console.log(error); 
    } 
}; 

const uploadTrackToCloud = async(
    accessToken,    
    trackName, 
    trackPath
) => {
    try {
        const requestUploadURL    = await retrieveUploadURL(accessToken, trackName); 
        const endpoint            = requestUploadURL.url;   
        const readableTrackStream = fs.createReadStream(trackPath); 
        const trackStats          = fs.statSync(trackPath); 

        console.log("ENDPOINT:", endpoint); 

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

        // console.log("File Uploaded:", response); 

    } catch (error) {
        console.log(error); 
    }
}; 

const getTrackJobID = async(
    accessToken, 
    trackName
) => {
    try {
        const response = await fetch("https://api.dolby.com/media/analyze/music", {
            method: "POST", 
            headers: {
                "Authorization": `Bearer ${accessToken}`, 
                "Accept": "application/json", 
                "Content-Type": "application/json"
            }, 
            body: JSON.stringify({
                input: `dlb://vibemesh/${trackName}.mp3`,
                output: `dlb://vibemesh/${trackName}.json`
            }) 
        }); 

        if (!response.ok) {
            throw new Error(`status: ${response.status}`); 
        }

        const json  = await response.json(); 
        // console.log(response); 
        const jobID = json.job_id; 
        // console.log(jobID); 

        return jobID; 
    } catch (error) {
        console.log(error); 
    }
}; 

const getTrackAnalysis = async(
    accessToken, 
    jobID
) => {
    try {
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
        console.log(json); 
        
        if (json.status !== "Success" || 
            json.status !== "Failed" || 
            json.status !== "Cancelled") {
            setTimeout(async() => await getTrackAnalysis(accessToken, jobID), 10000);
        }
        
    } catch (error) {
        console.log(error); 
    }
}; 

const retrieveDownloadURL = async(
    accessToken, 
    trackName
) => {
    try {
        const response = await fetch("https://api.dolby.com/media/output", {
            method: "POST", 
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }, 
            body: JSON.stringify({
                url: `dlb://vibemesh/${trackName}.json`
            })
        }); 

        if (!response.ok) {
            throw new Error(`Status ${response.status}`); 
        }

        const url = await response.json();

        return url; 
    } catch (error) {
        console.log(error); 
    }
}; 

const downloadAnalysis = async(
    accessToken, 
    trackName 
) => {
    try {
        const downloadURL = await retrieveDownloadURL(accessToken, trackName); 
        const endpoint    = downloadURL.url;
        const outputPath  = path.resolve(__dirname, "..", "logs", `${trackName}.json`);
    
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error(`status: ${response.status}`); 
        } 

        fs.open(outputPath, "w+", (error, f) => { 
            if (error) {
                return console.err(error); 
            }; 

            console.log("File opened!"); 
        });

        await streamPipeline(response.body, fs.createWriteStream(outputPath)); 
        console.log(`${trackName}.json downloaded!`); 

    } catch (error) {
        console.log(error); 
    }
}; 

router.get("/", async(req, res) => {
    const accessToken = await getAccessToken(); 
    const { trackName, trackPath } = await retrieveTrackandPath(); 

    uploadTrackToCloud(accessToken, trackName, trackPath); 

    const jobID = await getTrackJobID(accessToken, trackName); 
    await getTrackAnalysis(accessToken, jobID); 
    await downloadAnalysis(accessToken, trackName);  

    // retrieveJobs(accessToken, "2025-03-01T00:00:01Z", "2025-03-05T00:00:01Z"); 
}); 

module.exports = router;  