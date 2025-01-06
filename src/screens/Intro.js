import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import logo from "../images/Kalyan.png"; // Ensure the path is correct
import singledigit from "../images/singledigit.jpeg"
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window'); // Get screen width and height

const Intro = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Animation for the logo
  const buttonFadeAnim = useRef(new Animated.Value(0)).current; // Animation for the buttons

  useEffect(() => {

    const getData = async ()=>{
      const d = await AsyncStorage.getItem("isLoggedIn")
      if(d == "true"){
       navigation.navigate("Home")
      }
      
     }
     getData()
    // Fade in the logo
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Fade in the buttons after the logo animation
    Animated.timing(buttonFadeAnim, {
      toValue: 1,
      duration: 1500,
      delay: 500, // Delay to make the buttons show after the logo fades in
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, buttonFadeAnim]);

  return (
    <View style={styles.container}>
      {/* Animated Logo */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={logo} // Ensure the image path is correct
          style={styles.logo}
          resizeMode="contain" // Ensures the logo is contained within the specified dimensions
        />
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={{ opacity: buttonFadeAnim }}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.signupButton]}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Yellow Theme Background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Ensures padding on smaller screens
  },
  logo: {
    width: width * 0.8, // Dynamically adjust width based on screen width (80% of screen width)
    height: height * 0.3, // Dynamically adjust height based on screen height (30% of screen height)
    marginBottom: 40,
  },
  buttonContainer: {
    width: width * 1, // Buttons container will take full width
    alignItems: 'center', // Align buttons to the center
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%', // Buttons take up 80% of the screen width
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#ED1C24', // Red Button
  },
  loginButton: {
    backgroundColor: '#F0BA40', // Slightly different red for login
    
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Intro;
