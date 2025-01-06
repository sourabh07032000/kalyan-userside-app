import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import singledigit from "../images/singledigit.jpeg";
import doublepanna from "../images/doublepanna.jpeg";
import fullsangam from "../images/fullsangam.jpeg";
import jodidigit from "../images/jodidigit.jpeg";
import singlepanna from "../images/singlepanna.jpeg";
import spdptp from "../images/spdptp.jpeg";
import resbracelet from "../images/spdptp.jpeg";
import triplepanna from "../images/triplepanna.jpeg";

const KalyanNightScreen = ({ navigation }) => {
  const [marketName, setMarketName] = useState('KALYAN NIGHT'); // Default market name

  useEffect(() => {
    const checkMarketStatus = async () => {
      try {
        const marketDataString = await AsyncStorage.getItem('selectedMarket');
        if (marketDataString) {
          const marketData = JSON.parse(marketDataString);
          setMarketName(marketData.market_name);
          
          // You can add additional market status checks here
          const currentTime = new Date();
          const closeTime = new Date(`${currentTime.toDateString()} ${marketData.close_time_formatted}`);
          
          if (currentTime > closeTime) {
            // Market is closed
            // You can update UI accordingly
          }
        }
      } catch (error) {
        console.error('Error checking market status:', error);
      }
    };
  
    checkMarketStatus();
    // Set up interval to check status periodically
    const interval = setInterval(checkMarketStatus, 60000); // Check every minute
  
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const getMarketData = async () => {
      try {
        const marketData = await AsyncStorage.getItem('selectedMarket');
        console.log('Retrieved market data:', marketData); // Debug log
        if (marketData) {
          const market = JSON.parse(marketData);
          console.log('Parsed market data:', market); // Debug log
          // Assuming market is an object, adjust this line to access the correct property
          setMarketName(market.market_name || market); // Adjust based on actual structure
        }
      } catch (error) {
        console.error('Error retrieving market data:', error);
      }
    };

    getMarketData();
  }, []);

  const matkaRates =  [
    {
      "id": 1,
      "category": "Single Digit",
      "description": "10 ka 95",
      "multiplier": 9.5,
      icon: singledigit
    },
    {
      "id": 2,
      "category": "Jodi Digit",
      "description": "10 ka 950",
      "multiplier": 95,
      icon: jodidigit
    },
    {
      "id": 3,
      "category": "Single Pana",
      "description": "10 ka 1400",
      "multiplier": 140,
      icon: singlepanna
    },
    {
      "id": 4,
      "category": "Double Pana",
      "description": "10 ka 2800",
      "multiplier": 280,
      icon: doublepanna
    },
    {
      "id": 5,
      "category": "Triple Pana",
      "description": "10 ka 7000",
      "multiplier": 700,
      icon: triplepanna
    },
    {
      "id": 6,
      "category": "Half Sangam",
      "description": "10 ka 10000",
      "multiplier": 1000,
      icon: fullsangam
    },
    {
      "id": 7,
      "category": "Full Sangam",
      "description": "10 ka 100000",
      "multiplier": 10000,
      icon: fullsangam
    }
  ];
  
  const selectBetType = async (game) => {
    try {
      // Get current market data
      const marketDataString = await AsyncStorage.getItem('selectedMarket');
      const marketData = JSON.parse(marketDataString);
  
      // Check conditions based on game type
      if (game.id === 2) { // Jodi Digit
        if (marketData.aankdo_open !== 'XXX' || marketData.aankdo_close !== 'XXX') {
          Alert.alert('Market Closed', 'Betting is closed for Jodi as result is declared');
          return;
        }
      } 
      else if (game.id === 6) { // Half Sangam
        if (game.betTime === 'Open' && marketData.aankdo_open !== 'XXX') {
          Alert.alert('Market Closed', 'Open session betting is closed');
          return;
        }
        if (game.betTime === 'Close' && marketData.aankdo_close !== 'XXX') {
          Alert.alert('Market Closed', 'Close session betting is closed');
          return;
        }
      }
      else if (game.id === 7) { // Full Sangam
        if (marketData.aankdo_open !== 'XXX' || marketData.aankdo_close !== 'XXX') {
          Alert.alert('Market Closed', 'Betting is closed for Full Sangam as result is declared');
          return;
        }
      }
      else if (game.id === 3 || game.id === 4) { // Single Panna and Double Panna
        const currentTime = new Date();
        const openTime = new Date(`${currentTime.toDateString()} ${marketData.open_time_formatted}`);
        const closeTime = new Date(`${currentTime.toDateString()} ${marketData.close_time_formatted}`);
  
        if (currentTime > closeTime) {
          Alert.alert('Market Closed', 'Betting time is over for today');
          return;
        }
      }
  
      // If all checks pass, proceed with navigation
      await AsyncStorage.setItem("matkaBetType", JSON.stringify(game));
      
      // Navigate based on game type
      if (game.id === 2 || game.id === 3 || game.id === 4) {
        navigation.navigate('JodiScreen');
      } else if (game.id === 6 || game.id === 7) {
        navigation.navigate('SangamScreen');
      } else {
        navigation.navigate('GameScreen');
      }
  
    } catch (error) {
      console.error('Error in selectBetType:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/ffffff/back.png" }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{marketName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.grid}>
          {matkaRates.map((game, index) => (
            <TouchableOpacity onPress={() => selectBetType(game)} key={index} style={styles.gameCard}>
              <View style={styles.iconContainer}>
                <Image source={game.icon} style={styles.gameIcon} />
              </View>
              <Text style={styles.gameText}>{game.category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate('GameRates')} // Make sure you have this route
      >
        <Image
          source={{ uri: "https://img.icons8.com/color/48/000000/cash-in-hand.png" }}
          style={styles.rateIcon}
        />
        <Text style={styles.floatingButtonText}>Game Rates</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
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
    padding: 10,
    position: "absolute",
    left: 0,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  gameCard: {
    width: "40%",
    backgroundColor: "#fff",
    borderRadius: 70,
    padding: 20,
    margin: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  iconContainer: {
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 10,
    marginBottom: 10,
  },
  gameIcon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  gameText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#000', // Dark blue color
    borderRadius: 30,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  rateIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
});

export default KalyanNightScreen;