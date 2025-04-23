import { 
    useNavigate, 
    NavigateFunction
} from 'react-router-dom';
import DragAndDrop from "../components/DragAndDrop/DragAndDrop"; 
import { Track } from '../common/interfaces';
import "./HomePage.css"; 

/**
 * The main landing component for the app.
 * Hosts the drag-and-drop upload interface and manages track state and navigation.
 *
 * @component
 * @returns {JSX.Element} The rendered HomePage.
 */
function HomePage() {
    const navigate: NavigateFunction = useNavigate(); 
  
    /**
     * Sets the current track name in localStorage.
     *
     * @async
     * @param {string} trackname - The name of the track to set as current.
     * @returns {Promise<number>} Always resolves to 0 for now.
     */
    const setCurrentTrack = async(
        trackname: string
    ): Promise<Number> => {
        console.log("In setCurrentTrack()"); 
        localStorage.setItem("current-track", trackname); 
    
        const isSuccess = localStorage.getItem("current-track") === trackname;
        if (isSuccess) console.log(`Current track: ${trackname}`); 
    
        return new Promise(resolve => resolve(0)); 
    }

     /**
     * Uploads the provided track file to the backend API.
     * On success, updates the current track and navigates to the analysis page.
     *
     * @async
     * @param {FormData} trackFile - The FormData object containing the uploaded track.
     */
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
            
            const track: Track = await response.json(); 
            await setCurrentTrack(track.name);

            navigate("/trackanalysis"); 
        } catch (error: Error | any) {
            console.log(error); 
        }
    }; 

    return (
        <>  
            <DragAndDrop uploadTrack={uploadTrack} />
        </>
    )
}

export default HomePage;