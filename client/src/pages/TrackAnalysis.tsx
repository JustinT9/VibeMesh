import React from 'react'; 
import "./TrackAnalysis.css"; 

function TrackAnalysis() {
    const getTrack = async(
        trackname: String
    ): Promise<void> => {
        try {
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
            
        } catch (error: Error | any) {
            console.log(error); 
        }  
    }

    return (
        <>
        </>
    )
}

export default TrackAnalysis; 