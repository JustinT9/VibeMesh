import { 
    useState, 
    useEffect
} from "react";
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
    Gauge,
    gaugeClasses
} from '@mui/x-charts'; 
import "./TrackAnalysis.css"; 
import image from "./waveform.png"

/**
 * Component to display full analysis for the currently selected track.
 * Includes genre distribution, instrumental makeup, loudness, keys, and metadata.
 *
 * @component
 * @returns {JSX.element} Track analysis UI
 */
function TrackAnalysis() {
    const [track, setTrack] = useState<Track>(); 
    const [trackPath, setTrackPath] = useState<string>(); 
    const [trackCoverImage, setTrackCoverImage] = useState<string>(); 
    const [genrePieChartData, setGenrePieChartData] = useState<GenrePieChartData>(); 
    const [instrumentalBarChartData, setInstrumentalBarChartData] = useState<Instrumentals>();
    const [loudnessGaugeData, setLoudnessGaugeData] = useState<Loudness>(0); 

     /**
     * Fetches track analysis data from the backend and populates state with shaped values.
     *
     * @async
     */
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

    /**
     * Fetches base64 cover image from the backend and sets image src.
     *
     * @async
     */
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

    /**
     * Fetches MP3 file path (likely for waveform/audio playback).
     *
     * @async
     */
    const getTrackMP3FilePath = async(): Promise<void> => {
        try {
            const trackname: string = localStorage.getItem("current-track") ?? ""; 
            const response: Response = await fetch(`http://localhost:5000/api/track-info/track-path/${trackname}`, {
                method: "GET", 
                headers: {
                    "Accept": "application/json"
                }
            }); 

            if (!response.ok) {
                throw new Error(`status: ${response.status}`);
            }

            const trackpath: string = await response.json(); 
            setTrackPath(trackpath); 
        } catch (error: Error | any) {
            console.log(error); 
        }
    }

    useEffect(() => {
        getTrackAnalysis(); 
        getTrackCoverImage(); 
        getTrackMP3FilePath(); 
    }, []); 

    useEffect(() => {
        if (track) {
            setGenrePieChartData(shapeGenrePieChartData(track));
            setLoudnessGaugeData(track.loudness); 
            console.log(track); 
            console.log(trackPath);
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
                            width={225}
                            value={loudnessGaugeData}
                            text={`Loudness: ${loudnessGaugeData}`}
                            valueMin={-35}
                            valueMax={0}
                            startAngle={-90} 
                            endAngle={90}
                            sx={{
                                [`& .${gaugeClasses.valueText}`] : {
                                    fontSize: 12, 
                                    transform: 'translate(0px, -20px)'
                                }
                            }}
                        />
                    </div>

                    <div className="trackPreview" id="wavesurfer" >
                            <img 
                                width={700}
                                src={image} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrackAnalysis; 
