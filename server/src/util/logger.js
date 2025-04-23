const fs = require("fs"); 

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