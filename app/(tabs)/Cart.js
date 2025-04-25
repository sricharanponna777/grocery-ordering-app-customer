import React, { useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Alert,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import {
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
} from '../../redux/cartSlice'
import { Swipeable } from 'react-native-gesture-handler'
import { useStripe } from '@stripe/stripe-react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { ToastComponent } from '../../components/Toasts'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

const Cart = () => {
  const cartItems = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const stripe = useStripe()

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }, [cartItems])

  const getTotal = () => {
    return cartItems
      .reduce((sum, item) => sum + parseFloat(item.subTotal), 0)
      .toFixed(2)
  }

  const handleCheckout = async () => {
    const total = parseFloat(getTotal())
    const amount = Math.round((total + Number.EPSILON) * 100);

    try {
      const response = await fetch('http://192.168.1.233:5001/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      const { clientSecret } = await response.json()

      const { error } = await stripe.initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'SquadBid',
        applePay: true,
        googlePay: true,
        style: 'automatic',
        allowsDelayedPaymentMethods: false,
      })

      if (error) {
        Alert.alert('Error', error.message)
        return
      }

      const { error: presentError } = await stripe.presentPaymentSheet()

      if (presentError) {
        Alert.alert('Payment Failed', presentError.message)
        return
      }

      const token = await AsyncStorage.getItem('token')

      const orderResponse = await fetch('http://192.168.1.233:5001/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: 2,
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            notes: item.notes || "",
          })),
          notes: "",
        }),
      })

      const orderData = await orderResponse.json()

      if (orderResponse.ok) {
        console.log(orderData)

        const agentData = await AsyncStorage.getItem('selectedCollectionPoint')
        console.log(agentData);

        // Backend is going to take in Agent data
        await axios.post(
          `http://192.168.1.233:5001/api/agent/orders/${orderData.order_id}/assign`,
          { agentData: agentData },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        console.log(agentData)
        ToastComponent('success', 'Success', 'Payment complete!')
        dispatch(clearCart())
      } else {
        Alert.alert('Order failed', orderData.message || 'Something went wrong')
        ToastComponent('error', 'Error', 'Order creation failed.')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      Alert.alert('Error', 'Something went wrong during checkout.')
    }
  }

  const renderRightActions = (itemId) => (
    <TouchableOpacity
      style={styles.swipeDelete}
      onPress={() => dispatch(removeFromCart(itemId))}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  )

  const renderItem = ({ item, index }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
        <View style={styles.card}>
          <Image source={{ uri: item.img }} style={styles.image} />
          <View style={styles.content}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.unitPrice}>£{item.unitPrice} each</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => dispatch(decrementQuantity(item.id))}
              >
                <Text style={styles.qtyText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => dispatch(incrementQuantity(item.id))}
              >
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subTotal}>Subtotal: £{item.subTotal}</Text>
          </View>
        </View>
      </Animated.View>
    </Swipeable>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Cart ({cartItems.reduce((sum) => sum + 1, 0)} items)
        </Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={() => dispatch(clearCart())}>
            <Text style={styles.clearCart}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty 🛒</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
          <View style={styles.footer}>
            <Text style={styles.total}>Total: £{getTotal()}</Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
  },
  clearCart: {
    color: 'tomato',
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  swipeDelete: {
    backgroundColor: '#FF6F61',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 16,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  unitPrice: {
    color: '#888',
    fontSize: 14,
    marginBottom: 6,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  qtyButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
  },
  subTotal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#388e3c',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#81C784',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    elevation: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  checkoutButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  checkoutText: {
    color: '#388e3c',
    fontWeight: '600',
    fontSize: 16,
  },
  empty: {
    textAlign: 'center',
    fontSize: 16,
    color: '#aaa',
    marginTop: 50,
  },
})

export default Cart
