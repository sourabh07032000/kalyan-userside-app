import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  StyleSheet, 
  Animated, 
  Image, 
  Dimensions 
} from 'react-native';
import logo from '../images/Kalyan.png'; // Ensure the logo path is correct
import axios from 'axios';
const { width, height } = Dimensions.get('window'); // Get screen width and height

const Signup = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [mPin, setMPin] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  // Animation setup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    Animated.timing(buttonFadeAnim, {
      toValue: 1,
      duration: 1500,
      delay: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignUp = async () => {
    // Validation checks
    if (!username || !mobileNumber || !mPin) {
      Alert.alert('Validation Error', 'All fields are required');
      return;
    }
  
    if (mobileNumber.length !== 10 || isNaN(mobileNumber)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number');
      return;
    }
  
    if (mPin.length !== 4) {
      Alert.alert('Validation Error', 'MPIN must be 4 digits');
      return;
    }
  
    setLoading(true);
    try {
      // First check if user already exists
      const checkUser = await axios.get(`https://sratebackend-1.onrender.com/user`);
      const userExists = checkUser.data.some(
        user => user.username === username || user.mobileNumber === mobileNumber
      );
  
      if (userExists) {
        Alert.alert('Error', 'Username or Mobile Number already exists');
        setLoading(false);
        return;
      }
  
      // If user doesn't exist, proceed with signup
      const signupData = {
        username: username,
        mobileNumber: mobileNumber,
        password: mPin, // Using mPin as password
        mPin: mPin,
        wallet: 200, // Default wallet amount
        transactionRequest: [],
        betDetails: [],
        withdrawalRequest: []
      };
  
      console.log('Sending signup data:', signupData); // Debug log
  
      const response = await axios.post(
        'https://sratebackend-1.onrender.com/user',
        signupData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('Signup response:', response.data); // Debug log
  
      if (response.data) {
        Alert.alert(
          'Success', 
          'Account created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated Logo */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image source={logo} style={styles.logo} />
      </Animated.View>

      {/* Form Fields */}
      <Animated.View style={{ opacity: buttonFadeAnim }}>
      <TextInput
  style={styles.input}
  placeholder="Enter Username"
  placeholderTextColor="gray"
  value={username}
  onChangeText={setUsername}
  autoCapitalize="none"
  maxLength={20}
/>

<TextInput
  style={styles.input}
  placeholder="Enter Mobile Number"
  value={mobileNumber}
  onChangeText={setMobileNumber}
  placeholderTextColor="gray"
  keyboardType="numeric"
  maxLength={10}
/>

<TextInput
  style={styles.input}
  placeholder="Enter 4-digit MPIN"
  value={mPin}
  onChangeText={setMPin}
  placeholderTextColor="gray"
  keyboardType="numeric"
  maxLength={4}
  secureTextEntry
/>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Link to Login Screen */}
        <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Log In</Text>
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
    alignItems: 'center',
    padding: width * 0.05, // Ensure padding adjusts to screen size
  },
  logo: {
    width: width * 0.7, // 80% of screen width for logo
    height: height * 0.25, // 25% of screen height for logo
    marginBottom: height * 0.05, // 5% of screen height margin
    resizeMode:"contain"
  },
  input: {
    height: height * 0.06, // 6% of screen height for inputs
    width: width* 0.8,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: height * 0.02, // 2% of screen height margin
    paddingLeft: width * 0.04, // 4% of screen width for padding
  },
  button: {
    backgroundColor: '#ED1C24', // Red Button
    paddingVertical: height * 0.015, // Adjust button size based on screen height
    borderRadius: 10,
    marginTop: height * 0.03, // 3% margin from inputs
    alignItems: 'center',
    width: width* 0.8,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.05, // 5% of screen width for font size
    fontWeight: 'bold',
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

export default Signup;
