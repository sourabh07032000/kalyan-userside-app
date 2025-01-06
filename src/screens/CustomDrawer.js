import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, DevSettings } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const CustomDrawer = ({ navigation }) => {
  const [userData, setUserData] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const storedData = JSON.parse(await AsyncStorage.getItem('userData'));
      setUserData(storedData);
    };

    fetchData();
  }, []); // Add an empty dependency array to run only once

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('userData'); // Optionally clear user data
      // DevSettings.reload()
      navigation.reset({
        index: 0,
        routes: [{ name: 'Intro' }], // Reset navigation stack
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://img.icons8.com/color/96/000000/user.png' }} // Dummy user image
          style={styles.profileImage}
        />
        <Text style={styles.name}>{userData?.username}</Text>
        <Text style={styles.phone}>+91-{userData?.mobileNumber}</Text>
        <View style={styles.statusContainer}>
          <TouchableOpacity style={styles.statusButton}>
            <Text style={styles.statusText}>Account Active</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cross Icon for Home Navigation */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Home')}>
        <Image source={{ uri: 'https://img.icons8.com/color/48/000000/close-window.png' }} style={styles.closeIcon} />
      </TouchableOpacity>

      {/* Scrollable Menu Section */}
      <ScrollView contentContainerStyle={styles.menuSection}>
        {drawerMenuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.route)}
          >
            <Image source={{ uri: item.iconUri }} style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer Section */}
      <View style={styles.footerSection}>
        <TouchableOpacity style={styles.footerItem}>
          <Image source={{ uri: 'https://img.icons8.com/color/48/000000/star.png' }} style={styles.footerIcon} />
          <Text style={styles.footerText}>Rate Us</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={handleLogout}>
          <Image source={{ uri: 'https://img.icons8.com/color/48/000000/shutdown.png' }} style={styles.footerIcon} />
          <Text style={styles.footerText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// List of drawer menu items with colorful icons
const drawerMenuItems = [
  { label: 'Edit Profile', route: 'EditProfile', iconUri: 'https://img.icons8.com/color/48/000000/user.png' },
  { label: 'Add Funds', route: 'AddFund', iconUri: 'https://img.icons8.com/color/48/000000/money.png' },
  { label: 'Withdrawal Funds', route: 'Withdrawal', iconUri: 'https://img.icons8.com/color/48/000000/cash-in-hand.png' },
  { label: 'Wallet Statement', route: 'WalletStatement', iconUri: 'https://img.icons8.com/color/48/000000/wallet.png' },
  { label: 'Bid History', route: 'BidHistory', iconUri: 'https://img.icons8.com/color/48/000000/time-machine.png' },
  { label: 'Bid Win History', route: 'BidWinHistory', iconUri: 'https://img.icons8.com/color/48/000000/trophy.png' },
  { label: 'Game Rates', route: 'GameRates', iconUri: 'https://img.icons8.com/color/48/000000/price-tag.png' },
  // { label: 'Change Password', route: 'ChangePassword', iconUri: 'https://img.icons8.com/color/48/000000/password.png' },
  { label: 'Settings', route: 'Settings', iconUri: 'https://img.icons8.com/color/48/000000/settings.png' },
  { label: 'Support', route: 'Support', iconUri: 'https://img.icons8.com/color/48/000000/help.png' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
    // backgroundColor: 'linear-gradient(180deg, #1a237e 0%, #ff9800 100%)',

  },
   profileSection: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)', // Subtle border
    paddingBottom: 20,
    marginTop: 5,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  name: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  phone: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 4,
  },
 
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 15,
  },
  statusButton: {
    backgroundColor: '#2e2e2e', // Darker shade for button
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#404040',
  },
  statusText: {
    color: '#00ff00', // Green for active status
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  closeIcon: {
    width: 28,
    height: 28,
   
  },
  menuSection: {
    marginTop: 20,
    paddingBottom: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e', // Slightly lighter than background
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
    marginHorizontal: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#2e2e2e',
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  menuText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginTop: 'auto', // Push to bottom
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2e2e2e',
  },
  footerIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
   
  },
  footerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CustomDrawer;