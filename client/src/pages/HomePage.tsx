import React, { useEffect, useState } from 'react'; 
import "./HomePage.css"; 

function HomePage() {
    const uploadTrack = async(trackFile: FormData): Promise<void> => {
        try {
            const trackFileInfo: FormDataEntryValue | undefined = trackFile.values().next().value; 
            console.log(`Uploading track file: ${trackFileInfo}`); 

            const response: Response = await fetch("http://localhost:5000/api/track-process/", {
                method: "POST",
                body: trackFile
            }); 

            console.log(response); 

        } catch (error) {
            console.log(error); 
        }
    }; 

    // const analyzeTrack = async() => {
    //     try {
    //         const response = await fetch("http://localhost:5000/api/track-analyze/", {
    //             method: "GET"
    //         }); 

    //     } catch (error) {
    //         console.log(error); 
    //     }
    // }; 

    // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
    const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault(); 
        
        const dt: DataTransfer = e.dataTransfer; 
        if (!dt) { 
            console.log("DataTransfer object is null"); 
            return; 
        }  

        const file: File = dt.files[0];
        const type: String = file.type; 
        if (type !== "audio/mpeg") {
            console.error(`File Type must be audio/mpeg instead of ${type}`); 
            return;
        } 

        console.log("Track File Dropped"); 
        const trackFileForm: FormData = new FormData();

        trackFileForm.append("trackFile", file); 
        uploadTrack(trackFileForm); 
    }; 

    const handleDragover = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault(); 

        const dt: DataTransfer = e.dataTransfer; 
        if (!dt) { 
            console.log("DataTransfer object is null"); 
            return; 
        }  

        console.log("Track File in Drop Zone"); 
        if (dt) {
            e.dataTransfer.dropEffect = "copy"; 
        }
    }; 

    // analyzeTrack(); 
    return (
        <>  
            <div className="dragAndDropZone"
                onDrop={(e) => handleDrop(e)}
                onDragOver={(e) => handleDragover(e)}>
                Drag & Drop MP3 File 
                <br/>
                <h4>OR</h4>
                <form action={uploadTrack}>
                    <input 
                        type="file"
                        id="trackFile"
                        name="trackFile"
                        accept="audio/.mp3"
                    />
                    <button type="submit">Submit</button>
                </form>
            </div>
            
        </>
    )
}

export default HomePage;