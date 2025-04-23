const express = require("express"); 
const router  = express.Router(); 

const { retrieveTrackPath } = require("../util/util"); 

router.get("/track-path/:trackname", async(req, res) => {
    try {
        const trackname = req.params.trackname; 
        const trackpath = await retrieveTrackPath(trackname); 
        res.status(200).json(trackpath); 
    } catch (error) {
        console.log(error); 
        res.status(500).json(error); 
    }
}); 

module.exports = router; 