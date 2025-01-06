import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import axios from 'axios';
import logo from '../images/oottp.png';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const OTPVerificationScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const phoneNumber = route.params.phoneNumber;
  const verificationId = route.params.verificationId;

  useEffect(() => {
    // const getData = async ()=>{
    //   const d = await AsyncStorage.getItem("isLoggedIn")
    //   if(d == "true"){
    //    navigation.navigate("Home")
    //   }
      
    //  }
    //  getData()
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]*$/.test(value) && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }

    if (!value && index > 0) {
      inputRefs.current[index - 1].focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleVerifyOtp = async (otpString) => {
    try {
      const response = await axios.post(
        'https://sratebackend-1.onrender.com/newOtp/validate-otp',
        {
          otp: otpString,
          phoneNumber,
          verificationId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        await AsyncStorage.setItem('isLoggedIn', 'true');
        navigation.navigate('Home');
      } else {
        Alert.alert('OTP verification failed. Please try again.');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Network error occurred. Please try again later.'
      );
    }
  };

  const handleResendOtp = () => {
    setTimer(60);
    Alert.alert('Resend', 'OTP has been resent.');
    // Implement resend OTP logic here
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>You will get OTP via SMS to {phoneNumber}</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpBox}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              keyboardType="numeric"
              maxLength={1}
              ref={(ref) => (inputRefs.current[index] = ref)}
              accessibilityLabel={`OTP digit ${index + 1}`}
              accessibilityRole="text"
              placeholder="-"
               placeholderTextColor="black"
            />
          ))}
        </View>

        <Text style={styles.timerText}>
          {timer > 0 ? `Resend OTP in 00:${timer < 10 ? `0${timer}` : timer}` : 'OTP expired!'}
        </Text>

        {timer === 0 && (
          <TouchableOpacity onPress={handleResendOtp}>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.5,
    height: height * 0.2,
    resizeMode: 'contain',
  },
  formContainer: {
    height: height * 0.65,
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.02,
  },
  title: {
    fontSize: width * 0.05,
    marginBottom: height * 0.03,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.03,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    width: width * 0.15,
    height: height * 0.07,
    textAlign: 'center',
    fontSize: width * 0.05,
    color: 'black',
  },
  timerText: {
    fontSize: width * 0.045,
    color: '#333',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  resendLink: {
    color: '#007bff',
    textAlign: 'center',
    fontSize: width * 0.045,
  },
});

export default OTPVerificationScreen;