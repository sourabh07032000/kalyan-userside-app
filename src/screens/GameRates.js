import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get('window');

const GameRates = ({ navigation }) => {
  const rates = [
    {
      type: "Single Digit",
      rate: "10 ka 95",
      multiplier: "9.5x",
      icon: "🎯"
    },
    {
      type: "Jodi Digit",
      rate: "10 ka 950",
      multiplier: "95x",
      icon: "🎲"
    },
    {
      type: "Single Pana",
      rate: "10 ka 1400",
      multiplier: "140x",
      icon: "🎪"
    },
    {
      type: "Double Pana",
      rate: "10 ka 2800",
      multiplier: "280x",
      icon: "🎰"
    },
    {
      type: "Triple Pana",
      rate: "10 ka 7000",
      multiplier: "700x",
      icon: "🎳"
    },
    {
      type: "Half Sangam",
      rate: "10 ka 10000",
      multiplier: "1000x",
      icon: "🎮"
    },
    {
      type: "Full Sangam",
      rate: "10 ka 100000",
      multiplier: "10000x",
      icon: "🏆"
    },
  ];

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
        <Text style={styles.headerTitle}>Game Rates</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Current Betting Rates</Text>
        
        <View style={styles.ratesContainer}>
          {rates.map((rate, index) => (
            <View key={index} style={styles.rateCard}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{rate.icon}</Text>
              </View>
              <View style={styles.rateInfo}>
                <Text style={styles.gameType}>{rate.type}</Text>
                <Text style={styles.rate}>{rate.rate}</Text>
                <View style={styles.multiplierContainer}>
                  <Text style={styles.multiplierText}>Multiplier:</Text>
                  <Text style={styles.multiplier}>{rate.multiplier}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>Important Note:</Text>
          <Text style={styles.noteText}>
            • Minimum bet amount is ₹10{'\n'}
            • Maximum bet amount varies by game{'\n'}
            • Rates are subject to change{'\n'}
            • All bets are final once placed
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#000',
    elevation: 5,
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  scrollContainer: {
    padding: 15,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  ratesContainer: {
    gap: 15,
  },
  rateCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 24,
  },
  rateInfo: {
    flex: 1,
  },
  gameType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  rate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  multiplierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  multiplierText: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  multiplier: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  noteContainer: {
    marginTop: 15,
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
});

export default GameRates;