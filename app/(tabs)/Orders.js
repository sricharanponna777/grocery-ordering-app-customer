import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import OrderCard from '../../components/OrderCard';
import { COLORS } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastComponent } from '../../components/Toasts';
import { AuthContext } from '../../context/authContext';
import { useRouter } from 'expo-router'

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const { logout } = useContext(AuthContext)
  const router = useRouter()

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch('http://192.168.1.233:5001/api/orders/my', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log(data)
      if (data.message == "Invalid or expired token") {
        ToastComponent('error', 'Session expired', 'Please log in again')
        logout()
        router.replace('/login')
        return
      }
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Orders</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {orders.length === 0 ? (
          <Text style={styles.noOrders}>No orders found.</Text>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FDF8',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  refreshButton: {
    backgroundColor: '#81C784',
    padding: 8,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scroll: {
    flex: 1,
  },
  noOrders: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default Orders;
