const express = require("express");
const fs      = require("fs"); 
const asyncFS = require("fs").promises;
const path    = require("path");
const router  = express.Router(); 

require("dotenv").config();

// Currently, I am utilizing the analyze music API endpoints to fetch json data for tracks 
// I request for. For the most part with the implementation, I followed the documentation:
// https://docs.dolby.io/media-apis/docs/introduction-to-media-processing and 
// I followed this tutorial https://docs.dolby.io/media-apis/docs/quick-start-to-analyzing-music 

// First, for me to be able to utilize the analyze music endpoints, I have to first send a 
// POST request for the authentication access token via /auth/token endpoint
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

// Within my repo, I am testing a sample track and retrieving its path to get the mp3 file 
// for the endpoints that will need both the trackname and track mp3  
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

// I am utilizing this endpoint to upload my mp3 file via a POST request, but first I need to 
// access the cloud url that I need to upload my mp3 file to 
// https://docs.dolby.io/media-apis/reference/media-input-post
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

// After I get my url to the cloud, I utilize this URL to create a PUT request where 
// I upload the actual mp3 file which my program is able to find its path via 
// the method I have implemented earlier 
// https://docs.dolby.io/media-apis/reference/media-input-post
const uploadTrackToCloud = async(
    accessToken,    
    trackName, 
    trackPath
) => {
    try {
        const requestUploadURL = await retrieveUploadURL(accessToken, trackName); 
        const urlEndpoint      = requestUploadURL.url;   

        const response = await fetch(urlEndpoint, {
            method: "PUT", 
            headers: {
                "Content-Type": "application/octet-stream", 
                "Content-Length": fs.statSync(trackPath).size
            }, 
            body: fs.createReadStream(trackPath)
        }); 

        if (!response.ok) {
            throw new Error(`Status: ${response.status}`); 
        }
        console.log("File Uploaded:", response); 

    } catch (error) {
        console.log(error); 
    }
}; 

// Now, I have uploaded the input file that the API will analyze and its time for me to 
// produce a job ID with this POST request so I can retrieve a response 
// https://docs.dolby.io/media-apis/reference/media-analyze-music-post
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

// I utilize this endpoint via a GET request to check up on my the status of my job and 
// inspect whether it has successful been processed indicating that I am able to retrieve the data I needed
// https://docs.dolby.io/media-apis/reference/media-analyze-music-get
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
        
        // Polling implementation, where I call every 3000 ms to check on the status 
        // However, the status remains stuck on running at 0% until it stops by giving 
        // an failure status, which is odd since the jobID and previous requests return a 200 
        // status indicating it being valid 
        if (json.status !== "Success") {
            setTimeout(() => getTrackAnalysis(accessToken, jobID), 3000);
        }
        
    } catch (error) {
        console.log(error); 
    }
}; 

router.get("/", async(req, res) => {
    const { trackName, trackPath } = await retrieveTrackandPath(); 
    const accessToken = await getAccessToken(); 

    uploadTrackToCloud(accessToken, trackName, trackPath); 
    const jobID = await getTrackJobID(accessToken); 
    console.log("JOB_ID", jobID);

    // wait until the data for the analysis is returned, but it is never for some reason...
    await getTrackAnalysis(accessToken, jobID);
}); 

module.exports = router; 