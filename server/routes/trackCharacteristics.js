const express = require("express"); 
const router  = express.Router(); 

const { getTrackCoverImage } = require("../utilities/util"); 

router.get("/cover-image/:trackname", async(req, res) => {
    try {
        const trackname          = req.params.trackname; 
        const coverImageMetadata = await getTrackCoverImage(trackname); 

        res.status(200).json(coverImageMetadata); 
    } catch (error) {
        console.log(error); 
        res.status(500).json(error); 
    }
}); 

module.exports = router; 