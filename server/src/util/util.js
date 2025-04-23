const fs   = require("fs").promises; 
const path = require("path"); 
const mm   = (async() => { return await import("music-metadata") })(); 

/**
 * Retrieves the file path of a track from the "uploads" directory.
 *
 * @async
 * @function
 * @param {string} trackName - The name of the track to retrieve.
 * @returns {Promise<string|undefined>} A promise that resolves to the track's file path if found, or `undefined` if the track does not exist.
 *
 * @throws {Error} If there's an issue reading the directory.
 *
 * Example:
 * ```js
 * const trackPath = await retrieveTrackPath("trackname");
 * if (trackPath) {
 *   console.log("Track found at:", trackPath);
 * } else {
 *   console.log("Track not found.");
 * }
 * ```
 */
const retrieveTrackPath = async(
    trackName
) => {
    try {   
        console.log("In retrieveTrackPath()"); 
        const tracks = await fs.readdir(path.resolve(__dirname, "..", "uploads"));
        if (tracks.includes(`${trackName}.mp3`)) {
            const trackPath = path.resolve(__dirname, "..", "uploads", `${trackName}.mp3`);
            return new Promise(resolve => resolve(trackPath));
        } 
    } catch (error) { 
        console.log(error); 
    }
}; 

/**
 * Normalizes a filename by removing spaces.
 *
 * @function
 * @param {string} filename - The filename to normalize.
 * @returns {string} The normalized filename without spaces.
 *
 * Example:
 * ```js
 * const normalized = normalizeFilename("track name.mp3");
 * console.log(normalized); // "trackname.mp3"
 * ```
 */
const normalizeFilename = (
    filename 
) => { 
    return filename.split(" ").join(""); 
}; 

/**
 * Renames an uploaded file by removing spaces from the filename and moves it to the desired directory.
 *
 * @async
 * @function
 * @param {Object} file - The file object representing the uploaded file.
 * @param {string} file.originalname - The original name of the uploaded file.
 * @param {string} file.path - The current path of the uploaded file.
 * @param {string} file.destination - The destination directory to move the renamed file.
 * @returns {Promise<string>} A promise that resolves to the renamed filename (without the file extension).
 *
 * @throws {Error} If the file rename operation fails.
 *
 * Example:
 * ```js
 * const renamedFile = await renameUploadedFile(file);
 * console.log("Renamed file:", renamedFile);
 * ```
 */
const renameUploadedFile = async(
    file 
) => {
    const filename = normalizeFilename(file.originalname); 
    await fs.rename(file.path, `${file.destination}/${filename}`, (error) => {
        if (error) {
            throw new Error(error); 
        }
    }); 
    return new Promise(resolve => resolve(filename.substring(0, filename.length - 4))); 
}; 

/**
 * Retrieves metadata (artist, album, and year) of a track from the "uploads" directory.
 *
 * @async
 * @function
 * @param {string} trackname - The name of the track to retrieve metadata for.
 * @returns {Promise<Object>} A promise that resolves to an object containing the track's metadata:
 * - `artist`: The artist of the track.
 * - `album`: The album the track is from.
 * - `year`: The year the track was released.
 *
 * @throws {Error} If there is an issue retrieving or parsing the metadata.
 *
 * Example:
 * ```js
 * const metadata = await getTrackMetadata("trackname");
 * console.log(metadata); // { artist: "Artist", album: "Album", year: 2020 }
 * ```
 */
const getTrackMetadata = async(
    trackname 
) => {
    console.log("In getTrackMetadata()"); 
    const trackpath = await retrieveTrackPath(trackname); 
    const metadata  = await (await mm).parseFile(trackpath);
    const trackMetadata = {
        artist: metadata["common"]["artist"], 
        album: metadata["common"]["album"],
        year: metadata["common"]["year"], 
    }; 

    return new Promise(resolve => resolve(trackMetadata)); 
}; 

/**
 * Retrieves the cover image of a track from the "uploads" directory and encodes it in base64 format.
 *
 * @async
 * @function
 * @param {string} trackname - The name of the track to retrieve the cover image for.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 * - `format`: The format of the cover image (e.g., "jpeg").
 * - `data`: The base64-encoded image data.
 *
 * @throws {Error} If there is an issue retrieving or parsing the cover image.
 *
 * Example:
 * ```js
 * const coverImage = await getTrackCoverImage("trackname");
 * console.log(coverImage); // { format: "jpeg", data: "base64encodedstring" }
 * ```
 */
const getTrackCoverImage = async(
    trackname 
) => {
    console.log("In getTrackCoverImage()");
    const trackpath = await retrieveTrackPath(trackname); 
    const metadata  = await (await mm).parseFile(trackpath); 
    const image     = (await mm).selectCover(metadata["common"]["picture"]); 
    
    const trackCoverImageMetadata = {
        format: image["format"], 
        data: Buffer.from(image["data"]).toString("base64")
    };

    return new Promise(resolve => resolve(trackCoverImageMetadata)); 
}


module.exports = {
    retrieveTrackPath, 
    normalizeFilename, 
    renameUploadedFile, 
    getTrackMetadata, 
    getTrackCoverImage 
}