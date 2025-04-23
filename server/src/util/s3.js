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

/**
 * Checks if a track analysis file exists in the S3 bucket.
 *
 * @async
 * @function
 * @param {string} trackName - The name of the track to check for an existing analysis file.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the analysis file exists, `false` if not.
 *
 * @throws {Error} If there is an issue querying the S3 bucket.
 *
 * Example Response:
 * ```js
 * const exists = await doesTrackAnalysisExistinS3Bucket("trackname"); 
 * if (exists) { 
 *     console.log("Track analysis exists!"); 
 * } else { 
 *     console.log("Track analysis not found!"); 
 * }
 * ```
 */
const doesTrackAnalysisExistinS3Bucket = async(
    trackName 
) => {
    try {
        console.log("In doesTrackAnalysisExistinS3Bucket()"); 
        const exists = await s3.headObject({
            Bucket: "vibemesh", 
            Key: `${trackName}Analysis.json`
        }).promise()
        .then(
            () => true, 
            error => {    
                // console.log(error); 
                if (error.code === "NotFound") {
                    return false; 
                }
                throw error; 
            }
        )
        return new Promise(resolve => resolve(exists)); 
    } catch (error) {
        console.log(error); 
    } 
}; 

/**
 * Uploads the track analysis JSON to an S3 bucket.
 *
 * @async
 * @function
 * @param {string} trackName - The name of the track to upload the analysis for.
 * @param {string} trackAnalysisJSON - The track analysis data in JSON format to upload.
 * @returns {Promise<void>} This function does not return any data but uploads the JSON to S3.
 *
 * @throws {Error} If the upload to S3 fails.
 *
 * Example:
 * ```js
 * const trackAnalysisJSON = JSON.stringify({
 *   name: "trackname", 
 *   duration: 3.5,
 *   loudness: -5
 * });
 * await uploadTrackAnalysisToS3Bucket("trackname", trackAnalysisJSON);
 * ```
 */
const uploadTrackAnalysisToS3Bucket = async(
    trackName, 
    trackAnalysisJSON 
) => {
    try {
        console.log("In uploadTrackAnalysisToS3Bucket()"); 
        console.log(trackAnalysisJSON); 

        await s3.upload({
            Bucket: "vibemesh",
            Key: `${trackName}Analysis.json`, 
            Body: trackAnalysisJSON
        }, (error, data) => {
            console.log(error, data); 
            if (error) throw new Error(error); 
            else console.log(`successfully uploaded: ${data}`); 
        }).promise(); 

        return new Promise(resolve => resolve(0)); 
    } catch (error) {
        console.log(error); 
    }
}; 

/**
 * Retrieves the track analysis JSON from the S3 bucket.
 *
 * @async
 * @function
 * @param {string} trackName - The name of the track for which to retrieve the analysis.
 * @returns {Promise<Object>} A promise that resolves to the track analysis data as a JavaScript object.
 *
 * @throws {Error} If the retrieval from S3 fails.
 *
 * Example:
 * ```js
 * const trackAnalysisData = await getTrackAnalysisFromS3Bucket("trackname");
 * console.log(trackAnalysisData);
 * ```
 */
const getTrackAnalysisFromS3Bucket = async(
    trackName 
) => {
    try {
        console.log("In getTrackAnalysisFromS3Bucket()"); 
        const trackAnalysisData = await s3.getObject({
            Bucket: "vibemesh", 
            Key: `${trackName}Analysis.json`
        }).promise(); 
        return new Promise(resolve => resolve(trackAnalysisData)); 
    } catch (error) {
        console.log(error); 
    }
}

module.exports = { 
    doesTrackAnalysisExistinS3Bucket, 
    uploadTrackAnalysisToS3Bucket, 
    getTrackAnalysisFromS3Bucket
}