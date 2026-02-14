import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/context/AuthContext';
import { appTheme } from './src/theme/theme';
import type { RootStackParamList, TabParamList } from './src/navigation/types';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ParkingScreen } from './src/screens/ParkingScreen';
import { RideFlowScreen } from './src/screens/RideFlowScreen';
import { ParkingFlowScreen } from './src/screens/ParkingFlowScreen';
import { AIInternalsScreen } from './src/screens/AIInternalsScreen';
import { AvailableRidesScreen } from './src/screens/AvailableRidesScreen';
import { ActiveRideScreen } from './src/screens/ActiveRideScreen';
import { RideOfferManagementScreen } from './src/screens/RideOfferManagementScreen';
import { AvailableParkingSpotsScreen } from './src/screens/AvailableParkingSpotsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const BACKGROUND = '#242423';
const HEADER_TINT = '#F4F7F5';

function Tabs() {
  return (
    <Tab.Navigator
      id="root-tabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BACKGROUND,
          borderTopColor: '#333',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Parking"
        component={ParkingScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={appTheme}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            id="root-stack"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: BACKGROUND },
            }}
          >
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen
              name="RideFlow"
              component={RideFlowScreen}
              options={{
                title: 'Ride',
                headerShown: true,
                headerTintColor: HEADER_TINT,
                headerStyle: { backgroundColor: BACKGROUND },
                headerTitleStyle: { color: HEADER_TINT },
              }}
            />
            <Stack.Screen
              name="ParkingFlow"
              component={ParkingFlowScreen}
              options={{
                title: 'Parking',
                headerShown: true,
                headerTintColor: HEADER_TINT,
                headerStyle: { backgroundColor: BACKGROUND },
                headerTitleStyle: { color: HEADER_TINT },
              }}
            />
            <Stack.Screen
              name="AIInternals"
              component={AIInternalsScreen}
              options={{
                title: 'AI internals',
                headerShown: true,
                headerTintColor: HEADER_TINT,
                headerStyle: { backgroundColor: BACKGROUND },
                headerTitleStyle: { color: HEADER_TINT },
              }}
            />
            <Stack.Screen
              name="AvailableRides"
              component={AvailableRidesScreen}
              options={{
                title: 'Available Rides',
                headerShown: true,
                headerTintColor: HEADER_TINT,
                headerStyle: { backgroundColor: BACKGROUND },
                headerTitleStyle: { color: HEADER_TINT },
              }}
            />
            <Stack.Screen
              name="ActiveRide"
              component={ActiveRideScreen}
              options={{
                title: 'Your Ride',
                headerShown: true,
                headerTintColor: HEADER_TINT,
                headerStyle: { backgroundColor: BACKGROUND },
                headerTitleStyle: { color: HEADER_TINT },
              }}
            />
            <Stack.Screen
              name="RideOfferManagement"
              component={RideOfferManagementScreen}
              options={{
                title: 'Manage Ride Offer',
                headerShown: true,
                headerTintColor: HEADER_TINT,
                headerStyle: { backgroundColor: BACKGROUND },
                headerTitleStyle: { color: HEADER_TINT },
              }}
            />
            <Stack.Screen
              name="AvailableParkingSpots"
              component={AvailableParkingSpotsScreen}
              options={{
                title: 'Available Parking',
                headerShown: true,
                headerTintColor: HEADER_TINT,
                headerStyle: { backgroundColor: BACKGROUND },
                headerTitleStyle: { color: HEADER_TINT },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
