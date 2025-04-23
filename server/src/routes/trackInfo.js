const express = require("express"); 
const router  = express.Router(); 

const { retrieveTrackPath } = require("../util/util"); 

/**
 * GET /track-path/:trackname
 * Retrieves the file path for a given track.
 *
 * @route GET /track-path/:trackname
 * @param {string} req.params.trackname - Name of the track.
 * @returns {Object} JSON object containing the track file path.
 *
 * Example response:
 * {
 *   "trackPath": "/path/to/music/cool_song.mp3"
 * }
 */
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