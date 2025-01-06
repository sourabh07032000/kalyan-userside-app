import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  Alert
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

const BidWinHistoryScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [winningBets, setWinningBets] = useState([]);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [totalWinnings, setTotalWinnings] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = async () => {
  try {
    setLoading(true);
    const storedData = JSON.parse(await AsyncStorage.getItem("userData"));
    
    if (storedData && storedData._id) {
      const response = await axios.get(
        `https://sratebackend-1.onrender.com/user/${storedData._id}`
      );
      
      setUserData(response.data);
      
      // Filter winning bets and calculate correct winning amounts
      const winningBets = response.data.betDetails
        .filter(bet => bet.isWinner && bet.resultDeclared)
        .map(bet => {
          // Calculate winning amount based on bet type and multiplier
          const winAmount = Number(bet.betAmount) * Number(bet.matkaBetType.multiplier);
          return {
            ...bet,
            winningAmount: winAmount // Override the winning amount with correct calculation
          };
        })
        .sort((a, b) => {
          const dateA = new Date(a.resultDeclarationTime || 0);
          const dateB = new Date(b.resultDeclarationTime || 0);
          return dateB - dateA;
        });

      console.log("Winning bets:", winningBets); // Debug log
      setWinningBets(winningBets);
      
      // Calculate total winnings correctly
      const total = winningBets.reduce((sum, bet) => sum + Number(bet.winningAmount), 0);
      setTotalWinnings(total);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    setErrorMessage("Failed to load data. Please try again later.");
  } finally {
    setLoading(false);
  }
};
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "N/A";
    }
  };

 
  const handleSearch = () => {
    if (!userData?.betDetails) return;
  
    let filteredBets = userData.betDetails
      .filter(bet => bet.isWinner && bet.resultDeclared)
      .map(bet => ({
        ...bet,
        winningAmount: Number(bet.betAmount) * Number(bet.matkaBetType.multiplier)
      }));
  
    if (fromDate && toDate) {
      filteredBets = filteredBets.filter(bet => {
        const betDate = new Date(bet.resultDeclarationTime || 0);
        return betDate >= fromDate && betDate <= toDate;
      });
    }
  
    setWinningBets(filteredBets);
    
    const total = filteredBets.reduce((sum, bet) => sum + Number(bet.winningAmount), 0);
    setTotalWinnings(total);
  };
  const renderWinningBet = ({ item }) => {
    if (!item) return null;
  
    // Use resultDeclarationTime instead of betPlacedTiming
    const betDate = item.resultDeclarationTime ? new Date(item.resultDeclarationTime) : new Date();
    
    // Format date and time in Indian format
    const formattedDate = betDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const formattedTime = betDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const onDateChange = (event, selectedDate, type) => {
      if (Platform.OS === 'android') {
        setShowFromPicker(false);
        setShowToPicker(false);
      }
    
      if (selectedDate) {
        if (type === 'from') {
          setFromDate(selectedDate);
        } else {
          setToDate(selectedDate);
        }
      }
    };
    return (
      <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.market_id}</Text>
      <View style={styles.cardContent}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Session:</Text>
          <Text style={styles.cardValue}>{item.betTime}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Mode:</Text>
          <Text style={styles.cardValue}>{item.matkaBetType.category}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Winning Number:</Text>
          <Text style={styles.cardValue}>{item.matkaBetNumber}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Date:</Text>
          <Text style={styles.cardValue}>{formattedDate}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Time:</Text>
          <Text style={styles.cardValue}>{formattedTime}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Bet Amount:</Text>
          <Text style={styles.cardValue}>₹{Number(item.betAmount).toFixed(2)}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Points Won:</Text>
          <Text style={styles.cardValuee}>+₹{Number(item.winningAmount).toFixed(2)}</Text>
        </View>
      </View>
    </View>
    );
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
        <Text style={styles.headerTitle}>Bid Win History</Text>
      </View>
  
      <View style={styles.dateContainer}>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowFromPicker(true)}
        >
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/ffffff/calendar.png" }}
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>
            {fromDate ? formatDate(fromDate) : "From Date"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowToPicker(true)}
        >
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/ffffff/calendar.png" }}
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>
            {toDate ? formatDate(toDate) : "To Date"}
          </Text>
        </TouchableOpacity>
      </View>
  
      {/* Replace the old DateTimePicker components with these new ones */}
      {showFromPicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => onDateChange(event, date, 'from')}
        />
      )}
  
      {showToPicker && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => onDateChange(event, date, 'to')}
        />
      )}
  
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={handleSearch}
      >
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
  
      {winningBets.length > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Winnings</Text>
          <Text style={styles.totalAmount}>₹{totalWinnings.toFixed(2)}</Text>
        </View>
      )}
  
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : winningBets.length > 0 ? (
        <FlatList
          data={winningBets}
          renderItem={renderWinningBet}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.scrollContainer}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No winning bets found</Text>
        </View>
      )}
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
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginVertical: 10,
    marginLeft:"5%"
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000", // Black background
    padding: 10,
    borderRadius: 5,
    width: "45%",
    justifyContent: "center",
  },
  dateIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  dateText: {
    color: "#fff",
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#000", // Black background
    padding: 15,
    borderRadius: 5,
    width: "90%",
    alignItems: "center",
    marginVertical: 10,
     marginLeft:"5%"
  },
  searchButtonText: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000", // Black text
    marginBottom: 10,
  },
  cardContent: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
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
  cardValuee: {
    fontSize: 14,
    fontWeight: "bold",
    color: "green", // Black text
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
  totalContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    marginTop: 5,
  }
});

export default BidWinHistoryScreen;