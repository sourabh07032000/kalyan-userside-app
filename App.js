import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens
import Intro from './src/screens/Intro';
import Signup from './src/screens/Signup';
import Login from './src/screens/Login';
import OtpVerification from './src/screens/OtpVerification';
import Home from './src/screens/Home';
import CustomDrawer from './src/screens/CustomDrawer';
import EditProfile from './src/screens/EditProfile';
import AddFund from './src/screens/AddFund';
import Withdrawal from './src/screens/Withdrawal';
import BidHistory from './src/screens/BidHistory';
import WalletStatement from './src/screens/WalletStatement';
import GameRates from './src/screens/GameRates';
import Support from './src/screens/Support';
import BidWinHistory from './src/screens/BidWinHistory';
import ChangePassword from './src/screens/ChangePassword';
import GameSelection from './src/screens/GameSelection';
import GameScreen from './src/screens/GameScreen';
import JodiScreen from './src/screens/JodiScreen';
import SangamScreen from './src/screens/SangamScreen';
import Mpin from './src/screens/Mpin';

// Create Stack Navigator
const Stack = createStackNavigator();

// Main App component
export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      
      if (userData && isLoggedIn === 'true') {
        setInitialRoute('Mpin'); // Set initial route to Mpin if user is logged in
      } else {
        setInitialRoute('Intro');
      }
    } catch (error) {
      console.error("AsyncStorage error: ", error);
      setInitialRoute('Intro');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Mpin"
          component={Mpin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Intro"
          component={Intro}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OtpVerification"
          component={OtpVerification}
          options={{ headerShown: false }}
        />
      <Stack.Screen
  name="Home"
  component={Home}
  options={{ 
    headerShown: false,
    gestureEnabled: false // Disable swipe back gesture
  }}
/>
        <Stack.Screen
          name="CustomDrawer"
          component={CustomDrawer}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddFund"
          component={AddFund}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Withdrawal"
          component={Withdrawal}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BidHistory"
          component={BidHistory}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WalletStatement"
          component={WalletStatement}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BidWinHistory"
          component={BidWinHistory}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GameRates"
          component={GameRates}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Support"
          component={Support}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GameSelection"
          component={GameSelection}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GameScreen"
          component={GameScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="JodiScreen"
          component={JodiScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SangamScreen"
          component={SangamScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}