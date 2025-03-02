const express = require("express");
const aws     = require("aws-sdk");
const asyncFS = require("fs").promises;
const fs      = require("fs"); 
const path    = require("path");
const router  = express.Router(); 

const { retrieveMediaUsage, retrieveJobs } = require("../logger"); 

require("dotenv").config();

aws.config = {
    region: "us-east-1", 
    accessKeyId: process.env.AWS_S3_KEY, 
    secretAccessKey: process.env.AWS_S3_SECRET
}; 

const s3         = new aws.S3();
const bucketName = "vibemesh"; 

const getAccessToken = async() => {
    try {
        const auth     = Buffer.from(`${process.env.TRACK_ANALYZE_KEY}:${process.env.TRACK_ANALYZE_SECRET}`).toString("base64"); 
        const response = await fetch("https://api.dolby.io/v1/auth/token", {
            method: "POST", 
            body: new URLSearchParams({
                grant_type: "client_credentials", 
                expires_in: 86400 
            }), 
            headers: {
                "Accept": "application/json", 
                "Cache-Control": "no-cache", 
                "Content-Type": "application/x-www-form-urlencoded", 
                "Authorization": `Basic ${auth}`
            }
        }); 

        if (!response.ok) {
            throw new Error(`status: ${response.status}`); 
        }
    
        const json = await response.json(); 
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
                "authorization": `Bearer ${accessToken}`, 
                "Content-Type": "application/json", 
                "Accept": "application/json"
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
        const requestUploadURL = await retrieveUploadURL(accessToken, trackName); 
        const urlEndpoint      = requestUploadURL.url;   
        const readable         = fs.createReadStream(trackPath); 

        const response = await fetch(urlEndpoint, {
            method: "PUT", 
            headers: {
                "Content-Type": "application/octet-stream", 
                "Content-Length": fs.statSync(trackPath).size
            }, 
            body: readable 
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
            body: JSON.stringify({
                input: `dlb://vibemesh/${trackName}.mp3`,
                output: `dlb://vibemesh/${trackName}.json`
            }), 
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
        const jobID = json.job_id; 

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
                accept: "application/json", 
                authorization: `Bearer ${accessToken}`
            }
        }); 

        if (!response.ok) {
            throw new Error(`status: ${response.status}`); 
        }

        const json = await response.json(); 
        console.log(json); 
        
        if (json.status !== "Success") {
            setTimeout(() => getTrackAnalysis(accessToken, jobID), 3000);
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
        const response = fetch("https://api.dolby.com/media/output", {
            method: "POST", 
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }, 
            body: JSON.stringify({
                url: `dlb://vibemesh/${trackName}.mp3`
            })
        }); 
        console.log(await response);
        console.log(await response.urlList) 

        if (!response.ok) {
            throw new Error(`Status ${response.status}`); 
        }

        const url = await response.json();
        console.log(url);

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
        const url = await retrieveDownloadURL(accessToken, trackName); 
        const endpoint = url.url; 
    
        const response = await fetch(endpoint, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(`status: ${response.status}`); 
        }

        console.log(response); 

    } catch (error) {
        console.log(error); 
    }
}; 

router.get("/", async(req, res) => {
    const { trackName, trackPath } = await retrieveTrackandPath(); 
    const accessToken = await getAccessToken(); 

    // uploadTrackToCloud(accessToken, trackName, trackPath); 

    // const jobID = await getTrackJobID(accessToken); 
    // console.log("JOB_ID", jobID);

    // await getTrackAnalysis(accessToken, jobID);
    // downloadAnalysis(accessToken, trackName); 
}); 

module.exports = router; 