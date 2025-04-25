import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Animated, Easing, TouchableOpacity, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router'

const ProductRequestScreen = () => {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();

  // Animation States
  const [fadeAnim] = useState(new Animated.Value(0));  // Initial opacity is 0
  const [translateAnim] = useState(new Animated.Value(30));  // Initial position (below)
  const [scaleAnim] = useState(new Animated.Value(0)); // Scaling animation for button

  // Submit handler for the form
  const onSubmit = (data) => {
    console.log(data);
  };

  // Trigger animations when the component mounts
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    Animated.timing(translateAnim, {
      toValue: 0,
      duration: 800,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // Button scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Form Heading */}
      <Text style={styles.heading}>Request a Product</Text>

      {/* Animated Form */}
      <Animated.View
        style={[
          styles.formContainer,
          { opacity: fadeAnim, transform: [{ translateY: translateAnim }] },
        ]}
      >
        {/* Product Name */}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.productName && styles.inputError]}
              placeholder="Enter product name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholderTextColor="#B0B0B0"
            />
          )}
          name="productName"
          rules={{ required: 'Product name is required' }}
        />
        {errors.productName && <Text style={styles.errorText}>{errors.productName.message}</Text>}

        {/* Product Description */}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.productDescription && styles.inputError]}
              placeholder="Enter product description"
              multiline
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholderTextColor="#B0B0B0"
            />
          )}
          name="productDescription"
          rules={{ required: 'Product description is required' }}
        />
        {errors.productDescription && <Text style={styles.errorText}>{errors.productDescription.message}</Text>}

        

        {/* Animated Submit Button with Scaling */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.buttonText}>Request Product</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Floating Icon with Shadow */}
        {/* <Animated.View
          style={[
            styles.floatingIconContainer,
            { opacity: fadeAnim, transform: [{ translateY: translateAnim }] },
          ]}
        >
          <FontAwesome name="cart-plus" size={30} color="#fff" onPress={() => {router.replace('/(tabs)/Products')}} />
      </Animated.View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    elevation: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
    fontFamily: 'Roboto',
  },
  inputError: {
    borderColor: '#ff4d4d',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  floatingIconContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ProductRequestScreen;
