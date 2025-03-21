const aws = require("aws-sdk"); 

require("dotenv").config(); 
aws.config.update({
    region: "us-east-1", 
    credentials: {
        accessKeyId: process.env.AWS_S3_KEY, 
        secretAccessKey: process.env.AWS_S3_SECRET 
    }
});

aws.config.getCredentials(error => {
    try {
        if (error) throw new Error(error); 
        console.log(aws.config.credentials.accessKeyId); 
        console.log(aws.config.region); 
    } catch (err) {
        console.log(err); 
    } 
})

const s3 = new aws.S3(); 

const doesTrackAnalysisExistinS3Bucket = async(
    trackName 
) => {
    const exists = await s3.headObject({
        Bucket: "vibemesh", 
        Key: `${trackName}Analysis.json`
    }).promise()
      .then(
        () => true, 
        error => {    
            console.log(error); 
            if (error.code === "NotFound") {
                return false; 
            }
            throw error; 
        }
    )
    return exists; 
}; 

const uploadTrackAnalysisToS3Bucket = async(
    trackName, 
    trackAnalysisJSON 
) => {
    try { 
        await s3.upload({
            Bucket: "vibemesh",
            Key: `${trackName}Analysis.json`, 
            Body: trackAnalysisJSON
        }, (error, data) => {
            if (error) throw new Error(error); 
            else console.log(`successfully uploaded: ${data}`); 
        }).promise(); 
    } catch (error) {
        console.log(error); 
    }
}; 

const getTrackAnalysisFromS3Bucket = async(
    trackName 
) => {
    try {
        const trackAnalysisData = await s3.getObject({
            Bucket: "vibemesh", 
            Key: `${trackName}Analysis.json`
        }).promise(); 

        return trackAnalysisData; 
    } catch (error) {
        console.log(error); 
    }
}

module.exports = { 
    doesTrackAnalysisExistinS3Bucket, 
    uploadTrackAnalysisToS3Bucket, 
    getTrackAnalysisFromS3Bucket
}