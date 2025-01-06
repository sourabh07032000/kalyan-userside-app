import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [data, setData] = useState(null); // State to store the API response
  const [error, setError] = useState(null); // State to store any errors
  const [loading, setLoading] = useState(true); // State to show loading indicator

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await axios.get('https://sratebackend-1.onrender.com/api/market-data'); // Replace with your backend URL
        setData(response.data); // Store the API response in state
         
      } catch (err) {
        setError(err.message); // Store the error
        console.error('Error fetching market data:', err.message);
      } finally {
        setLoading(false); // Stop the loading indicator
      }
    };

    fetchMarketData();
  }, []);

  const isMarketOpen = (openTime, closeTime) => {
    const currentTime = new Date();
    const open = new Date(`1970-01-01T${openTime}:00`);
    const close = new Date(`1970-01-01T${closeTime}:00`);
    return currentTime >= open && currentTime <= close;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('CustomDrawer')}>
          <Image
            source={{
              uri: 'https://img.icons8.com/ios-filled/50/ffffff/menu.png',
            }}
            style={styles.icon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kalyan Matka</Text>
        <Image
          source={{
            uri: 'https://img.icons8.com/ios-filled/50/ffffff/wallet.png',
          }}
          style={styles.icon}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button}>
            <Image
              source={{
                uri: 'https://img.icons8.com/ios-filled/50/ffffff/whatsapp.png',
              }}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Whatsapp</Text>
            <Text style={styles.subText}>Chats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Image
              source={{
                uri: 'https://img.icons8.com/ios-filled/50/ffffff/phone.png',
              }}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Call Us</Text>
            <Text style={styles.subText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('AddFund')}>
            <Image
              source={{
                uri: 'https://img.icons8.com/ios-filled/50/ffffff/money.png',
              }}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Add Money</Text>
            <Text style={styles.subText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Withdrawal')}>
            <Image
              source={{
                uri: 'https://img.icons8.com/ios-filled/50/ffffff/withdrawal.png',
              }}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Withdrawal</Text>
            <Text style={styles.subText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.starlineButton}>
          <Image
            source={{
              uri: 'https://img.icons8.com/ios-filled/50/ffffff/star.png',
            }}
            style={styles.starIcon}
          />
          <Text style={styles.starlineText}>Starline</Text>
        </TouchableOpacity>

      
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={styles.error}>Error: {error}</Text>
        ) : (
          data?.today_result?.map((market, index) => {
            const marketOpen = isMarketOpen(
              market.open_time_formatted,
              market.close_time_formatted
            );
            return (
              <TouchableOpacity key={index} style={styles.card} onPress={()=>navigation.navigate("GameSelection")}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    {market.market_name} ({market.open_time_formatted})
                  </Text>
                  <Text
                    style={[
                      styles.cardStatus,
                      { color: marketOpen ? 'green' : 'red' },
                    ]}
                  >
                    {marketOpen ? 'Market is open' : 'Market is closed for today'}
                  </Text>
                  <View style={styles.cardTimeRow}>
                    <Image
                      source={{
                        uri: marketOpen
                          ? 'https://img.icons8.com/ios-filled/50/0A840A/clock.png'
                          : 'https://img.icons8.com/ios-filled/50/ED1C24/clock.png',
                      }}
                      style={styles.timeIcon}
                    />
                    <Text style={styles.cardTime}>
                      {market.open_time_formatted} - {market.close_time_formatted}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Add more cards as needed */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
  },
  icon: {
    width: 24,
    height: 24,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.9,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    width: width * 0.42,
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    width: 20,
    height: 20,
    marginVertical: 5,
  },
  subText: {
    color: '#F0BA40',
    fontSize: 14,
  },
  starlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ED1C24',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  starIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  starlineText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: width * 0.9,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#ED1C24',
  },
  cardd: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: width * 0.9,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: 'green',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A1F44',
  },
  cardStatus: {
    fontSize: 14,
    color: '#ED1C24',
    marginVertical: 5,
    fontWeight: '500',
  },
  cardStatuss: {
    fontSize: 14,
    color: 'green',
    marginVertical: 5,
    fontWeight: '500',
  },
  cardTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
  },
  cardTime: {
    fontSize: 14,
    color: '#333',
  },
});

export default HomeScreen;
