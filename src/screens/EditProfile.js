import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfile = ({navigation}) => {
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState('');
  const [mPin, setMPin] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMPin, setShowMPin] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const storedData = JSON.parse(await AsyncStorage.getItem("userData"));
      if (storedData && storedData._id) {
        const response = await axios.get(
          `https://sratebackend-1.onrender.com/user/${storedData._id}`
        );
        setUserData(response.data);
        setUsername(response.data.username);
        setMPin(response.data.mPin);
        setMobileNumber(response.data.mobileNumber);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!username.trim() || !mPin.trim()) {
      Alert.alert("Error", "Username and MPIN cannot be empty");
      return;
    }

    if (mPin.length !== 4) {
      Alert.alert("Error", "MPIN must be 4 digits");
      return;
    }

    setLoading(true);
    try {
      if (!userData?._id) return;

      const response = await axios.put(
        `https://sratebackend-1.onrender.com/user/${userData._id}`,
        {
          ...userData,
          username,
          mPin
        }
      );

      if (response.data) {
        Alert.alert("Success", "Profile updated successfully");
        await AsyncStorage.setItem("userData", JSON.stringify(response.data.user));
        setIsEditing(false);
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate("CustomDrawer")}
        >
          <Image
            source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/back.png' }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: 'https://img.icons8.com/color/96/000000/user.png' }}
          style={styles.avatar}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>User Name</Text>
          {/* <TouchableOpacity 
            onPress={() => setIsEditing(true)}
            style={styles.pencilIcon}
          >
            <Image
              source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/pencil.png' }}
              style={styles.editIcon}
            />
          </TouchableOpacity> */}
        </View>
        <TextInput
          style={[styles.input, !isEditing && styles.disabledInput]}
          value={username}
          onChangeText={setUsername}
          editable={isEditing}
          placeholder="Enter your username"
           placeholderTextColor="gray"
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>M Pin</Text>
          <View style={styles.iconContainer}>
            {isEditing && (
              <TouchableOpacity 
                onPress={() => setShowMPin(!showMPin)}
                style={styles.eyeIcon}
              >
                <Image
                  source={{ 
                    uri: showMPin 
                      ? 'https://img.icons8.com/ios-filled/50/000000/visible.png'
                      : 'https://img.icons8.com/ios-filled/50/000000/hide.png'
                  }}
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={() => setIsEditing(true)}
              style={styles.pencilIcon}
            >
              <Image
                source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/pencil.png' }}
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <TextInput
          style={[styles.input, !isEditing && styles.disabledInput]}
          value={mPin}
          onChangeText={setMPin}
          editable={isEditing}
          secureTextEntry={!showMPin}
          placeholder="Enter your Mpin"
          keyboardType="numeric"
          maxLength={4}
           placeholderTextColor="gray"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={mobileNumber}
          editable={false}
          placeholder="Enter your mobile number"
        />
      </View>

      {isEditing && (
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  backButton: {
    width: 24,
    padding: 5,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    fontWeight: "500"
  },
  placeholder: {
    width: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    elevation: 5,
  },
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    paddingRight: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 5,
    fontStyle: "italic"
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#F9F9F9',
  },
  disabledInput: {
    backgroundColor: '#EFEFEF',
    color: '#666',
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
  },
  eyeIcon: {
    padding: 5,
    marginRight: 10,
  },
  pencilIcon: {
    padding: 5,
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    opacity: "loading" ? 0.7 : 1,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: "bold"
  },
});

export default EditProfile;