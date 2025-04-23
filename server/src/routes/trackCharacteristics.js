const express = require("express"); 
const router  = express.Router(); 

const { getTrackCoverImage } = require("../util/util"); 

/**
 * GET /cover-image/:trackname
 * Retrieves cover image metadata (e.g., URL or base64) for a given track.
 *
 * @route GET /cover-image/:trackname
 * @param {string} req.params.trackname - Name of the track.
 * @returns {Object} JSON metadata of the track's cover image.
 *
 * Example response:
 * {
 *   "track": "cool_song",
 *   "coverImageUrl": "https://s3.amazonaws.com/bucket/cover/cool_song.jpg"
 * }
 */
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