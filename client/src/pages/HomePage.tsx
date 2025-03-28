import React, { BaseSyntheticEvent, useCallback, useRef } from 'react'; 
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { IoCloudUploadOutline } from "react-icons/io5";
import "./HomePage.css"; 


function HomePage() {
    const navigate: NavigateFunction = useNavigate(); 

    const formRef: React.RefObject<HTMLFormElement | null> = useRef(null); 
    const mp3FileInputRef: React.RefObject<HTMLInputElement | null> = useRef(null); 
    const handleClick: () => void | undefined = useCallback(() => mp3FileInputRef.current?.click(), []);
    const handleChange: (e: BaseSyntheticEvent) => void | undefined = (e: BaseSyntheticEvent) => {
        e.preventDefault(); 
        formRef.current?.requestSubmit(); 
    }; 

    const uploadTrack = async(trackFile: FormData): Promise<void> => {
        try {
            const trackFileInfo: FormDataEntryValue | undefined = trackFile.values().next().value; 
            console.log(`Uploading track file: ${trackFileInfo}`); 

            const response: Response = await fetch("http://localhost:5000/api/track-process/", {
                method: "POST",
                body: trackFile
            }); 

            if (!response.ok) {
                throw new Error(`status: ${response.status}`); 
            } 
        
            navigate("/trackanalysis"); 
        } catch (error: Error | any) {
            console.log(error); 
        }
    }; 

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

    return (
        <>  
            <div className="dragAndDropZone"
                onDrop={(e) => handleDrop(e)}
                onDragOver={(e) => handleDragover(e)}>
                <IoCloudUploadOutline 
                    size="2em"
                    style={{ color: "#87CEEB" }}
                />
                Drag & Drop MP3 File 
                <br/>
                <p>or</p>
                <button onClick={handleClick}>Browse Files</button>
                <form 
                    ref={formRef}
                    action={uploadTrack}>
                    <input 
                        type="file"
                        id="trackFile"
                        name="trackFile"
                        accept="audio/.mp3"
                        style={{ display: "none" }}
                        ref={mp3FileInputRef}
                        onChange={handleChange}
                    />
                </form>
            </div>
        </>
    )
}

export default HomePage;