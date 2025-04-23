const fs = require("fs"); 

/**
 * Retrieves media usage data from the Dolby API for a specified date range.
 *
 * @async
 * @function
 * @param {string} accessToken - The authorization token required for making API requests.
 * @returns {Promise<string>} The formatted media usage data as a string.
 * 
 * @throws {Error} If the request to the Dolby API fails or if the response is not OK.
 * 
 * Example Response:
 * ```json
 * {
 *   "usage": {
 *     "total": 12345,
 *     "usage_details": [ ... ]
 *   }
 * }
 * ```
 */
const retrieveMediaUsage = async(accessToken) => {
    try {
        const response = await fetch("https://api.dolby.com/media/usage", {
            method: "GET", 
            headers: {
                "Authorization": `Bearer ${accessToken}`, 
                "Accept": "application/json"
            }, 
            params: {
                from: "2025-02-01", 
                to: "2025-04-01"
            }
        }); 
    
        if (!response.ok) {
            throw new Error(`Status: ${response.status}`); 
        }

        const json = await response.json(); 
    
        return JSON.stringify(json, null, 4); 
    } catch (error) {
        console.log(error); 
    }
}; 

/**
 * Retrieves a list of jobs within a specified date range from the Dolby API and writes the logs to a file.
 *
 * @async
 * @function
 * @param {string} accessToken - The authorization token required for making API requests.
 * @param {string} startDate - The start date for retrieving jobs (format: "YYYY-MM-DD").
 * @param {string} endDate - The end date for retrieving jobs (format: "YYYY-MM-DD").
 * @returns {Promise<void>} This function does not return any data but writes the logs to a file.
 *
 * @throws {Error} If the request to the Dolby API fails or if the response is not OK.
 *
 * Example:
 * The function will create a file at `./logs/jobs.txt` containing the job details in JSON format:
 * ```json
 * {
 *   "jobs": [ ... ]
 * }
 * ```
 */
const retrieveJobs = async(
    accessToken, 
    startDate, 
    endDate
) => {
    try {
        const endpoint = `https://api.dolby.com/media/jobs?submitted_after=${startDate}&submitted_before=${endDate}`;
        const response = await fetch(endpoint, {
            method: "GET", 
            headers: {
                "Authorization": `Bearer ${accessToken}`, 
                "Accept": "application/json"
            }
        });
    
        const json   = await response.json();
        const output = JSON.stringify(json, null, 4); 
        const path   = "./logs/jobs.txt"; 

        fs.writeFileSync(path, output); 
        console.log(`Job logs written to ${path} starting from ${startDate} till ${endDate}`); 

    } catch (error) {
        console.log(error); 
    }
};

module.exports = {
    retrieveMediaUsage: retrieveMediaUsage, 
    retrieveJobs: retrieveJobs
}; 