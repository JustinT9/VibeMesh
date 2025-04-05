import { useEffect, useState } from "react";
import { 
    Instrumental,
    Genre, 
    Key, 
    Track
} from '../types/trackAnalysis';
import "./TrackAnalysis.css"; 

function TrackAnalysis() {
    const [track, setTrack] = useState<Track | null>(null); 

    const getTrackAnalysis = async(
        trackname: String
    ): Promise<void> => {
        try {
            console.log(trackname); 
            const response: Response = await fetch(`http://localhost:5000/api/track-analyze/${trackname}`, {
                method: "GET", 
                headers: {
                    "Accept": "application/json",
                }
            }); 

            if (!response.ok) { 
                throw new Error(`status ${response.status}`); 
            }

            const json: Promise<any> = await response.json(); 
            return new Promise((resolve): void => resolve(json)); 
        } catch (error: Error | any) {
            console.log(error); 
        }  
    }

    const loadAnalysis = async() => {

    } 

    useEffect(() => {
        loadAnalysis(); 
    }, []); 

    return (
        <>
        </>
    )
}

export default TrackAnalysis; 