import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  Alert, 
  ActivityIndicator // Import ActivityIndicator
} from 'react-native';
import logo from '../images/Kalyan.png'; // Ensure the path to the logo is correct
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window'); // Get the screen dimensions

const Login = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator

  // Animation setup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;

  const handleGenerateOTP = async () => {
    // Validate phone number
    if (!/^\d{10}$/.test(mobileNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true); // Show loading spinner
    const formattedPhone = mobileNumber;
    try {
      // Send OTP
      const otpResponse = await axios.post(
        'https://sratebackend-1.onrender.com/newOtp/send-otp',
        { mobileNumber: formattedPhone },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('OTP Response:', otpResponse.data);

      // Step 2: Fetch user data
      const userResponse = await axios.get('https://sratebackend-1.onrender.com/user', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('User Response:', userResponse.data);
  
      // Check if the user exists before storing
      const userData = userResponse.data.find((i) => i.mobileNumber === mobileNumber);
  
      if (userData) {
        // Store user data in AsyncStorage if found
        try {
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          console.log('User data stored successfully:', userData);
  
          // Confirm the data was stored by retrieving it immediately
          const storedData = await AsyncStorage.getItem('userData');
          // console.log('Retrieved stored data:', JSON.parse(storedData));
          // console.log('OTP Response:', JSON.stringify(otpResponse));
  
          setLoading(false); // Hide loading spinner
          navigation.navigate('OtpVerification', {
            phoneNumber: formattedPhone,
            verificationId: otpResponse.data.verificationId, // Pass verificationId
          }); // Pass phone number to OTP screen
        } catch (storageError) {
          console.error('Error storing data in AsyncStorage:', storageError);
          Alert.alert('Error', 'Failed to save user data. Please try again.');
          setLoading(false); // Ensure loading is stopped on error
        }
      } else {
        setLoading(false); // Hide loading spinner
        Alert.alert('Error', 'User not found. Please sign up.');
      }

    } catch (error) {
      setLoading(false); // Hide loading spinner
      console.error('Error:', error.response ? error.response.data : error.message);
      Alert.alert(
        'Error',
        error.response ? error.response.data.message : 'Failed to send OTP. Please try again.'
      );
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    Animated.timing(formFadeAnim, {
      toValue: 1,
      duration: 1500,
      delay: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Upper Logo Container with Animation */}
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <Image source={logo} style={styles.logo} />
      </Animated.View>

      {/* Login Form with Animation */}
      <Animated.View style={[styles.formContainer, { opacity: formFadeAnim }]}>
        <Text style={styles.title}>We will send you a One Time Password on your mobile number</Text>

        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          placeholderTextColor="gray"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleGenerateOTP}>
          <Text style={styles.buttonText}>Generate OTP</Text>
        </TouchableOpacity>

        {/* Loading Indicator */}
        {loading && <ActivityIndicator size="large" color="#ED1C24" style={styles.loadingIndicator} />}

        {/* Link to Sign Up Screen */}
        <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  logoContainer: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.7, // 70% of screen width for logo
    height: height * 0.2, // 20% of screen height for logo
    resizeMode: 'contain',
  },
  formContainer: {
    paddingHorizontal: width * 0.08,
    alignItems: 'center',
  },
  title: {
    fontSize: width * 0.045,
    marginBottom: height * 0.03,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'gray',
  },
  input: {
    height: height * 0.07,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: width * 0.04,
    marginBottom: height * 0.02,
    color: 'black',
  },
  button: {
    backgroundColor: '#ED1C24', // Red Button
    paddingVertical: height * 0.015, // Adjust button size based on screen height
    borderRadius: 10,
    marginTop: height * 0.03, // 3% margin from inputs
    alignItems: 'center',
    width: width * 0.8,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: height * 0.02,
  },
  linkContainer: {
    marginTop: height * 0.02,
  },
  linkText: {
    color: '#1A5DBF',
    textAlign: 'center',
    fontSize: width * 0.045,
    fontWeight: '500',
  },
});

export default Login;