import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';

const MPinScreen = ({ navigation }) => {
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    checkUserData();
  }, []);

  const checkUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("userData");
      if (!storedData) {
        // No stored data, redirect to login
        navigation.replace("Login");
        return;
      }
      
      const user = JSON.parse(storedData);
      setUserData(user);
      
      // Verify if user session is valid
      const response = await axios.get(
        `https://sratebackend-1.onrender.com/user/${user._id}`
      );
      
      if (!response.data) {
        throw new Error("User session expired");
      }
    } catch (error) {
      console.error("Error checking user data:", error);
      await AsyncStorage.clear();
      navigation.replace("Login");
    } finally {
      setLoading(false);
    }
  };

  const validateMpin = async () => {
    if (!mpin || mpin.length !== 4) {
      Alert.alert("Error", "Please enter a valid 4-digit MPIN");
      return;
    }

    try {
      if (mpin === userData.mPin) {
        navigation.replace("Home");
      } else {
        Alert.alert("Error", "Invalid MPIN");
        setMpin("");
      }
    } catch (error) {
      console.error("Error validating MPIN:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace("Login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Enter MPIN</Text>
      </View>

      <View style={styles.content}>
        <Image
          source={{ uri: 'https://img.icons8.com/color/96/000000/lock.png' }}
          style={styles.lockIcon}
        />
        
        <Text style={styles.welcomeText}>
          Welcome back, {userData?.username}!
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter 4-digit MPIN"
             placeholderTextColor="gray"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry={!showPin}
            value={mpin}
            onChangeText={setMpin}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPin(!showPin)}
          >
            <Image
              source={{ 
                uri: showPin 
                  ? 'https://img.icons8.com/ios-filled/50/000000/visible.png'
                  : 'https://img.icons8.com/ios-filled/50/000000/hide.png'
              }}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={validateMpin}
        >
          <Text style={styles.submitButtonText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#000",
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
  },
  lockIcon: {
    width: 80,
    height: 80,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 30,
    color: "#333",
  },
  inputContainer: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,

  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: "#000",
  },
  submitButton: {
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 10,
  },
  logoutButtonText: {
    color: "red",
    fontSize: 16,
  }
});

export default MPinScreen;