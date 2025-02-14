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
        const trackName = "All My Ladies - Bauer.mp3";
        const tracks    = await asyncFS.readdir("./tracks");
        if (tracks.includes(trackName)) {
            const trackPath = path.resolve(__dirname, "..", "tracks", trackName);
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
                url: `dlb://vibemesh/${trackName}`
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

        const response = await fetch(urlEndpoint, {
            method: "PUT", 
            body: fs.createReadStream(trackPath), 
            headers: {
                "Content-Type": "application/octet-stream", 
                "Content-Length": fs.statSync(trackPath).size
            }, 
        }); 

        if (!response.ok) {
            throw new Error(`Status: ${response.status}`); 
        }

        const json = await response.json(); 
        console.log("File Uploaded", json); 

    } catch (error) {
        console.log(error); 
    }
}; 

const createS3OutputObject = async() => {
    await s3.putObject({
        Body: "", 
        Bucket: bucketName, 
        Key: "All My Ladies.json"
    }, (error, data) => {
        if (error) {
            console.log(error); 
        } else {
            console.log(data); 
        }
    }).promise(); 
}; 

const getTrackJobID = async(accessToken) => {
    try {
        const inputURL = await s3.getSignedUrlPromise("getObject", {
            Bucket: bucketName,
            Key: "All My Ladies - Bauer.mp3",  
            Expires: 7200
        }); 
        console.log(inputURL); 

        const outputURL = await s3.getSignedUrlPromise("getObject", {
            Bucket: bucketName, 
            Key: "All My Ladies.json", 
            Expires: 7200, 
        }); 
        console.log(outputURL); 

        const response = await fetch("https://api.dolby.com/media/analyze/music", {
            method: "POST", 
            body: JSON.stringify({
                input: {
                    url: "https://vibemesh.s3.us-east-1.amazonaws.com/All+My+Ladies+-+Bauer.mp3", 
                    auth: {
                        key: process.env.AWS_S3_KEY, 
                        secret: process.env.AWS_S3_SECRET, 
                    }
                }, 
                output: {
                    url: "https://vibemesh.s3.us-east-1.amazonaws.com/All+My+Ladies.json", 
                    auth: {
                        key: process.env.AWS_S3_KEY, 
                        secret: process.env.AWS_S3_SECRET, 
                    }
                }
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

const getTrackAnalysis = async(accessToken) => {
    try {
        const jobID = await getTrackJobID(accessToken); 
        console.log("JOB_ID", jobID);
        
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
        
        return json; 
    } catch (error) {
        console.log(error); 
    }
}; 

router.get("/", async(req, res) => {
    const { trackName, trackPath } = await retrieveTrackandPath(); 
    const accessToken = await getAccessToken(); 

    uploadTrackToCloud(accessToken, trackName, trackPath); 

}); 

module.exports = router; 