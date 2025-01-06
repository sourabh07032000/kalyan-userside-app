import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const GameScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [betEntries, setBetEntries] = useState([]);
  const [betAmounts, setBetAmounts] = useState({});
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState('');
  const [matkaBetType, setMatkaBetType] = useState('');
  const [marketInfo, setMarketInfo] = useState('');
  const [market_id, setMarketId] = useState('');
  const [betTime, setBetTime] = useState('Open');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stored data from AsyncStorage
        const storedData = JSON.parse(await AsyncStorage.getItem('userData'));
        const matkaBetType = JSON.parse(await AsyncStorage.getItem('matkaBetType'));
        const market_id = JSON.parse(await AsyncStorage.getItem('selectedMarket'));

        // Fetch latest user data from backend
        const userResponse = await axios.get(
          `https://sratebackend-1.onrender.com/user/${storedData._id}`
        );
        const UserDetail = userResponse.data;

        // Update state
        setUserData(UserDetail);
        setUser(storedData.username);
        setMatkaBetType(matkaBetType);
        setMarketId(market_id.market_id);
        setMarketInfo(market_id);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    fetchData();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAdd = number => {
    const betAmount = betAmounts[number];
    
    // Validation checks
    if (!betAmount) {
      setErrorMessage('Please enter a bet amount.');
      return;
    }
    if (!matkaBetType) {
      setErrorMessage('Please select a bet type.');
      return;
    }

    const parsedAmount = parseFloat(betAmount);
    
    // Additional validation
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    // Check wallet balance
    if (parsedAmount > userData.wallet) {
      setErrorMessage('Insufficient wallet balance');
      return;
    }

    const newEntry = {
      betAmount: betAmount.toString(), // Convert to string
      matkaBetType: {
        id: matkaBetType.id,
        category: matkaBetType.category,
        description: matkaBetType.description,
        multiplier: matkaBetType.multiplier,
        icon: matkaBetType.icon
      },
      matkaBetNumber: number,
      user: user,
      market_id: marketInfo.market_name,
      betTime: betTime,
      status: "Pending"
    };

    setBetEntries([...betEntries, newEntry]);
    setBetAmounts({ ...betAmounts, [number]: '' });
    setErrorMessage('');
  };

  const handleConfirm = async () => {
    // Validate bet entries
    if (betEntries.length === 0) {
      setErrorMessage('No bets to confirm. Please add a bet first.');
      return;
    }

    // Calculate total bet amount
    const totalBetAmount = betEntries.reduce((total, entry) => total + parseFloat(entry.betAmount), 0);

    // Validate wallet balance
    if (totalBetAmount > userData.wallet) {
      setErrorMessage('Insufficient wallet balance');
      return;
    }

    try {
      setLoading(true);

      // Prepare updated bet details
      const updatedBetDetails = [...(userData.betDetails || []), ...betEntries];
      
      // Calculate new wallet balance
      const updatedWalletBalance = userData.wallet - totalBetAmount;

      // Prepare update payload
      const updatePayload = {
        betDetails: updatedBetDetails,
        wallet: updatedWalletBalance
      };

      // Make API call to update user
      const response = await axios.put(
        `https://sratebackend-1.onrender.com/user/${userData._id}`,
        updatePayload
      );

      // Update local storage
      const updatedUserData = {
        ...userData,
        betDetails: updatedBetDetails,
        wallet: updatedWalletBalance
      };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

      // Update local state
      setUserData(updatedUserData);

      // Show success alert
      Alert.alert(
        'Bets Confirmed', 
        `Total bet amount: ${totalBetAmount} Rs\nRemaining balance: ${updatedWalletBalance} Rs`
      );

      // Reset and navigate
      setBetEntries([]);
      setErrorMessage('');
      navigation.navigate('Home');

    } catch (error) {
      console.error('Confirmation Error:', error);
      
      // Detailed error handling
      if (error.response) {
        Alert.alert(
          'Error', 
          error.response.data.message || 'Failed to confirm bets'
        );
      } else if (error.request) {
        Alert.alert(
          'Network Error', 
          'No response from server. Please check your internet connection.'
        );
      } else {
        Alert.alert(
          'Error', 
          'An unexpected error occurred. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = index => {
    const updatedEntries = betEntries.filter((_, i) => i !== index);
    setBetEntries(updatedEntries);
  };

  // Loading indicator
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
        <Text style={styles.headerText}>{marketInfo?.market_name}</Text>
        <Text style={styles.headerText}>
          {currentTime.toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            betTime === 'Open' ? styles.selectedButton : styles.unselectedButton,
          ]}
          onPress={() => setBetTime('Open')}>
          <Text style={styles.buttonText}>Open</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            betTime === 'Close' ? styles.selectedButton : styles.unselectedButton,
          ]}
          onPress={() => setBetTime('Close')}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {[...Array(10).keys()].map(num => {
          const tripleNum = matkaBetType.id == 1 ? String(num).repeat(1) : String(num).repeat(3);

          return (
            <View key={num} style={styles.gridItem}>
              <Text style={styles.gridText}>{tripleNum}</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => setBetAmounts({ ...betAmounts, [tripleNum]: text })}
                value={betAmounts[tripleNum] || ''}
                keyboardType="numeric"
              />
              <TouchableOpacity
                onPress={() => handleAdd(tripleNum)}
                style={styles.addButton}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <View style={styles.betListContainer}>
        <FlatList
          data={betEntries}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.betEntry}>
              <Text style={styles.betText}>
                {item.betTime} - {item.matkaBetNumber} - {item.betAmount} Rs
                {'\n'}
                <Text style={styles.betTypeText}>
                  {item.matkaBetType.category} - {item.matkaBetType.description}
                </Text>
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  unselectedButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
    height: 50,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
  },
  gridText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    backgroundColor: 'white',
    width: '50%',
    height: 40,
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  addButton: {
    backgroundColor: '#000',
    padding: 5,
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#000',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default GameScreen;