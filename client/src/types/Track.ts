export interface Instrumental {
    type: String; 
    confidence: Number; 
}

export interface Genre {
    type: String; 
    confidence: Number; 
}

export interface Key {
    major: String;
    confidence: Number; 
}

export interface Track { 
    name: string; 
    artist: String; 
    album: String; 
    year: String; 
    loudness: Number; 
    duration: Number; 
    bpm: Number; 
    keys: Array<Key>; 
    genres: Array<Genre>; 
    instrumentals: Array<Instrumental>; 
}