const fs = require("fs").promises; 

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

module.exports = {
    normalizeFilename, 
    renameUploadedFile
}