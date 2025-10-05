import React from 'react';
import {View, ActivityIndicator, StyleSheet, Text} from 'react-native';
import {colors, spacing} from '../theme';

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>EDUCAFRIC</Text>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xl,
  },
});
