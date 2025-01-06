import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get('window');

const GameScreen = ({ navigation }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [betEntries, setBetEntries] = useState([]);
  const [betAmounts, setBetAmounts] = useState({});
  const [userData, setUserData] = useState(null);
  const [marketInfo, setMarketInfo] = useState(null);
  const [matkaBetType, setMatkaBetType] = useState(null);
  const [session, setSession] = useState('Open');
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOpenClosed, setIsOpenClosed] = useState(false);
const [isCloseClosed, setIsCloseClosed] = useState(false);

  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    fetchUserData();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

// Update fetchUserData function
const fetchUserData = async () => {
  try {
    const storedData = JSON.parse(await AsyncStorage.getItem('userData'));
    const marketData = JSON.parse(await AsyncStorage.getItem('selectedMarket'));
    const betType = JSON.parse(await AsyncStorage.getItem('matkaBetType'));

    if (!storedData?._id) {
      Alert.alert('Error', 'User data not found');
      navigation.goBack();
      return;
    }

    // Get fresh user data
    const userResponse = await axios.get(
      `https://sratebackend-1.onrender.com/user/${storedData._id}`
    );

    // Check if market results are declared
    if (marketData.aankdo_open !== 'XXX') {
      setIsOpenClosed(true);
    }
    if (marketData.aankdo_close !== 'XXX') {
      setIsCloseClosed(true);
    }

    setUserData(userResponse.data);
    setMarketInfo(marketData);
    setMatkaBetType(betType);
  } catch (error) {
    console.error('Error fetching data:', error);
    Alert.alert('Error', 'Failed to load game data');
  } finally {
    setLoading(false);
  }
};

