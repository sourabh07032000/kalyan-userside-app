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
  // States
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [showAmountSuggestions, setShowAmountSuggestions] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [betType, setBetType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const amountSuggestions = ['100', '200', '500', '1000'];

  useEffect(() => {
    getStoredData();
  }, []);

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

      setUserData(userResponse.data);
      setMarketData(JSON.parse(marketDataString));
      setBetType(JSON.parse(betTypeString));

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load game data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleNumberChange = (text) => {
    // Only allow numbers and maximum 2 digits
    if (/^\d{0,2}$/.test(text)) {
      setNumber(text);
    }
  };

  const handleAmountSuggestion = (amt) => {
    setAmount(amt);
    setShowAmountSuggestions(false);
  };

  const validateBet = () => {
    if (!number) {
      Alert.alert('Error', 'Please enter a number');
      return false;
    }
    if (!amount) {
      Alert.alert('Error', 'Please enter bet amount');
      return false;
    }

    const num = parseInt(number);
    if (isNaN(num) || num < 0 || num > 99) {
      Alert.alert('Error', 'Please enter a valid number between 00-99');
      return false;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum < 10) {
      Alert.alert('Error', 'Minimum bet amount is ₹10');
      return false;
    }

    if (amountNum > userData.wallet) {
      Alert.alert('Error', 'Insufficient wallet balance');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateBet()) {
      setShowConfirmModal(true);
    }
  };

  const placeBet = async () => {
    try {
      setLoading(true);

      // Format jodi number to always be 2 digits
      const formattedNumber = number.padStart(2, '0');

      // Create new bet entry
      const newBet = {
        betAmount: amount,
        matkaBetType: betType,
        matkaBetNumber: formattedNumber,
        user: userData.username,
        market_id: marketData.market_name,
        status: "Pending"
      };

      // Calculate new wallet balance
      const newWalletBalance = Number(userData.wallet) - Number(amount);

      // Update user data
      const updatePayload = {
        betDetails: [...(userData.betDetails || []), newBet],
        wallet: newWalletBalance
      };

      const response = await axios.put(
        `https://sratebackend-1.onrender.com/user/${userData._id}`,
        updatePayload
      );

      if (response.data) {
        const updatedUserData = {
          ...userData,
          betDetails: [...(userData.betDetails || []), newBet],
          wallet: newWalletBalance
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

        Alert.alert(
          'Success', 
          `Bet placed successfully!\nAmount: ₹${amount}\nRemaining balance: ₹${newWalletBalance}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      Alert.alert('Error', 'Failed to place bet');
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
        <View style={styles.card}>
          <Text style={styles.label}>Enter Jodi Number (00-99)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={number}
              onChangeText={handleNumberChange}
              keyboardType="numeric"
              maxLength={2}
              placeholder="Enter number"
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
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Processing...' : 'Place Bet'}
          </Text>
        </TouchableOpacity>
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
              <Text style={styles.modalTitle}>Confirm Bet</Text>
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
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Number:</Text>
                <Text style={styles.modalValue}>{number.padStart(2, '0')}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Amount:</Text>
                <Text style={styles.modalValue}>₹{amount}</Text>
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
                  {loading ? 'Processing...' : 'Confirm Bet'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 5,
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
    textAlign: 'center',
    marginHorizontal: 10,
  },
  walletContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  walletText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  rupeeSymbol: {
    paddingHorizontal: 12,
    fontSize: 18,
    color: '#666',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  amountInput: {
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    gap: 10,
  },
  amountButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  amountButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.85,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  modalLabel: {
    fontSize: 16,
    color: '#666',
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
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
    justifyContent: 'center',
  },
  cancelButton: {
    borderRightWidth: 0.5,
    borderRightColor: '#eee',
  },
  confirmButton: {
    borderLeftWidth: 0.5,
    borderLeftColor: '#eee',
    backgroundColor: '#000',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default JodiScreen;