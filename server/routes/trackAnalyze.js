const express = require("express");
const aws     = require("aws-sdk");   

const router = express.Router(); 
const s3     = new aws.S3({ signatureVersion: "v4", region: "us-east-1" }); 

const bucketName = "vibemesh"; 

require("dotenv").config();

const getAccessToken = async() => {
    const auth = Buffer.from(`${process.env.TRACK_ANALYZE_KEY}:${process.env.TRACK_ANALYZE_SECRET}`).toString("base64"); 
    const response = await fetch("https://api.dolby.io/v1/auth/token", {
        method: "POST", 
        body: new URLSearchParams({
            grant_type: "client_credentials", 
            expires_in: 86400 
        }), 
        headers: {
            "Accept": "application/json", 
            "Content-Type": "application/x-www-form-urlencoded", 
            "Authorization": `Basic ${auth}`
        }
    }); 

    const json = await response.json(); 
    const accessToken = json.access_token; 

    return accessToken; 
}; 

const analyzeTrack = async() => {
    const accessToken = await getAccessToken(); 
    // console.log(accessToken);

    const inputURL = await s3.getSignedUrlPromise("getObject", {
        Bucket: bucketName, 
        Key: "All My Ladies - Bauer.mp3", 
        Expires: 3600
    }); 

    const outputURL = await s3.getSignedUrlPromise("putObject", {
        Bucket: bucketName, 
        Key: "All My Ladies - Bauer Analyzed.mp3", 
        Expires: 7200
    }); 



    const response = await fetch("https://api.dolby.com/media/analyze/music", {
        method: "POST", 
        body: new URLSearchParams({
            input: {
                url: inputURL, 
                auth: {
                    key: process.env.TRACK_ANALYZE_KEY, 
                    secret: process.env.TRACK_ANALYZE_SECRET, 
                    token: accessToken,
                }
            }, 
            output: {
                url: outputURL, 
                auth: {
                    key: process.env.TRACK_ANALYZE_KEY, 
                    secret: process.env.TRACK_ANALYZE_SECRET, 
                    token: accessToken,
                }
            }
        }), 
        headers: {
            "Accept": "application/json", 
            "Content-Type": "application/json"
        }
    }); 

    const json = await response.json(); 
    console.log(json); 

}; 

router.get("/", async(req, res) => {    
    analyzeTrack(); 
    console.log("HERE");
    return res.status(200).json({ token: "HERE" } );
}); 

module.exports = router; 