import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
  Parking: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  RideFlow: { mode: 'need' | 'offer' };
  ParkingFlow: { mode: 'need' | 'offer' };
  AIInternals: undefined;
  AvailableRides: {
    pickupLocation: { lat: number; lng: number; description: string };
    dropoffLocation: { lat: number; lng: number; description: string };
    earliestTime: string;
    latestTime: string;
  };
  ActiveRide: {
    ride: {
      id: string;
      driverName: string;
      driverRating: number;
      driverPhoto?: string;
      vehicleModel: string;
      vehicleColor: string;
      licensePlate: string;
      departureTime: string;
      estimatedArrival: string;
      price: number;
      driverLocation: { lat: number; lng: number };
    };
    pickupLocation: { lat: number; lng: number; description: string };
    dropoffLocation: { lat: number; lng: number; description: string };
  };
  RideOfferManagement: {
    routeStart: { lat: number; lng: number; description: string };
    routeEnd: { lat: number; lng: number; description: string };
    earliestTime: string;
    latestTime: string;
    commission: number;
  };
  AvailableParkingSpots: {
    location: { lat: number; lng: number; description: string };
    fromTime: string;
    toTime: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
