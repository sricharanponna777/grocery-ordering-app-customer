import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import store from '../redux/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaProvider and SafeAreaView

// Firebase Modules
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import * as Notifications from 'expo-notifications';
import { getMessaging, getToken } from 'firebase/messaging'; // For Firebase Messaging
import { DefaultTheme, PaperProvider } from 'react-native-paper';

// Firebase config (With projectId added)
const firebaseConfig = {
  apiKey: "AIzaSyBjsoCEgZ6fog_VilbaYlNZ4J6k-Lsyk_0",
  authDomain: "squadbid-react-native-fe981.firebaseapp.com",
  projectId: "squadbid-react-native-fe981", // Added projectId
  storageBucket: "squadbid-react-native-fe981.firebasestorage.app",
  messagingSenderId: "614592916533",
  appId: "1:614592916533:web:a0c07b63a92e01dc85157c"
};

// Initialize Firebase
initializeApp(firebaseConfig);
getAnalytics(); // Optional: If you plan to use Firebase Analytics

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'green',
    secondary: '#81c784'
  }
}

function AuthGate({ children }) {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Requesting push notification permissions (important for iOS)
    const requestPushNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permission denied');
        return;
      }
      console.log('Notification permission granted');
    };

    // Request permission only once
    requestPushNotificationPermissions();

    // Function to get the FCM token
    const getFCMToken = async () => {
      try {
        // First, get the Expo push token
        const expoPushToken = await Notifications.getExpoPushTokenAsync();
        console.log('Expo Push Token:', expoPushToken.data);
        await AsyncStorage.setItem('fcmToken', expoPushToken.data); // Store the token in AsyncStorage

        // Now, using Firebase Messaging to fetch the FCM token
        const messaging = getMessaging();
        const fcmToken = await getToken(messaging, {
          vapidKey: 'YOUR_VAPID_KEY' // Use if you're using web push, not needed for mobile
        });

        console.log('FCM Token:', fcmToken);
        if (fcmToken) {
          await AsyncStorage.setItem('firebaseToken', fcmToken); // Store the Firebase token
        }
      } catch (error) {
        console.error('Error fetching FCM token:', error);
      }
    };

    // Call the function to fetch the FCM token
    getFCMToken();

    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      const expiration = parseInt(await AsyncStorage.getItem('expiration'));
      if (!token || expiration < Date.now() - 10000) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(tabs)/Home');
      }
    };

    checkAuth();

    setIsFirebaseInitialized(true);
  }, [router]);

  return isFirebaseInitialized ? children : null;
}

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StripeProvider publishableKey='pk_test_51RFKfkR10zYnhCiZEYcTdD8juXQjyCGV7NUgqYXHC0hv1znWj975HYnzRdrl5GWMw9uAUuTUSi4lINxuPhCTQuka002xNTNjVw'>
          <Provider store={store}>
            <AuthProvider>
              <AuthGate>
                <SafeAreaProvider>
                  <SafeAreaView style={{ flex: 1 }}>
                    <Slot />
                    <Toast />
                  </SafeAreaView>
                </SafeAreaProvider>
              </AuthGate>
            </AuthProvider>
          </Provider>
        </StripeProvider>
      </GestureHandlerRootView>
    </PaperProvider>
  );
}
