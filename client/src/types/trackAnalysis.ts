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
    artist: String; 
    album: String; 
    year: String; 
    bpm: Number; 
    keys: Array<Key>; 
    genres: Array<Genre>; 
    instrumentals: Array<Instrumental>; 
}