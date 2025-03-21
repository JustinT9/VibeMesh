CREATE TABLE trackGeneralInfo (
    TrackName varchar(255) NOT NULL, 
    TrackAlbum varchar(255) NOT NULL, 
    TrackArtist varchar(255) NOT NULL, 
    bpm int, 
    duration double, 
    primary key(TrackName, TrackAlbum, TrackArtist)
); 

CREATE TABLE trackKeys (
    TrackName varchar(255) NOT NULL, 
    TrackAlbum varchar(255) NOT NULL, 
    TrackArtist varchar(255) NOT NULL, 
    TrackKey varchar(255) NOT NULL, 
    confidence float, 
    primary key(TrackName, TrackAlbum, TrackArtist, TrackKey) 
); 

CREATE TABLE trackGenres (
    TrackName varchar(255) NOT NULL, 
    TrackAlbum varchar(255) NOT NULL, 
    TrackArtist varchar(255) NOT NULL, 
    genre varchar(255) NOT NULL, 
    confidence float, 
    primary key(TrackName, TrackAlbum, TrackArtist, genre)
); 

CREATE TABLE trackInstrumentals (
    TrackName varchar(255) NOT NULL, 
    TrackAlbum varchar(255) NOT NULL, 
    TrackArtist varchar(255) NOT NULL,
    instrumental varchar(255) NOT NULL, 
    confidence float, 
    primary key(TrackName, TrackAlbum, TrackArtist, instrumental, confidence)
); 