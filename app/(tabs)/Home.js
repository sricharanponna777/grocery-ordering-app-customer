import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Text,
  Pressable,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {
  ActivityIndicator,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Searchbar,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import Animated from 'react-native-reanimated';
import {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated'

import { ToastComponent } from '../../components/Toasts';
import { ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur'


// Haversine formula to calculate distance between two coordinates
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const { width: screenWidth } = Dimensions.get('window')

export default function HomeScreen() {
  const router = useRouter();
  const { logout } = useContext(AuthContext);
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location access is required.');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const response = await fetch("http://192.168.1.233:5001/collection-points");
        const data = await response.json();

        const stored = await AsyncStorage.getItem("selectedCollectionPoint");
        const selected = stored ? JSON.parse(stored) : null;

        setUserLocation(location.coords);
        setSelectedPointId(selected?.id || null);

        const sorted = data.map(point => {
          const distance = userLocation
            ? getDistanceFromLatLonInKm(
                location.coords.latitude,
                location.coords.longitude,
                point.latitude,
                point.longitude
              )
            : null;
          return { ...point, distance };
        });

        sorted.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        setCollectionPoints(sorted);
      } catch (error) {
        console.error("Error loading data:", error);
        Alert.alert("Error", "Could not load collection points or location.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSelect = async (point) => {
    try {
      await AsyncStorage.setItem("selectedCollectionPoint", JSON.stringify(point));
      setSelectedPointId(point.id);
      ToastComponent("success", "Selected", `You've selected ${point.location_name}`);
      Keyboard.dismiss();
    } catch (error) {
      console.error("Failed to save collection point:", error);
      Alert.alert("Error", "Failed to save your selection.");
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const filteredPoints = collectionPoints.filter(point =>
    point.location_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showOnlySearch = searchTerm.length > 0 && !keyboardVisible;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const onPress = () => {
    router.push('/Products');
  };

  if (loading)
    return (
      <ActivityIndicator size="large" style={{ flex: 1 }} color={COLORS.primary} />
    );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      
    
      <ScrollView
        contentContainerStyle={styles.container}
        scrollEnabled={!keyboardVisible}
        keyboardShouldPersistTaps="always"
      >
        {/* Search bar */}
        <Searchbar
          style={styles.searchbar}
          placeholder="Search..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          icon={() => <MaterialIcons name="search" size={20} color="gray" />}
        />

        {/* Suggestions */}
        {(keyboardVisible || showOnlySearch) && (
          <View style={[styles.suggestionsContainer, { top: 50 }]}>
            {filteredPoints.length === 0 ? (
              <Text style={styles.noMatchText}>No matching collection points</Text>
            ) : (
              filteredPoints.map(point => (
                <TouchableOpacity
                  key={point.id}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSearchTerm('');
                    handleSelect(point);
                  }}
                >
                  <Text style={styles.suggestionText}>{point.location_name}</Text>
                  {point.distance != null && (
                    <Text style={styles.suggestionDistance}>
                      {point.distance.toFixed(2)} km
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Main content */}
        {!showOnlySearch && !keyboardVisible && (
          <>
            <View style={styles.header}>
              <Title style={styles.heading}>Welcome to SquadBid</Title>
              <TouchableOpacity onPress={handleLogout}>
                <MaterialIcons name="logout" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <Text style={styles.subheading}>
              Instant Collection,{" "}
              <Animated.Text entering={FadeIn.duration(10000)} style={styles.highlightText}>
                in a snap
              </Animated.Text>
            </Text>

            <Card style={styles.eventCard}>
              <Card.Content>
                <Paragraph style={styles.eventText}>No current events. Check back later!</Paragraph>
              </Card.Content>
            </Card>

            {selectedPointId && (
              <Card style={styles.selectedContainer}>
                <Card.Content>
                  <Text style={styles.selectedLabel}>Selected Collection Point:</Text>
                  <Text style={styles.selectedName}>
                    {collectionPoints.find(p => p.id === selectedPointId)?.location_name || 'N/A'}
                  </Text>
                </Card.Content>
              </Card>
            )}

            <AnimatedPressable
              onPressIn={() => {
                scale.value = withSpring(0.95, { stiffness: 200 });
              }}
              onPressOut={() => {
                scale.value = withSpring(1, { stiffness: 200 });
              }}
              onPress={onPress}
              style={[
                {
                  marginTop: 40,
                  backgroundColor: '#81C784',
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 2,
                },
                animatedStyle,
              ]}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '600',
                  letterSpacing: 0.5,
                }}
              >
                Go to Shop
              </Text>
            </AnimatedPressable>
          </>
        )}
     {/* </ImageBackground>  */}
     </ScrollView>
    
  </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  subheading: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
  },
  highlightText: {
    color: '#81c784',
    fontWeight: '700',
  },
  eventCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  eventText: {
    fontSize: 16,
    color: '#777',
  },
  searchbar: {
    marginBottom: 16,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    paddingVertical: 4,
    maxHeight: 200,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  suggestionDistance: {
    fontSize: 13,
    color: '#777',
  },
  noMatchText: {
    fontSize: 14,
    padding: 12,
    color: '#888',
  },
  selectedContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  selectedLabel: {
    fontSize: 14,
    color: '#388e3c',
    marginBottom: 4,
    fontWeight: '600',
  },
  selectedName: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '700',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: screenWidth * 2,
    flexDirection: 'row',
  },
  image: {
    width: screenWidth,
    height: '100%',
    position: 'absolute',
  },
});
