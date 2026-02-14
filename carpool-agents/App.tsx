import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { appTheme } from './src/theme/theme';
import type { RootStackParamList, TabParamList } from './src/navigation/types';
import { HomeScreen } from './src/screens/HomeScreen';
import { PreferencesScreen } from './src/screens/PreferencesScreen';
import { TripScreen } from './src/screens/TripScreen';
import { SimulationScreen } from './src/screens/SimulationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B1020',
          borderTopColor: '#151A30',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#4C7EFF',
        tabBarInactiveTintColor: '#888',
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
        name="Preferences"
        component={PreferencesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="options-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Trip"
        component={TripScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Simulation"
        component={SimulationScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={appTheme}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0B1020' },
          }}
        >
          <Stack.Screen name="Tabs" component={Tabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
