import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator, TouchableOpacity, LogBox } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Animated, { FadeIn } from 'react-native-reanimated';
LogBox.ignoreAllLogs()
export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    axios.get(`http://192.168.1.233:5001/api/merchants/2/products`)
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, []);

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeIn.delay(index * 100)}>
      <View style={styles.productCard}>
        <Image source={{ uri: item.image_url }} style={styles.productImage} />
        <TouchableOpacity style={styles.productDetails} onPress={() => router.push(`/product-details/${item.id}`)}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category_name}</Text>
          <Text style={styles.productDescription}>{item.description}</Text>
          <Text style={styles.productPrice}>£{item.price}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Available Products</Text>

      <FlatList
        data={products}
        renderItem={({ item, index }) => renderItem({ item,index })}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  productCategory: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 12,
    color: '#777',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 100,
  },
  backButton: {
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
