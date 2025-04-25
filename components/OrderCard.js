import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/colors';

const STATUS_COLORS = {
  pending: '#FFA500', // orange
  accepted: '#4CAF50', // green
  rejected: '#F44336', // red
  cancelled: '#9E9E9E', // grey
  preparing: '#2196F3', // blue
  'ready for collection': '#673AB7', // purple
  collected: '#2E7D32', // dark green
};

const OrderCard = ({ order }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.customerName}>{order.customer_name}</Text>

      {/* Status Badge */}
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              STATUS_COLORS[order.status.toLowerCase()] || '#ccc',
          },
        ]}
      >
        <Text style={styles.statusText}>Status: {order.status}</Text>
      </View>

      <Text style={styles.orderDetails}>
        Total: £{parseFloat(order.total_amount).toFixed(2)}
      </Text>

      {/* QR Code */}
      <View style={styles.qrContainer}>
        {order.qr_code_url ? (
          <Image source={{ uri: order.qr_code_url }} style={styles.qrCode} />
        ) : (
          <Text>No QR Code available</Text>
        )}
      </View>

      {/* Order Items */}
      <ScrollView style={styles.itemsContainer}>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.product_name}</Text>
            <Text style={styles.itemQuantity}>
              {item.quantity} x £{parseFloat(item.unit_price).toFixed(2)}
            </Text>
            <Text style={styles.itemSubtotal}>
              Subtotal: £{parseFloat(item.subtotal).toFixed(2)}
            </Text>
            {item.notes && (
              <Text style={styles.itemNotes}>Notes: {item.notes}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#D9F5E5',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'green',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderDetails: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 10,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  qrContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  qrCode: {
    width: 150,
    height: 150,
    marginBottom: 10,
    borderRadius: 10,
  },
  itemsContainer: {
    marginTop: 10,
    maxHeight: 200,
  },
  itemRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemName: {
    fontSize: 16,
    color: COLORS.text,
  },
  itemQuantity: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  itemSubtotal: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  itemNotes: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

export default OrderCard;
