const retrieveMediaUsage = async(accessToken) => {
    const response = await fetch("https://api.dolby.com/media/usage", {
        method: "GET", 
        headers: {
            "Authorization": `Bearer ${accessToken}`, 
            "Accept": "application/json"
        }, 
        params: {
            from: "2025-02-01", 
            to: "2025-03-01"
        }
    }); 

    const json = await response.json(); 

    return JSON.stringify(json); 
}; 

const retrieveJobs = async(accessToken) => {
    const response = await fetch("https://api.dolby.com/media/jobs", {
        method: "GET", 
        headers: {
            "Authorization": `Bearer ${accessToken}`, 
            "Accept": "application/json"
        }
    });

    const json = await response.json(); 

    return JSON.stringify(json);
};

module.exports = {
    retrieveMediaUsage: retrieveMediaUsage, 
    retrieveJobs: retrieveJobs
}; 