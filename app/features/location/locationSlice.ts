import { createSlice, PayloadAction } from "@reduxjs/toolkit"


const initialState = {
    userLocation: "CA",
    isLocationDialogOpen: false,
    isLoading: false,
    error: "",
}

const locationSlice = createSlice({
    name: "location",
    initialState,
    reducers: {
        setUserLocation: (state: any, action: PayloadAction<string>) => {
            state.userLocation = action.payload
        },
        setIsLocationDialogOpen: (state: any, action: PayloadAction<boolean>) => {
            state.isLocationDialogOpen = action.payload
        },
        setIsLoading: (state: any, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },
    },
})

export const { setUserLocation, setIsLocationDialogOpen, setIsLoading } = locationSlice.actions;
export default locationSlice.reducer;