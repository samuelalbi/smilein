/* eslint-disable react/no-unstable-nested-components */
import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Alert } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Import screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import { DetailScreen } from './screens/DetailScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileSettingScreen from './screens/ProfileSettingScreen';
import StatusPresence from './screens/StatusPresence';

// Import context
import { AuthProvider, useAuth, setNavigationRef } from './context/AuthContext';
import { AppContextProvider, useAppContext } from './context/AppContext';
import { LocationProvider } from './context/LocationContext'; // Add LocationProvider import

// Import types - now just empty objects for compatibility
import SplashScreen from 'react-native-splash-screen';

import { CardStyleInterpolators } from '@react-navigation/stack';
import { Easing } from 'react-native-reanimated';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator untuk layar utama setelah login
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'HistoryTab') {
            iconName = focused ? 'time' : 'time-outline';
          }

          return <Icon name={String(iconName)} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#232F40',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#eee',
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 5,
        },
        headerShown: false, // Sembunyikan header dari tab navigator
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Beranda',
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Riwayat',
        }}
      />
    </Tab.Navigator>
  );
};

// Stack navigator untuk mengelola autentikasi dan navigasi detail
const AuthNavigator = () => {
  const { isAuthenticated, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();

  // Show alert for expired session
  useEffect(() => {
    if (sessionExpiredMessage) {
      Alert.alert(
        'Sesi Berakhir',
        sessionExpiredMessage,
        [{ text: 'OK', onPress: clearSessionExpiredMessage }]
      );
    }
  }, [sessionExpiredMessage, clearSessionExpiredMessage]);

  return (
    <Stack.Navigator
      screenOptions={{
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300,
              easing: Easing.inOut(Easing.ease),
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 300,
              easing: Easing.inOut(Easing.ease),
            },
          },
        },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      {!isAuthenticated ? (
        // If not authenticated, show only the Login screen
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        // If authenticated, show MainTabNavigator and Detail screens
        // LocationProvider is only active when user is authenticated
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProfileSettings"
            component={ProfileSettingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StatusPresence"
            component={StatusPresence}
            options={{ title: 'Attendance Status' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// Wrapper component to conditionally provide LocationContext only when authenticated
const AuthenticatedApp = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useAppContext();
  const navigationRef = useRef<NavigationContainerRef>(null);

  // Set navigation reference for use outside components
  useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }
  }, [navigationRef]);

  return (
    <NavigationContainer ref={navigationRef}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
          backgroundColor={theme === 'light' ? '#fff' : '#222'}
        />
        {isAuthenticated ? (
          // Only provide LocationContext when user is authenticated
          // This ensures location tracking only happens when needed
          <LocationProvider>
            <AuthNavigator />
          </LocationProvider>
        ) : (
          // For login screen, no location tracking needed
          <AuthNavigator />
        )}
      </SafeAreaView>
    </NavigationContainer>
  );
};

const MainApp = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <AppContextProvider>
      <MainApp />
    </AppContextProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;