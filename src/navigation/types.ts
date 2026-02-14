import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Preferences: undefined;
  Trip: undefined;
  Simulation: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
