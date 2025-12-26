import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";


const initialState = {
    cartItem: [],
    isLoading: false,
    error: "",
};


export const getCart = createAsyncThunk(
    "cart/getCart",
    async (_, thunkAPI) => {
        try {
            const { data } = await axios.get("/api/cart/get-cart");
            return data
        } catch (error) {
            console.error("Error getting cart", error);
            return thunkAPI.rejectWithValue(error)
        }
    },
    {
        condition: (state: any) => {
            if (state.cart.isLoading) {
                return false;
            }
        }
    }
)

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async (product: any, thunkAPI) => {
        try {
            const { data } = await axios.post("/api/cart/update-cart", product);

            return data
        } catch (error) {
            console.error("Error adding to cart", error);
            return thunkAPI.rejectWithValue(error)
        }
    },
    {
        condition: (state: any) => {
            if (state.cart.isLoading) {
                return false;
            }
        }
    }
)


const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state: any, action: PayloadAction<any>) => {
            const itemIndex = state.cartItem.findIndex((item: any) => item.product.id === action.payload.product.id);
            if (itemIndex !== -1) {
                state.cartItem[itemIndex].quantity += action.payload.quantity;
            } else {
                state.cartItem.push({ product: action.payload.product, quantity: action.payload.quantity })
            }
        },
        subFromCart: (state: any, action: PayloadAction<any>) => {
            const itemIndex = state.cartItem.findIndex((item: any) => item.product.id === action.payload.product.id);
            if (state.cartItem[itemIndex].quantity > 1) {
                state.cartItem[itemIndex].quantity -= action.payload.quantity;
            } else {
                state.cartItem.filter((item: any) => item.product.id !== action.payload.product.id)
            }
        },
        removeFromCart: (state: any, action: PayloadAction<any>) => {
            state.cartItems = state.cartItems.filter((item: any) => item.product.id !== action.payload.id);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getCart.pending, (state) => {
            state.isLoading = true
        })
            .addCase(getCart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cartItem = action.payload
            })
            .addCase(getCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message as string
            })
    }
})

export const { subFromCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;