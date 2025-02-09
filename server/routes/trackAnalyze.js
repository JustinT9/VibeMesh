const express = require("express");
const aws     = require("aws-sdk"); 
const router  = express.Router(); 

require("dotenv").config();

aws.config.update({
    region: "us-east-1", 
    accessKeyId: process.env.AWS_S3_KEY, 
    secretAccessKey: process.env.AWS_S3_SECRET
}); 

const s3 = new AWS.S3(); 
const bucketName = "vibemesh"; 

const getAccessToken = async() => {
    const auth = Buffer.from(`${process.env.TRACK_ANALYZE_KEY}:${process.env.TRACK_ANALYZE_SECRET}`).toString("base64"); 
    try {
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
    } catch(error) {
        console.log(error); 
    }
}; 

const getTrackJobID = async(accessToken) => {
    try {
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
                    url: "https://vibemesh.s3.us-east-1.amazonaws.com/All+My+Ladies+-+Bauer.json", 
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
    const accessToken = await getAccessToken(); 
    const trackAnalysis = await getTrackAnalysis(accessToken);
    console.log(trackAnalysis); 
    
    // return res.status(200).json({ token: accessToken } );
}); 

module.exports = router; 