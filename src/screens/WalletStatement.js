import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WalletStatement = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedData = JSON.parse(await AsyncStorage.getItem("userData"));
      if (storedData && storedData._id) {
        const response = await axios.get(
          `https://sratebackend-1.onrender.com/user/${storedData._id}`
        );
        setUserData(response.data);
  
        // Process winning bets
        const winningTransactions = response.data.betDetails
          .filter(bet => bet.resultDeclared)
          .map(bet => {
            const winAmount = bet.isWinner ? 
              Number(bet.betAmount) * Number(bet.matkaBetType.multiplier) : 
              Number(bet.betAmount);
  
            // Get the current date in ISO format
            const currentDate = new Date().toISOString();
            
            // Use a fixed time for testing (you should replace this with actual result time from API)
            const fixedDate = "2024-01-05T06:23:00.000Z"; // Example fixed date and time
  
            return {
              type: bet.isWinner ? "Credit" : "Debit",
              amount: winAmount,
              date: fixedDate, // Use the fixed date for now
              description: bet.isWinner ? 
                `Won ${bet.matkaBetType.category} bet on ${bet.market_id}` :
                `Lost ${bet.matkaBetType.category} bet on ${bet.market_id}`
            };
          });
  
        // Process withdrawals
        const withdrawalTransactions = response.data.withdrawalRequest?.map(withdrawal => ({
          type: "Debit",
          amount: Number(withdrawal.amount),
          date: withdrawal.requestTime,
          description: `Withdrawal Request`,
          status: withdrawal.status
        })) || [];
  
        // Combine all transactions and sort by date
        const allTransactions = [...winningTransactions, ...withdrawalTransactions]
          .sort((a, b) => new Date(b.date) - new Date(a.date));
  
        setTransactions(allTransactions);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };
  
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Time formatting error:", error);
      return "Invalid Date";
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.navigate("CustomDrawer")} 
          style={styles.backButton}
        >
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/ffffff/back.png" }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet Statement</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.walletContainer}>
          <Image
            source={{ uri: "https://img.icons8.com/color/48/000000/wallet.png" }}
            style={styles.walletIcon}
          />
          <Text style={styles.walletText}>
            Available Points: ₹{userData?.wallet || 0}
          </Text>
          <Text style={styles.walletDetailss}>Withdraw 24/7</Text>
          <Text style={styles.walletDetails}>
            Minimum withdraw amount: ₹100{"\n"}
            Maximum withdraw amount: ₹1,00,000
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.withdrawButton}
            onPress={() => navigation.navigate("Withdrawal")}
          >
            <Text style={styles.buttonText}>Withdrawal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addFundsButton}
            onPress={() => navigation.navigate("AddFund")}
          >
            <Text style={styles.buttonText}>Add Funds</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          transactions.map((transaction, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Type:</Text>
                <Text style={[
                  styles.cardValue,
                  { color: transaction.type === "Credit" ? "green" : "red" }
                ]}>
                  {transaction.type}
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Description:</Text>
                <Text style={[styles.cardValue, { flex: 1, textAlign: 'right' }]}>
                  {transaction.description}
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Amount:</Text>
                <Text style={[
                  styles.cardValue,
                  { color: transaction.type === "Credit" ? "green" : "red" }
                ]}>
                  {transaction.type === "Credit" ? "+" : "-"}₹{Math.abs(transaction.amount).toFixed(2)}
                </Text>
              </View>
              {transaction.status && (
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Status:</Text>
                  <Text style={[
                    styles.cardValue,
                    { 
                      color: transaction.status === "completed" ? "green" : 
                             transaction.status === "pending" ? "orange" : "red"
                    }
                  ]}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Text>
                </View>
              )}
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Date:</Text>
                <Text style={styles.cardValue}>{formatDate(transaction.date)}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Time:</Text>
                <Text style={styles.cardValue}>{formatTime(transaction.date)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
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
    backgroundColor: "#000", // Black background
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
    color: "#fff", // White text
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
    marginVertical: 10, // Reduced margin
    alignItems: "center",
  },
  walletIcon: {
    width: 50,
    height: 50,
    marginBottom: 15, // Increased spacing
  },
  walletText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15, // Increased spacing
  },
  walletDetails: {
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
    lineHeight: 30, // Added line height for better spacing
  
  },
  walletDetailss: {
    fontSize: 15,
    color: "green",
    textAlign: "center",
    lineHeight: 30,
    fontWeight:"bold"
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginVertical: 20,
  },
  withdrawButton: {
    backgroundColor: "#FF3333", // Red background
    padding: 15,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  addFundsButton: {
    backgroundColor: "#32a852", // Green background
    padding: 15,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  cardLabel: {
    fontSize: 14,
    color: "#333",
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000", // Black text
  },
  cardValue: {
  fontSize: 14,
  fontWeight: "bold",
  color: "#000",
  maxWidth: '70%', // Prevent text overflow
},
cardDescription: {
  fontSize: 14,
  fontWeight: "bold",
  color: "#000",
  textAlign: 'right',
  flex: 1,
},
});

export default WalletStatement;