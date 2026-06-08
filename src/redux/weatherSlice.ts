// weather data and fav cities list to keep global
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface WeatherState {
    currentWeather : any | null
    favorites: any[];
    loading: boolean;
}

const initialState: WeatherState = {
    currentWeather: null,
    favorites: [],
    loading: false,
};

const weatherSlice = createSlice({
    name:"weather",
    initialState,
    reducers: {
        setCurrentWeather: (state, action:PayloadAction<any>) =>{
           state.currentWeather = action.payload;
        },
        setFavorites: (state, action:PayloadAction<any[]>) =>{
            state.favorites = action.payload;
        },
        addFavoriteSuccess: (state, action:PayloadAction<any>) =>{
            state.favorites.unshift(action.payload);
        },
        removeFavoriteSuccess: (state, action:PayloadAction<string>) =>{
            state.favorites = state.favorites.filter((fav) => fav._id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) =>{
            state.loading = action.payload;
        },
    },
});

export const {
    setCurrentWeather,
    setFavorites,
    addFavoriteSuccess,
    removeFavoriteSuccess,
    setLoading
} = weatherSlice.actions

export default weatherSlice.reducer