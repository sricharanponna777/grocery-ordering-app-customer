import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const itemIndex = state.findIndex(item => item.id === action.payload.id)
      if (itemIndex >= 0) {
        // Item already in cart, just update quantity and subtotal
        state[itemIndex].quantity += action.payload.quantity
        state[itemIndex].subTotal = parseFloat(state[itemIndex].quantity * state[itemIndex].unitPrice).toFixed(2)
      } else {
        state.push({ 
          id: action.payload.id, 
          name: action.payload.name, 
          quantity: action.payload.quantity, 
          unitPrice: action.payload.unitPrice, 
          subTotal: parseFloat(action.payload.quantity * action.payload.unitPrice).toFixed(2),
          img: action.payload.imageUrl
        })
      }
    },

    incrementQuantity: (state, action) => {
      const item = state.find(item => item.id === action.payload)
      if (item) {
        item.quantity += 1
        item.subTotal = parseFloat(item.quantity * item.unitPrice).toFixed(2)
      }
    },

    decrementQuantity: (state, action) => {
      const item = state.find(item => item.id === action.payload)
      if (item && item.quantity > 1) {
        item.quantity -= 1
        item.subTotal = parseFloat(item.quantity * item.unitPrice).toFixed(2)
      } else if (item) {
        // Remove item if quantity hits 1 and user tries to decrement
        return state.filter(i => i.id !== action.payload)
      }
    },

    removeFromCart: (state, action) => {
      return state.filter(item => item.id !== action.payload)
    },
    clearCart: () => {
      return []
    }
  }
});

export const { addToCart, incrementQuantity, decrementQuantity, removeFromCart, clearCart } = cartSlice.actions
export default cartSlice.reducer
