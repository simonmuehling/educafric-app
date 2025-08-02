import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>EDUCAFRIC</Text>
      <ActivityIndicator size="large" color="#0079F2" style={styles.loader} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0079F2',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
});

export default LoadingScreen;