import { 
    Keys, 
    Genres, 
    Instrumentals 
} from "./types";

export interface Key {
    major: string;
    confidence: number; 
}

export interface Genre {
    type: string; 
    confidence: number; 
}

export interface GenrePieChartDatum {
    id: number; 
    value: number; 
    label: string; 
}

export interface Instrumental {
    type: string; 
    confidence: number; 
}

export interface Track { 
    name: string; 
    artist: string; 
    album: string; 
    year: string; 
    bpm: number; 
    duration: number; 
    loudness: number; 
    keys: Keys; 
    genres: Genres; 
    instrumentals: Instrumentals; 
}

export interface TrackCoverImage {
    format: string;  
    data: string; 
}