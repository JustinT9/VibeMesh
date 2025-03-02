import React, { useEffect, useState } from 'react'; 

function HomePage() {
    const uploadTrack = async(trackFile: FormData) => {
        const fileItr: FormDataIterator<FormDataEntryValue> = trackFile.values(); 
        const trackFileData: FormDataEntryValue | null = fileItr.next().value ?? null;  
        
        console.log(trackFileData);

        try {
            const response = await fetch("http://localhost:5000/api/track-process/", {
                method: "POST",
                body: JSON.stringify({
                    content: 'hello'
                })
            }); 

        } catch (error) {
            console.log(error); 
        }

    }; 

    return (
        <>
            <form action={uploadTrack}>
                <input 
                    type="file"
                    id="trackFile"
                    name="trackFile"
                    accept="audio/.mp3"
                />
                <button type="submit">Submit</button>
            </form>
        </>
    )
}

export default HomePage;