import { 
    Keys, 
    Genres, 
    GenrePieChartData, 
    Instrumentals 
} from "../common/types";
import {
    Track, 
    Key, 
    Genre, 
    Instrumental
} from "../common/interfaces"

const shapeKeyData = (
    keyData: Array<any>
): Keys => {
    const shapedKeyData: Keys = keyData.map(
        (key: Array<any>) => {
        const keyObj: Key = { 
            major: key[0], 
            confidence: key[1] 
        }
        return keyObj; 
    }); 

    return shapedKeyData; 
}; 

const shapeGenreData = (
    genreData: Array<any> 
): Genres => {
    const shapedGenreData: Genres = genreData.map(
        (genre: Array<any>) => {
        const genreObj: Genre = {
            type: genre[0], 
            confidence: genre[1]
        }
        return genreObj; 
    }); 

    return shapedGenreData; 
}; 

const shapeGenrePieChartData = (
    track: Track 
): GenrePieChartData => {
    if (track) {
        const confidenceSum: number = track.genres.reduce(
            (accumulator, currentValue) => 
            accumulator + currentValue.confidence, 0);
        const genrePieChartData: GenrePieChartData = track.genres.map(
            (genre: Genre, index: number) => 
            ({ id: index, value: genre.confidence / confidenceSum, label: genre.type })); 
    
        return genrePieChartData; 
    }

    return []; 
}; 

const shapeInstrumentalData = (
    instrumentalData: Array<any>
): Instrumentals => {
    const confidenceSum: number = instrumentalData.reduce(
        (accumulator, currentValue) => 
        accumulator + currentValue[1], 0);
    const shapedInstrumentalData: Instrumentals = instrumentalData.map(
        (instrumental: Array<any>) => {
        const instrumentalObj: Instrumental = {
            type: instrumental[0], 
            confidence: instrumental[1] / confidenceSum
        }
        return instrumentalObj; 
    }); 

    return shapedInstrumentalData; 
}; 
 
export { 
    shapeKeyData, 
    shapeGenreData, 
    shapeGenrePieChartData, 
    shapeInstrumentalData 
}; 