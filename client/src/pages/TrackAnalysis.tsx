import { useEffect, useState } from "react";
import { Track } from '../types/Track';
import "./TrackAnalysis.css"; 

function TrackAnalysis() {
    const [track, setTrack] = useState<Track>(); 

    const getTrackAnalysis = async(): Promise<any> => {
        try {
            const trackname: string = localStorage.getItem("current-track") ?? ""; 
            const response: Response = await fetch(`http://localhost:5000/api/track-analyze/${trackname}`, {
                method: "GET", 
                headers: {
                    "Accept": "application/json",
                }
            }); 

            if (!response.ok) { 
                throw new Error(`status ${response.status}`); 
            }

            const json: Track = await response.json(); 
            setTrack(prevTrack => ({...prevTrack, ...json})); 

            console.log(track); 
            return new Promise(resolve => resolve(0)); 
        } catch (error: Error | any) {
            console.log(error); 
        }  
    }

    const loadAnalysis = async() => {
        await getTrackAnalysis(); 
        console.log(track); 
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