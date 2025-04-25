import { Tabs } from 'expo-router';
import { FontAwesome, FontAwesome6, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

export default function TabsLayout() {
  const cartItems = useSelector((state) => state.cart);

  const itemCount = cartItems.length; // number of distinct products

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'green', headerShown: false }}>
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
          title: "Home"
        }}
      />
      <Tabs.Screen
        name="Products"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome6 name="carrot" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Orders"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="bag" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Cart"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="shopping-cart" size={24} color={color} />
          ),
          tabBarBadge: itemCount > 0 ? itemCount : null,
        }}
      />
      <Tabs.Screen
        name="Request Product"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="cube-sharp" size={24} color={color} />,
          tabBarLabel: "Request"
        }}
      />
    </Tabs>
  );
}
