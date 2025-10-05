import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {LoginScreen} from '../screens/LoginScreen';
import {LoadingScreen} from '../screens/LoadingScreen';
import {DashboardScreen} from '../screens/DashboardScreen';
import {useAuthStore} from '../store/authStore';
import apiService from '../services/api';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const {user, isLoading, setUser, setLoading} = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = await apiService.getStoredUser();
      if (storedUser) {
        const currentUser = await apiService.getCurrentUser();
        setUser(currentUser);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {user ? (
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
