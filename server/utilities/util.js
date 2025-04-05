const fs   = require("fs").promises; 
const path = require("path"); 
const mm   = (async() => { return await import("music-metadata") })(); 

const retrieveTrackPath = async(
    trackName
) => {
    try {   
        console.log("In retrieveTrackPath()"); 
        const tracks = await fs.readdir("./uploads");
        if (tracks.includes(`${trackName}.mp3`)) {
            const trackPath = path.resolve(__dirname, "..", "uploads", `${trackName}.mp3`);
            return new Promise(resolve => resolve(trackPath));
        } 
    } catch (error) { 
        console.log(error); 
    }
}; 

const normalizeFilename = (
    filename 
) => { 
    return filename.split(" ").join(""); 
}; 

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

module.exports = {
    retrieveTrackPath, 
    normalizeFilename, 
    renameUploadedFile, 
    getTrackMetadata
}