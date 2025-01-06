import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  ScrollView
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get('window');

const JodiScreen = ({ navigation }) => {
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [showAmountSuggestions, setShowAmountSuggestions] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [betType, setBetType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [betEntries, setBetEntries] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [session, setSession] = useState('Open');
  const [isOpenClosed, setIsOpenClosed] = useState(false);
  const [isCloseClosed, setIsCloseClosed] = useState(false);
  const amountSuggestions = ['100', '200', '500', '1000'];

  useEffect(() => {
    getStoredData();
  }, []);
  useEffect(() => {
    console.log("Current betType:", betType);
  }, [betType]);
  

  const getStoredData = async () => {
    try {
      setLoading(true);
      const storedData = JSON.parse(await AsyncStorage.getItem("userData"));
      
      if (!storedData?._id) {
        Alert.alert('Error', 'User data not found');
        navigation.goBack();
        return;
      }
  
      const [userResponse, marketDataString, betTypeString] = await Promise.all([
        axios.get(`https://sratebackend-1.onrender.com/user/${storedData._id}`),
        AsyncStorage.getItem('selectedMarket'),
        AsyncStorage.getItem('matkaBetType')
      ]);
  
      if (!marketDataString || !betTypeString) {
        Alert.alert('Error', 'Game data not found');
        navigation.goBack();
        return;
      }
  
      const marketData = JSON.parse(marketDataString);
  
      // Check if market results are declared
      if (marketData.aankdo_open !== 'XXX') {
        setIsOpenClosed(true);
      }
      if (marketData.aankdo_close !== 'XXX') {
        setIsCloseClosed(true);
      }
  
      setUserData(userResponse.data);
      setMarketData(marketData);
      setBetType(JSON.parse(betTypeString));
  
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load game data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getCombinationText = () => {
    if (!betType) return '';

    switch(betType.category) {
      case 'Jodi Digit':
        return 'Enter Jodi Number (00-99)';
      case 'Single Pana':
        return 'Single Patti (81 Combinations)';
      case 'Double pana':
        return 'Double Patti (81 Combinations)';
      default:
        return '';
    }
  };

  const handleNumberChange = (text) => {
    if (betType?.category === 'Jodi Digit') {
      // For Jodi, allow only 2 digits
      if (/^\d{0,2}$/.test(text)) {
        setNumber(text);
      }
    } else {
      // For pana types, allow 3 digits
      if (/^\d{0,3}$/.test(text)) {
        setNumber(text);
      }
    }
  };

  const handleAmountSuggestion = (amt) => {
    setAmount(amt);
    setShowAmountSuggestions(false);
  };

  const validateBet = () => {
    if (!number) {
      setErrorMessage('Please enter a number');
      return false;
    }
    if (!amount) {
      setErrorMessage('Please enter bet amount');
      return false;
    }
  
    // Check session for Panna types
    if ((betType?.category === 'Single Panna' || betType?.category === 'Double Panna') && !session) {
      setErrorMessage('Please select session (Open/Close)');
      return false;
    }
  
    // Validate number based on bet type
    if (betType?.category === 'Jodi Digit') {
      const jodiNum = parseInt(number);
      if (isNaN(jodiNum) || jodiNum < 0 || jodiNum > 99) {
        setErrorMessage('Please enter a valid number between 00-99');
        return false;
      }
    } else if (betType?.category === 'Single Panna' || betType?.category === 'Double Panna') {
      if (number.length !== 3 || !/^\d{3}$/.test(number)) {
        setErrorMessage('Please enter a valid 3-digit number');
        return false;
      }
    }
  
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum < 10) {
      setErrorMessage('Minimum bet amount is ₹10');
      return false;
    }
  
    if (amountNum > userData.wallet) {
      setErrorMessage('Insufficient wallet balance');
      return false;
    }
  
    return true;
  };
  const handleAdd = () => {
    // Check market status for Single Panna and Double Panna
    if ((betType?.category === 'Single Panna' || betType?.category === 'Double Panna')) {
      if (session === 'Open' && isOpenClosed) {
        Alert.alert('Market Closed', 'Open market result is already declared');
        return;
      }
      if (session === 'Close' && isCloseClosed) {
        Alert.alert('Market Closed', 'Close market result is already declared');
        return;
      }
    }
  
    if (!validateBet()) {
      return;
    }
  
    const formattedNumber = betType?.category === 'Jodi Digit' ? 
      number.padStart(2, '0') : 
      number.padStart(3, '0');
  
    const newEntry = {
      betAmount: amount,
      matkaBetType: betType,
      matkaBetNumber: formattedNumber,
      user: userData.username,
      market_id: marketData.market_name,
      betTime: (betType?.category === 'Single Panna' || betType?.category === 'Double Panna') ? session : null,
      status: "Pending"
    };
  
    setBetEntries([...betEntries, newEntry]);
    setNumber('');
    setAmount('');
    setErrorMessage('');
  };
  const placeBet = async () => {
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

      // Update user data
      const updatedBetDetails = [...(userData.betDetails || []), ...betEntries];
      const updatedWalletBalance = userData.wallet - totalBetAmount;

      const response = await axios.put(
        `https://sratebackend-1.onrender.com/user/${userData._id}`,
        {
          betDetails: updatedBetDetails,
          wallet: updatedWalletBalance
        }
      );

      if (response.data) {
        const updatedUserData = {
          ...userData,
          betDetails: updatedBetDetails,
          wallet: updatedWalletBalance
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

        Alert.alert(
          'Success',
          `Bets placed successfully!\nTotal amount: ₹${totalBetAmount}\nRemaining balance: ₹${updatedWalletBalance}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error placing bets:', error);
      Alert.alert('Error', 'Failed to place bets');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/ffffff/back.png" }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {marketData?.market_name} - {betType?.category}
        </Text>
        <View style={styles.walletContainer}>
          <Text style={styles.walletText}>₹{userData?.wallet || '0'}</Text>
        </View>
      </View>

    <ScrollView style={styles.content}>
  {/* Number Input */}
  {(betType?.category === 'Single Pana' || betType?.category === 'Double Pana') && (
  <View style={styles.buttonRow}>
    <TouchableOpacity
      style={[
        styles.sessionButton,
        session === 'Open' ? styles.openButton : styles.unselectedButton,
        isOpenClosed && styles.disabledButton,
      ]}
      onPress={() => !isOpenClosed && setSession('Open')}
      disabled={isOpenClosed}
    >
      <Text style={styles.buttonText}>
        Open {isOpenClosed ? '(Closed)' : ''}
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        styles.sessionButton,
        session === 'Close' ? styles.closeButton : styles.unselectedButton,
        isCloseClosed && styles.disabledButton,
      ]}
      onPress={() => !isCloseClosed && setSession('Close')}
      disabled={isCloseClosed}
    >
      <Text style={styles.buttonText}>
        Close {isCloseClosed ? '(Closed)' : ''}
      </Text>
    </TouchableOpacity>
  </View>
)}
  <View style={styles.card}>
    <Text style={styles.gameTypeText}>
      {getCombinationText()}
    </Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        value={number}
        onChangeText={handleNumberChange}
        keyboardType="numeric"
        maxLength={betType?.category === 'Jodi Digit' ? 2 : 3}
        placeholder={betType?.category === 'Jodi Digit' ? 
          'Enter number (00-99)' : 'Enter 3 digit number'}
        placeholderTextColor="#999"
      />
    </View>
  </View>

  {/* Amount Input */}
  <View style={styles.card}>
    <Text style={styles.label}>Enter Amount</Text>
    <View style={styles.inputWrapper}>
      <Text style={styles.rupeeSymbol}>₹</Text>
      <TextInput
        style={[styles.input, styles.amountInput]}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Enter amount"
        placeholderTextColor="#999"
        onFocus={() => setShowAmountSuggestions(true)}
      />
    </View>

    {showAmountSuggestions && (
      <View style={styles.suggestionsContainer}>
        {amountSuggestions.map((amt) => (
          <TouchableOpacity
            key={amt}
            style={styles.amountButton}
            onPress={() => handleAmountSuggestion(amt)}
          >
            <Text style={styles.amountButtonText}>₹{amt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    <TouchableOpacity 
      style={styles.addButton}
      onPress={handleAdd}
    >
      <Text style={styles.addButtonText}>Add Bet</Text>
    </TouchableOpacity>
  </View>

  {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

  {/* Bet List */}
  {betEntries.length > 0 && (
    <View style={styles.betListContainer}>
      <Text style={styles.betListTitle}>Added Bets</Text>
      {betEntries.map((bet, index) => (
     <View key={index} style={styles.betEntry}>
     <View>
       <Text style={styles.betNumber}>
         Number: {bet.matkaBetNumber}
         {bet.betTime && (betType?.category !== 'Jodi Digit') && ` (${bet.betTime})`}
       </Text>
       <Text style={styles.betAmount}>Amount: ₹{bet.betAmount}</Text>
     </View>
     <TouchableOpacity 
       onPress={() => {
         const updatedEntries = betEntries.filter((_, i) => i !== index);
         setBetEntries(updatedEntries);
       }}
       style={styles.deleteButton}
     >
       <Text style={styles.deleteText}>Delete</Text>
     </TouchableOpacity>
   </View>
      ))}
    </View>
  )}

  {betEntries.length > 0 && (
    <TouchableOpacity 
      style={styles.submitButton}
      onPress={() => setShowConfirmModal(true)}
      disabled={loading}
    >
      <Text style={styles.submitButtonText}>
        {loading ? 'Processing...' : 'Place Bet'}
      </Text>
    </TouchableOpacity>
  )}
</ScrollView>
      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Bets</Text>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Market:</Text>
                <Text style={styles.modalValue}>{marketData?.market_name}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Game:</Text>
                <Text style={styles.modalValue}>{betType?.category}</Text>
              </View>
              
              {betEntries.map((bet, index) => (
               <View key={index} style={styles.modalBetRow}>
               <Text style={styles.modalLabel}>
                 Bet {index + 1}: {bet.matkaBetNumber}
                 {bet.betTime && (betType?.category !== 'Jodi Digit') && ` (${bet.betTime})`}
               </Text>
               <Text style={styles.modalValue}>₹{bet.betAmount}</Text>
             </View>
              ))}

              <View style={[styles.modalRow, styles.totalRow]}>
                <Text style={[styles.modalLabel, styles.totalLabel]}>Total Amount:</Text>
                <Text style={[styles.modalValue, styles.totalValue]}>
                  ₹{betEntries.reduce((sum, bet) => sum + Number(bet.betAmount), 0)}
                </Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={placeBet}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Processing...' : 'Place Bet'}
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
    backgroundColor: '#f5f5f5',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 15,
    elevation: 4,
  },
  backButton: {
    marginRight: 15,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  walletContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  walletText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  gameTypeText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  rupeeSymbol: {
    paddingHorizontal: 12,
    fontSize: 18,
    color: '#666',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  amountButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  amountButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  betListContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    elevation: 2,
  },
  betListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  betEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  betNumber: {
    fontSize: 15,
    color: '#333',
  },
  betAmount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
    elevation: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: width * 0.9,
    elevation: 5,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  modalBody: {
    padding: 15,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  modalBetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalLabel: {
    fontSize: 15,
    color: '#666',
  },
  modalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  totalLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  modalButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  confirmButton: {
    backgroundColor: '#1a237e',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JodiScreen;