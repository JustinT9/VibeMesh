import { 
    useNavigate, 
    NavigateFunction
} from 'react-router-dom';
import DragAndDrop from "../components/DragAndDrop/DragAndDrop"; 
import { Track } from '../common/interfaces';
import "./HomePage.css"; 

function HomePage() {
    const navigate: NavigateFunction = useNavigate(); 
  
    const setCurrentTrack = async(
        trackname: string
    ): Promise<Number> => {
        console.log("In setCurrentTrack()"); 
        localStorage.setItem("current-track", trackname); 
    
        const isSuccess = localStorage.getItem("current-track") === trackname;
        if (isSuccess) console.log(`Current track: ${trackname}`); 
    
        return new Promise(resolve => resolve(0)); 
    }

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