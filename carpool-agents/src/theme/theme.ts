import { MD3LightTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

const appTheme: MD3Theme = {
  ...MD3LightTheme,
  dark: true,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4C7EFF',
    secondary: '#FFB347',
    background: '#0B1020',
    surface: '#151A30',
    surfaceVariant: '#1E2440',
    onPrimary: '#FFFFFF',
    onSecondary: '#0B1020',
    onBackground: '#F0F2F5',
    onSurface: '#F0F2F5',
    onSurfaceVariant: '#B0B4BC',
    outline: '#2A3050',
    outlineVariant: '#1E2440',
  },
};

export { appTheme };
