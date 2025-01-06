import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const WithdrawFundsScreen = ({ navigation }) => {
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New states for bank details
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankDetailsSubmitted, setBankDetailsSubmitted] = useState(false);
  const [bankDetailsApproved, setBankDetailsApproved] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedData = JSON.parse(await AsyncStorage.getItem('userData'));
        if (!storedData) {
          setLoading(false);
          return;
        }
  
        const response = await axios.get(`https://sratebackend-1.onrender.com/user/${storedData._id}`);
        const user = response.data;
  
        console.log('Fetched user data:', user); // Debug log
  
        setUserData(user);
  
        // Check bank details
        if (user.bankDetails && user.bankDetails.accountNumber) {
          console.log('Bank details found:', user.bankDetails); // Debug log
          setBankDetailsSubmitted(true);
          setBankDetailsApproved(user.bankDetails.isApproved || false);
          
          // Set bank details
          setAccountNumber(user.bankDetails.accountNumber);
          setIfscCode(user.bankDetails.ifscCode);
          setAccountHolderName(user.bankDetails.accountHolderName);
          setUpiId(user.bankDetails.upiId);
        } else {
          console.log('No bank details found'); // Debug log
          setBankDetailsSubmitted(false);
          setBankDetailsApproved(false);
        }
  
        // Check pending withdrawals
        const pendingWithdrawal = user.withdrawalRequest?.find(req => req.status === 'Pending');
        setIsPending(!!pendingWithdrawal);
  
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);
  const handleBankDetailsSubmit = async () => {
    try {
      // Validate account number
      if (!validateAccountNumber(accountNumber)) {
        Alert.alert('Error', 'Please enter a valid account number (9-18 digits)');
        return;
      }
  
      // Validate account number confirmation
      if (accountNumber !== confirmAccountNumber) {
        Alert.alert('Error', 'Account numbers do not match');
        return;
      }
  
      // Validate IFSC
      if (!validateIFSC(ifscCode)) {
        Alert.alert('Error', 'Please enter a valid IFSC code');
        return;
      }
  
      // Validate name
      if (!validateName(accountHolderName)) {
        Alert.alert('Error', 'Please enter a valid account holder name');
        return;
      }
  
      // Validate UPI
      if (!validateUPI(upiId)) {
        Alert.alert('Error', 'Please enter a valid UPI ID');
        return;
      }
  
      const bankDetailsData = {
        bankDetails: {
          accountNumber,
          ifscCode,
          accountHolderName,
          upiId,
          isApproved: false,
          submittedAt: new Date().toISOString()
        }
      };
  
      console.log('Sending bank details:', bankDetailsData);
  
      const response = await axios.put(
        `https://sratebackend-1.onrender.com/user/${userData._id}`,
        bankDetailsData
      );
  
      if (response.data) {
        // Update local storage with new user data
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
        
        // Update state
        setUserData(response.data);
        setBankDetailsSubmitted(true);
        setBankDetailsApproved(false);
  
        Alert.alert(
          'Success', 
          'Bank details submitted successfully. Please wait for approval.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh the screen data
                fetchUserData();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Submit Error:', error);
      Alert.alert(
        'Error',
        'Failed to submit bank details. Please try again.'
      );
    }
  };
  
  // Add this function to handle data refresh
  const fetchUserData = async () => {
    try {
      const storedData = JSON.parse(await AsyncStorage.getItem('userData'));
      if (!storedData) {
        setLoading(false);
        return;
      }
  
      const response = await axios.get(`https://sratebackend-1.onrender.com/user/${storedData._id}`);
      const user = response.data;
  
      console.log('Fetched user data:', user);
  
      setUserData(user);
  
      if (user.bankDetails && user.bankDetails.accountNumber) {
        console.log('Bank details found:', user.bankDetails);
        setBankDetailsSubmitted(true);
        setBankDetailsApproved(user.bankDetails.isApproved || false);
        
        setAccountNumber(user.bankDetails.accountNumber);
        setIfscCode(user.bankDetails.ifscCode);
        setAccountHolderName(user.bankDetails.accountHolderName);
        setUpiId(user.bankDetails.upiId);
      } else {
        console.log('No bank details found');
        setBankDetailsSubmitted(false);
        setBankDetailsApproved(false);
      }
  
      const pendingWithdrawal = user.withdrawalRequest?.find(req => req.status === 'Pending');
      setIsPending(!!pendingWithdrawal);
  
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };
  
  // Move validation functions outside the component
  const validateAccountNumber = (number) => {
    return /^\d{9,18}$/.test(number);
  };
  
  const validateIFSC = (code) => {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(code);
  };
  
  const validateUPI = (id) => {
    return /^[\w\.\-_]{3,}@[a-zA-Z]{3,}$/.test(id);
  };
  
  const validateName = (name) => {
    return /^[a-zA-Z\s]{3,50}$/.test(name);
  };

  const handleWithdrawal = async () => {
    if (!withdrawalAmount) {
      Alert.alert('Error', 'Please enter amount');
      return;
    }

    const amount = parseFloat(withdrawalAmount);
    if (amount < 100 || amount > 100000) {
      Alert.alert('Error', 'Amount must be between ₹1,000 and ₹1,00,000');
      return;
    }

    if (amount > userData.wallet) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    try {
      const newWithdrawalRequest = {
        amount: withdrawalAmount,
        status: 'Pending',
        requestTime: new Date(),
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        accountHolderName: accountHolderName,
        upiId: upiId,
        username: userData.username,
      };

      await axios.put(
        `https://sratebackend-1.onrender.com/user/${userData._id}/withdrawalRequest`,
        { withdrawalRequest: [...userData.withdrawalRequest, newWithdrawalRequest] }
      );

      Alert.alert('Success', 'Withdrawal request submitted successfully');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to submit withdrawal request');
    }
  };
// Add these validation functions at the top



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
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/ffffff/back.png" }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdrawal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.walletContainer}>
          <Text style={styles.walletText}>Available Balance: ₹{userData?.wallet || 0}</Text>
        </View>

        {!bankDetailsSubmitted ? (
          // First time user - Show bank details form
          <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Enter Bank Details</Text>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              Account Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Account Number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              maxLength={18}
            />
          </View>
        
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              Confirm Account Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter Account Number"
              value={confirmAccountNumber}
              onChangeText={setConfirmAccountNumber}
              keyboardType="numeric"
              maxLength={18}
            />
          </View>
        
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              IFSC Code <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter IFSC Code"
              value={ifscCode}
              onChangeText={text => setIfscCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={11}
            />
          </View>
        
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              Account Holder Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Account Holder Name"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
              autoCapitalize="words"
            />
          </View>
        
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
              UPI ID <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter UPI ID"
              value={upiId}
              onChangeText={setUpiId}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleBankDetailsSubmit}
          >
            <Text style={styles.buttonText}>Submit Bank Details</Text>
          </TouchableOpacity>
        </View>
        ) : !bankDetailsApproved ? (
          // Bank details submitted but not approved
          <View style={styles.pendingContainer}>
            <Text style={styles.pendingText}>
              Your bank details are under verification.
              Please wait for approval.
            </Text>
          </View>
        ) : (
          // Bank details approved - Show withdrawal form
          <View style={styles.withdrawalContainer}>
            <View style={styles.bankDetailsDisplay}>
              <Text style={styles.detailsText}>Account: XXXXXXXX{accountNumber.slice(-4)}</Text>
              <Text style={styles.detailsText}>IFSC: {ifscCode}</Text>
              <Text style={styles.detailsText}>Name: {accountHolderName}</Text>
              <Text style={styles.detailsText}>UPI: {upiId}</Text>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Enter Amount"
              value={withdrawalAmount}
              onChangeText={setWithdrawalAmount}
              keyboardType="numeric"
            />
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleWithdrawal}
              disabled={isPending}
            >
              <Text style={styles.buttonText}>
                {isPending ? 'Withdrawal Pending' : 'Withdraw'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Add these new styles
const styles = StyleSheet.create({
  // ... (previous styles remain the same)
  formContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputWrapper: {
    marginBottom: 20,
    width: '100%',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  bankDetailsDisplay: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 10,
  },
  withdrawalContainer: {
    width: '90%',
    padding: 20,
    display:"flex",
    alignItems:"center"
  },
  pendingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  // ... (add any additional styles you need)
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 15,
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    position: "absolute",
    left: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
  },
  walletContainer: {
    width: "90%",
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    alignItems: "center",
  },
  walletIcon: {
    width: 50,
    height: 50,
    marginBottom: 15,
  },
  walletText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  walletDetails: {
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
    lineHeight: 30,
  },
  walletDetailss: {
    fontSize: 15,
    color: "green",
    textAlign: "center",
    lineHeight: 30,
    fontWeight:"bold"
  },
  inputContainer: {
    width: "90%",
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },
  inputFocused: {
    borderColor: '#000',
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  required: {
    color: 'red',
    marginLeft: 4,
  },
  pendingText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default WithdrawFundsScreen;