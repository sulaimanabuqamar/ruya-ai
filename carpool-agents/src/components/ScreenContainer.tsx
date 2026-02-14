import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';

const BACKGROUND = '#0B1020';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenContainer({ children, style }: Props) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
});
