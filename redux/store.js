import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice'
// import { devToolsEnhancer } from '@redux-devtools/extension'

const store = configureStore({
    reducer: {
        cart: cartReducer,
        // devToolsEnhancer
    }
})

export default store