// Update handleAdd function
const handleAdd = (number) => {
  // Check if market is closed for the selected session
  if (session === 'Open' && isOpenClosed) {
    Alert.alert('Market Closed', 'Open market result is already declared');
    return;
  }
  if (session === 'Close' && isCloseClosed) {
    Alert.alert('Market Closed', 'Close market result is already declared');
    return;
  }

  const betAmount = betAmounts[number];
  
  if (!validateBet(number, betAmount)) {
    return;
  }

  const newEntry = {
    betAmount: betAmount.toString(),
    matkaBetType: {
      id: matkaBetType.id,
      category: matkaBetType.category,
      description: matkaBetType.description,
      multiplier: matkaBetType.multiplier,
      icon: matkaBetType.icon
    },
    matkaBetNumber: number,
    user: userData.username,
    market_id: marketInfo.market_name,
    betTime: session,
    status: "Pending"
  };

  setBetEntries([...betEntries, newEntry]);
  setBetAmounts({ ...betAmounts, [number]: '' });
  setErrorMessage('');
};

  const validateBet = (number, amount) => {
    if (!amount) {
      setErrorMessage('Please enter a bet amount');
      return false;
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid amount');
      return false;
    }

    if (parsedAmount < 10) {
      setErrorMessage('Minimum bet amount is ₹10');
      return false;
    }

    if (parsedAmount > userData.wallet) {
      setErrorMessage('Insufficient wallet balance');
      return false;
    }

    return true;
  };


   const handleConfirm = async () => {
    try {
      if (betEntries.length === 0) {
        Alert.alert('Error', 'Please add at least one bet');
        return;
      }

      setLoading(true);
      const totalBetAmount = betEntries.reduce(
        (total, entry) => total + parseFloat(entry.betAmount),
        0
      );

      if (totalBetAmount > userData.wallet) {
        Alert.alert('Error', 'Insufficient wallet balance');
        return;
      }

      // Prepare updated bet details
      const updatedBetDetails = [...(userData.betDetails || []), ...betEntries];
      const updatedWalletBalance = userData.wallet - totalBetAmount;

      // Update user data
      const response = await axios.put(
        `https://sratebackend-1.onrender.com/user/${userData._id}`,
        {
          betDetails: updatedBetDetails,
          wallet: updatedWalletBalance
        }
      );

      if (response.data) {
        // Update local storage
        const updatedUserData = {
          ...userData,
          betDetails: updatedBetDetails,
          wallet: updatedWalletBalance
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

        Alert.alert(
          'Success',
          `Bets placed successfully!\nTotal amount: ₹${totalBetAmount}\nRemaining balance: ₹${updatedWalletBalance}`
        );

        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error placing bets:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to place bets');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleDeleteEntry = index => {
    const updatedEntries = betEntries.filter((_, i) => i !== index);
    setBetEntries(updatedEntries);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.header}>
  <TouchableOpacity 
    onPress={() => navigation.goBack()} 
    style={styles.backButton}
  >
    <Text style={styles.backButtonText}>←</Text>
  </TouchableOpacity>
  <Text style={styles.headerText}>
    {marketInfo?.market_name} - {matkaBetType?.category}
  </Text>
  <Text style={styles.headerText}>
    Balance: ₹{userData?.wallet || 0}
  </Text>
</View>

      <View style={styles.buttonRow}>
  <TouchableOpacity
    style={[
      styles.sessionButton,
      session === 'Open' ? styles.openButton : styles.unselectedButton,
    ]}
    onPress={() => setSession('Open')}>
    <Text style={styles.buttonText}>Open</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[
      styles.sessionButton,
      session === 'Close' ? styles.closeButton : styles.unselectedButton,
    ]}
    onPress={() => setSession('Close')}>
    <Text style={styles.buttonText}>Close</Text>
  </TouchableOpacity>
</View>

<View style={styles.grid}>
  {[...Array(10).keys()].map(num => {
    const displayNum = matkaBetType.id === 1 ? 
      String(num) : 
      String(num).repeat(3);

    return (
      <View key={num} style={styles.gridItemContainer}>
        <View style={styles.gridItem}>
          <Text style={styles.gridText}>{displayNum}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              onChangeText={text => setBetAmounts({ ...betAmounts, [displayNum]: text })}
              value={betAmounts[displayNum] || ''}
              keyboardType="numeric"
              placeholder="₹"
              placeholderTextColor="#999"
              onFocus={() => setFocusedInput(displayNum)}
            />
            {focusedInput === displayNum && (
              <View style={styles.suggestionsBox}>
                <TouchableOpacity 
                  style={styles.suggestionItem}
                  onPress={() => {
                    setBetAmounts({ ...betAmounts, [displayNum]: '100' });
                    setFocusedInput(null);
                  }}
                >
                  <Text style={styles.suggestionText}>₹100</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionItem}
                  onPress={() => {
                    setBetAmounts({ ...betAmounts, [displayNum]: '500' });
                    setFocusedInput(null);
                  }}
                >
                  <Text style={styles.suggestionText}>₹500</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionItem}
                  onPress={() => {
                    setBetAmounts({ ...betAmounts, [displayNum]: '1000' });
                    setFocusedInput(null);
                  }}
                >
                  <Text style={styles.suggestionText}>₹1000</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => handleAdd(displayNum)}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
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
                {item.betTime} - {item.matkaBetNumber} - ₹{item.betAmount}
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

      {betEntries.length > 0 && (
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={() => setShowConfirmModal(true)}
        >
          <Text style={styles.confirmButtonText}>Confirm Bets</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Bets</Text>
            
            {betEntries.map((bet, index) => (
              <View key={index} style={styles.modalRow}>
                <Text style={styles.modalLabel}>
                  {bet.betTime} - {bet.matkaBetNumber}
                </Text>
                <Text style={styles.modalValue}>₹{bet.betAmount}</Text>
              </View>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirm}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Processing...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000', // Dark blue-gray
    paddingVertical: 12,
    paddingHorizontal: 15,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  walletText: {
    color: '#2ecc71', // Green for balance
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  sessionButton: {
    width: '49%',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  openButton: {
    backgroundColor: '#27ae60', // Softer green
  },
  closeButton: {
    backgroundColor: '#e74c3c', // Softer red
  },
  unselectedButton: {
    backgroundColor: '#bdc3c7', // Soft gray
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  gridItemContainer: {
    width: '48%',
    marginBottom: 10,
    position: 'relative',
  },
  gridItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  gridText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    width: 35,
    textAlign: 'center',
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 5,
    position: 'relative',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  suggestionsBox: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 5,
    marginTop: 5,
    zIndex: 1000,
  },
  suggestionItem: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    width: '32%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suggestionText: {
    color: '#333',
    fontSize: 13,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  betListContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 8,
    elevation: 2,
  },
  betEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  betText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  betTypeText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  deleteText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
    padding: 5,
  },
  confirmButton: {
    backgroundColor: '#27ae60',
    margin: 8,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    elevation: 3,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: width * 0.85,
    padding: 15,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalLabel: {
    fontSize: 14,
    color: '#2c3e50',
  },
  modalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default GameScreen;