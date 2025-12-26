"use client"

import { configureStore } from "@reduxjs/toolkit";
import locationReducer from "@/app/features/location/locationSlice";
import cartReducer from "@/app/features/cart/cartSlice";

export const store = configureStore({
    reducer: {
        location: locationReducer,
        cart: cartReducer,
    }
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>
