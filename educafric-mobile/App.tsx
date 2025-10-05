import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AppNavigator} from './src/navigation/AppNavigator';
import './src/locales/i18n';
import {colors} from './src/theme';

const queryClient = new QueryClient();

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <SafeAreaView style={styles.container}>
          <AppNavigator />
        </SafeAreaView>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default App;
