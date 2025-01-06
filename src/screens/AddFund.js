import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Clipboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import qr from '../images/qr.png';

const PaymentScreen = ({navigation}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');

  // Function to check if UTR exists
  // Function to check if UTR exists
  const isValidUTR = utr => {
    // Check if UTR is exactly 12 digits
    const utrRegex = /^\d{12}$/;
    return utrRegex.test(utr);
  };

  // Update the handleSubmit function
  const handleSubmit = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter amount.');
      return;
    }
    if (!utr) {
      Alert.alert('Error', 'Please enter UTR number.');
      return;
    }

    // Validate UTR format
    if (!isValidUTR(utr)) {
      Alert.alert('Error', 'UTR number must be exactly 12 digits.');
      return;
    }

    try {
      setIsUploading(true);

      // Check if UTR exists
      const utrExists = await checkUTRExists(utr);
      if (utrExists) {
        Alert.alert('Error', 'This UTR number has already been used.');
        return;
      }

      const storedData = JSON.parse(await AsyncStorage.getItem('userData'));

      const newTransactionRequest = {
        amount: amount,
        status: 'Pending',
        requestTime: new Date(),
        utrNumber: utr,
        username: storedData.username,
      };

      const updatedTransactionRequest = [
        ...storedData?.transactionRequest,
        newTransactionRequest,
      ];

      await axios.put(
        `https://sratebackend-1.onrender.com/user/${storedData._id}/transactionRequest`,
        {transactionRequest: updatedTransactionRequest},
      );

      Alert.alert('Success', 'Payment details submitted successfully!');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to submit payment details.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyAccountNumber = () => {
    Clipboard.setString('87950100006293');
    Alert.alert('Copied', 'Account number copied to clipboard.');
  };

  const handleCopyUPIID = () => {
    Clipboard.setString('8827824969@ptyes');
    Alert.alert('Copied', 'UPI ID copied to clipboard.');
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Image
              source={{
                uri: 'https://img.icons8.com/ios-filled/50/ffffff/back.png',
              }}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Funds</Text>
        </View>

        {/* Payment Methods Section */}
        <View style={styles.paymentMethodsContainer}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          {/* UPI Section */}
          <View style={styles.methodCard}>
            <Text style={styles.methodTitle}>UPI Payment</Text>
            <Image source={qr} style={styles.qrImage} />
            <View style={styles.upiDetails}>
              <Text style={styles.upiLabel}>UPI ID</Text>
              <View style={styles.copyContainer}>
                <Text style={styles.upiValue}>8827824969@ptyes</Text>
                <TouchableOpacity onPress={handleCopyUPIID}>
                  <Image
                    source={{
                      uri: 'https://img.icons8.com/ios/50/000000/copy.png',
                    }}
                    style={styles.copyIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bank Transfer Section */}
          <View style={styles.methodCard}>
            <Text style={styles.methodTitle}>Bank Transfer</Text>
            <View style={styles.bankDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account No.</Text>
                <View style={styles.copyContainer}>
                  <Text style={styles.detailValue}>87950100006293</Text>
                  <TouchableOpacity onPress={handleCopyAccountNumber}>
                    <Image
                      source={{
                        uri: 'https://img.icons8.com/ios/50/000000/copy.png',
                      }}
                      style={styles.copyIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>IFSC Code</Text>
                <View style={styles.copyContainer}>
                  <Text style={styles.detailValue}>BARB0DBPRIT</Text>
                  <TouchableOpacity
                    onPress={() => Clipboard.setString('BARB0DBPRIT')}>
                    <Image
                      source={{
                        uri: 'https://img.icons8.com/ios/50/000000/copy.png',
                      }}
                      style={styles.copyIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Holder Name</Text>
                <View style={styles.copyContainer}>
                  <Text style={styles.detailValue}> Aaditya Payal </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Transaction Details */}
          <View style={styles.methodCard}>
            <Text style={styles.methodTitle}>Transaction Details</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Amount <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Amount"
                keyboardType="numeric"
                onChangeText={setAmount}
                value={amount}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                UTR Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 12 digit UTR Number"
                onChangeText={text => {
                  // Only allow digits
                  const numericText = text.replace(/[^0-9]/g, '');
                  setUtr(numericText);
                }}
                value={utr}
                maxLength={12}
                keyboardType="numeric"
                
              />
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Confirm Payment</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#1a237e', // Black background
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    position: 'absolute',
    left: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff', // White text
  },
  paymentMethodsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a237e',
  },
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1a237e',
  },
  qrImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  upiDetails: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyIcon: {
    width: 20,
    height: 20,
  },
  detailRow: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  required: {
    color: 'red',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#1a237e',
    margin: 20,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
export default PaymentScreen;
