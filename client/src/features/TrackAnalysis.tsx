import { useEffect, useState } from "react";
import {
    Instrumentals, 
    GenrePieChartData, 
    Loudness
} from '../common/types'; 
import { 
    Track, 
    TrackCoverImage 
} from '../common/interfaces';
import {
    shapeKeyData,
    shapeGenreData, 
    shapeGenrePieChartData, 
    shapeInstrumentalData
} from "../utils/TrackAnalysisDataShaper"; 
import { 
    PieChart, 
    BarChart, 
    Gauge
} from '@mui/x-charts'; 
import "./TrackAnalysis.css"; 

function TrackAnalysis() {
    const [track, setTrack] = useState<Track>(); 
    const [trackCoverImage, setTrackCoverImage] = useState<string>(); 
    const [genrePieChartData, setGenrePieChartData] = useState<GenrePieChartData>(); 
    const [instrumentalBarChartData, setInstrumentalBarChartData] = useState<Instrumentals>();
    const [loudnessGaugeData, setLoudnessGaugeData] = useState<Loudness>(0); 

    const getTrackAnalysis = async(): Promise<void> => {
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

            const json: any = await response.json(); 
            const track: Track = {
                name: json.name, 
                artist: json.artist, 
                album: json.album,
                year: json.year, 
                bpm: json.bpm, 
                duration: json.duration, 
                loudness: json.loudness, 
                keys: shapeKeyData(json.keys), 
                genres: shapeGenreData(json.genres), 
                instrumentals: (() => {
                    const data = shapeInstrumentalData(json.instrumentals); 
                    setInstrumentalBarChartData(data); 
                    return data; 
                })()
            }

            setTrack(track);
        } catch (error: Error | any) {
            console.log(error); 
        }  
    }

    const getTrackCoverImage = async(): Promise<void> => {
        try {
            const trackname: string = localStorage.getItem("current-track") ?? ""; 
            const response: Response = await fetch(`http://localhost:5000/api/track-characteristics/cover-image/${trackname}`, {
                method: "GET", 
                headers: {
                    "Accept": "application/json", 
                }
            }); 

            if (!response.ok) {
                throw new Error(`status: ${response.status}`); 
            }

            const trackCoverImageMetadata: TrackCoverImage = await response.json(); 
            const image: string | undefined = `data:${trackCoverImageMetadata.format};base64,${trackCoverImageMetadata.data}`;
            
            setTrackCoverImage(image); 
        } catch (error: Error | any) {
            console.log(error); 
        }
    }   

    useEffect(() => {
        getTrackAnalysis(); 
        getTrackCoverImage(); 
    }, []); 

    useEffect(() => {
        if (track) {
            setGenrePieChartData(shapeGenrePieChartData(track));
            setLoudnessGaugeData(track.loudness); 
            console.log(track); 
        }   
    }, [track]); 

    return (
        <div className="trackAnalysisContainer">
            <div className="trackAnalysisPage">
                <div className="trackInfo">
                    <img 
                        className="trackCoverImage"
                        src={trackCoverImage} 
                    /> 
                    <text>{track?.name}</text>
                    <text>{track?.artist}</text>
                    <text>{track?.album}</text> 
                    <text>{track?.year}</text>
                </div>

                <div className="trackCharacteristics">
                    <div className="trackGenreAndInstrumentals">
                    <PieChart
                        height={150}
                        width={350}
                        series={[{ data: genrePieChartData ? [...genrePieChartData] : [] }]}
                    /> 
                    
                    <BarChart
                        height={200}
                        width={325}
                        xAxis={[{ 
                            scaleType: 'band', 
                            data: instrumentalBarChartData ? instrumentalBarChartData.map(i => i.type) : [] 
                        }]}
                        series={[{ 
                            data: instrumentalBarChartData ? instrumentalBarChartData.map(i => i.confidence) : [] 
                        }]}
                    />
                    </div>

                    <div className="trackKeysAndLoudness">
                        <Gauge 
                            height={175}
                            width={175}
                            value={loudnessGaugeData}
                            text={`Loudness: ${loudnessGaugeData}`}
                            valueMin={-35}
                            valueMax={0}
                            startAngle={-90} 
                            endAngle={90}
                        />
                    </div>

                    <div className="trackPreview">

                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrackAnalysis; 
