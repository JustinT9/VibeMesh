import {
    useRef, 
    useCallback,
    BaseSyntheticEvent 
} from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import "./DragAndDrop.css"; 

/**
 * Props for the DragAndDrop component.
 * @property {Function} uploadTrack - A function to handle uploading a track file. 
 * Expects a FormData object containing an audio file and returns a Promise.
 */
interface DragAndDropProps {    
    uploadTrack: (trackFile: FormData) => Promise<void>; 
}; 

/**
 * A React component for uploading MP3 files via drag-and-drop or file browser.
 * Includes visual cues for drag-over state and validates file type before upload.
 *
 * @component
 * @param {DragAndDropProps} props - Props containing the uploadTrack handler.
 * @returns {JSX.Element} The rendered drag-and-drop upload UI.
 */
function DragAndDrop({ uploadTrack }: DragAndDropProps) {
    const formRef: React.RefObject<HTMLFormElement | null> = useRef(null); 
    const mp3FileInputRef: React.RefObject<HTMLInputElement | null> = useRef(null); 

    /**
     * Handles "Browse Files" button click by programmatically opening the file picker.
     */
    const handleClick: () => void | undefined = useCallback(() => mp3FileInputRef.current?.click(), []);
    
     /**
     * Submits the form when a file is selected via the file input.
     * @param {BaseSyntheticEvent} e - The change event triggered on file input.
     */
    const handleChange: (e: BaseSyntheticEvent) => void | undefined = (e: BaseSyntheticEvent) => {
        e.preventDefault(); 
        formRef.current?.requestSubmit(); 
    }; 

    /**
     * Handles the file drop event, validating the file type and triggering the upload.
     * @param {React.DragEvent<HTMLDivElement>} e - The drop event.
     */
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
    
    /**
     * Prevents default behavior when dragging files over the drop zone
     * and provides visual feedback via `dropEffect`.
     * @param {React.DragEvent<HTMLDivElement>} e - The drag over event.
     */
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
    );
}

export default DragAndDrop; 