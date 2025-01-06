import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, FlatList, ActivityIndicator, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

const SangamScreen = () => {
  const navigation = useNavigation(); // Get the navigation object
  const [currentTime, setCurrentTime] = useState(new Date());
  const [betEntries, setBetEntries] = useState([]);
  const [betAmounts, setBetAmounts] = useState({ openDigit: '', closePana: '', points: '' });
  const [userData, setUserData] = useState("");
  const [user, setUser] = useState("");
  const [matkaBetType, setMatkaBetType] = useState("");
  const [marketInfo, setMarketInfo] = useState({});
  const [market_id, setMarketId] = useState("");
  const [betTime, setBetTime] = useState("Open Digit, Close Panna"); // Default to first option
  const [loading, setLoading] = useState(true); // Initial loading state
  const [errorMessage, setErrorMessage] = useState(''); // Error message state
  const [dropdownVisible, setDropdownVisible] = useState(false); // Dropdown visibility state
  const dropdownAnimation = useState(new Animated.Value(0))[0]; // Animation for dropdown

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedData = JSON.parse(await AsyncStorage.getItem('userData'));
        const BetType = JSON.parse(await AsyncStorage.getItem('matkaBetType'));
        const market_id = JSON.parse(await AsyncStorage.getItem('selectedMarket'));

        const userResponse = await axios.get(`https://sratebackend-1.onrender.com/user/${storedData._id}`);
        const UserDetail = userResponse.data;

        setUserData(UserDetail);
        setUser(storedData.username);
        setMatkaBetType(BetType);
        setMarketId(market_id.market_name);
        setMarketInfo(market_id);
        setLoading(false); // Data fetched, stop loading
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Stop loading on error
      }
    };

    fetchData();

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAdd = () => {
    const { openDigit, closePana, points } = betAmounts;
    if (!openDigit || !closePana || !points) {
      setErrorMessage('Please fill all fields');
      return;
    }
    if (isNaN(openDigit) || isNaN(closePana) || isNaN(points) || parseInt(points) <= 0) {
      setErrorMessage('Please enter valid numeric values');
      return;
    }

    const newEntry = {
      betAmount: points,
      matkaBetType,
      matkaBetNumber: `${openDigit}-${closePana}`,
      user,
      market_id,
      betTime: betTime,
      status:"Pending"

    };

    setBetEntries([...betEntries, newEntry]);
    setBetAmounts({ openDigit: '', closePana: '', points: '' });
    setErrorMessage(''); // Clear error message after successful addition
  };

  const handleConfirm = async () => {
    if (betEntries.length === 0) {
      setErrorMessage('No bets to confirm. Please add a bet first.');
      return;
    }

    try {
      setLoading(true); // Start loading
      const updatedBetDetails = [...userData?.betDetails, ...betEntries];
      await axios.put(`https://sratebackend-1.onrender.com/user/${user}/betDetails`, { betDetails: updatedBetDetails });
      Alert.alert('Success', 'Bets confirmed successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }, // Navigate to Home on OK
      ]);
      setBetEntries([]);
      setErrorMessage('');
    } catch (error) {
      console.error('Error confirming bets:', error);
      setErrorMessage('Error confirming bets. Please try again.');
    } finally {
      setLoading(false); // Stop loading after confirmation
    }
  };

  const handleDeleteEntry = index => {
    const updatedEntries = betEntries.filter((_, i) => i !== index);
    setBetEntries(updatedEntries);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    Animated.timing(dropdownAnimation, {
      toValue: dropdownVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const selectBetTime = (value) => {
    setBetTime(value);
    setDropdownVisible(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{marketInfo.market_name}</Text>
        <Text style={styles.headerText}>{currentTime.toLocaleTimeString()}</Text>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {matkaBetType?.id == 6 && (
        <View style={styles.dropdownContainer}>
          <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
            <Text style={styles.dropdownButtonText}>{betTime}</Text>
          </TouchableOpacity>
          {dropdownVisible && (
            <Animated.View style={[styles.dropdownMenu, { opacity: dropdownAnimation }]}>
              <TouchableOpacity onPress={() => selectBetTime('Open Digit, Close Panna')}>
                <Text style={styles.dropdownItem}>Open Digit, Close Panna</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => selectBetTime('Close Digit, Open Panna')}>
                <Text style={styles.dropdownItem}>Close Digit, Open Panna</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      )}

      <View style={styles.grid}>
        <TextInput
          style={styles.input}
          placeholder='Enter  Digit (0-9)'
          value={betAmounts.openDigit}
          onChangeText={text => setBetAmounts({ ...betAmounts, openDigit: text })}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder='Enter  Pana (000-999)'
          value={betAmounts.closePana}
          onChangeText={text => setBetAmounts({ ...betAmounts, closePana: text })}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder='Enter Amount (e.g., 100)'
          value={betAmounts.points}
          onChangeText={text => setBetAmounts({ ...betAmounts, points: text })}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>ADD</Text>
        </TouchableOpacity>
      </View>
<View>
      <FlatList
        data={betEntries}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.betEntry}>
            <Text style={styles.betText}>
              {item.matkaBetNumber} - {item.betAmount} Rs
            </Text>
            <TouchableOpacity onPress={() => handleDeleteEntry(index)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginTop: 5,
    padding: 5,
    elevation: 5, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  dropdownItem: {
    padding: 10,
    fontSize: 16,
    color: '#000',
  },
  betEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  betText: {
    fontSize: 16,
  },
  deleteText: {
    color: 'red',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    height: 40,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#000',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  confirmButton: {
    backgroundColor: '#1A237E',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default SangamScreen;