import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Appearance } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import { COLORS } from '../../constants/colors';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { ToastComponent } from '../../components/Toasts';

const ProductDetailScreen = () => {
  // Force the app to use light mode
  useEffect(() => {
    Appearance.setColorScheme('light');
  }, []);

  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const dispatch = useDispatch();

  // Adds the product to cart
  const handleAddToCart = (id, name, quantity, unitPrice, imageUrl) => {
    dispatch(addToCart({
      id: id, 
      name: name, 
      quantity: quantity, 
      unitPrice: unitPrice, 
      imageUrl: imageUrl
    }));
    ToastComponent('success', 'Success', `Added ${quantity} ${name} to Cart.`);
  };

  useEffect(() => {
    axios.get('http://192.168.1.233:5001/api/merchants/2/products')
      .then(response => {
        const foundProduct = response.data.find(p => p.id.toString() === productId.toString());
        setProduct(foundProduct);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => router.replace('/Products')}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" style={{ marginLeft: 20, marginVertical: 20 }} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.container}>
          <Animated.View entering={FadeInUp.duration(500)}>
            <Image source={{ uri: product.image_url }} style={styles.image} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.category}>{product.category_name}</Text>
            <Text style={styles.description}>{product.description}</Text>
            <Text style={styles.label}>Individual price: <Text style={styles.price}>£{product.price}</Text></Text>
            <Text style={[styles.availability, { color: product.is_available ? 'green' : 'red' }]}>
              {product.is_available ? 'Available' : 'Unavailable'}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.stepperContainer}>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                <Entypo name="minus" size={24} color={quantity === 1 ? '#aaa' : '#000'} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity((prev) => prev + 1)}>
                <Entypo name="plus" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text style={styles.label}>Total price: <Text style={styles.price}>£{(product.price * quantity).toFixed(2)}</Text></Text>

            <TouchableOpacity 
              style={[styles.addToCartButton, { backgroundColor: product.is_available ? COLORS.primary : 'grey' }]}
              disabled={!product.is_available} 
              onPress={() => {
                handleAddToCart(
                  productId,
                  product.name,
                  quantity,
                  product.price,
                  product.image_url ? product.image_url : 'https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary-1200x675.webp'
                );
              }}
            >
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 15,
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#777',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  availability: {
    fontSize: 18,
    marginBottom: 30,
  },
  stepperContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 160,
    justifyContent: 'space-between',
    backgroundColor: '#eee',
    borderRadius: 100,
    padding: 10,
    elevation: 2,
  },
  quantityText: {
    fontSize: 24,
    marginHorizontal: 16,
    fontWeight: '600',
  },
  addToCartButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  addToCartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
