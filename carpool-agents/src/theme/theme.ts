import { MD3LightTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

const appTheme: MD3Theme = {
  ...MD3LightTheme,
  dark: true,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    primaryContainer: '#1E3A8A',
    secondary: '#F4F7F5',
    secondaryContainer: '#2F312F',
    background: '#242423',
    surface: '#2F312F',
    surfaceVariant: '#3A3C3A',
    onPrimary: '#FFFFFF',
    onSecondary: '#242423',
    onBackground: '#F4F7F5',
    onSurface: '#F4F7F5',
    onSurfaceVariant: '#9CA3AF',
    outline: '#4B5563',
    outlineVariant: '#374151',
  },
};

export { appTheme };
