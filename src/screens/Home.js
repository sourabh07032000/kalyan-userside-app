import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  Linking,
  Alert,
  BackHandler,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const {width} = Dimensions.get('window');

const HomeScreen = ({navigation}) => {
  const [check, setCheck] = useState("");
  const [userData, setUserData] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const [pollInterval, setPollInterval] = useState(null);
  // Add this at the top of your HomeScreen component, right after your existing useEffect:

// useEffect(() => {
//   const backAction = () => {
//     Alert.alert('Hold on!', 'Are you sure you want to exit?', [
//       {
//         text: 'Cancel',
//         onPress: () => null,
//         style: 'cancel',
//       },
//       { text: 'YES', onPress: () => BackHandler.exitApp() },
//     ]);
//     return true;
//   };

//   const backHandler = BackHandler.addEventListener(
//     'hardwareBackPress',
//     backAction,
//   );

//   return () => backHandler.remove();
// }, []);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data from AsyncStorage
        const storedDataString = await AsyncStorage.getItem('userData');
        
        if (storedDataString) {
          const storedData = JSON.parse(storedDataString);
          
          // Fetch updated user data from backend to ensure latest wallet balance
          const response = await axios.get(`https://sratebackend-1.onrender.com/user/${storedData._id}`);
          
          // Update local storage and state with the latest user data
          await AsyncStorage.setItem('userData', JSON.stringify(response.data));
          setUserData(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchMarketData = async () => {
      try {
        const response = await axios.get(
          'https://sratebackend-1.onrender.com/api/market-data'
        );
        setData(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching market data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch both user and market data
    fetchUserData();
    fetchMarketData();
  }, []);

  const parseTime = (timeString) => {
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  };

  const isMarketOpen = (openTime, closeTime) => {
    const currentTime = new Date();
    const { hours: openHours, minutes: openMinutes } = parseTime(openTime);
    const { hours: closeHours, minutes: closeMinutes } = parseTime(closeTime);

    const open = new Date(currentTime);
    open.setHours(openHours, openMinutes, 0, 0);

    const close = new Date(currentTime);
    close.setHours(closeHours, closeMinutes, 0, 0);

    return currentTime >= open && currentTime <= close;
  };

  const handleCardPress = async (market) => {
    const marketOpen = isMarketOpen(
      market.open_time_formatted,
      market.close_time_formatted
    );
    if (marketOpen) {
      try {
        await AsyncStorage.setItem('selectedMarket', JSON.stringify(market));
        navigation.navigate('GameSelection');
      } catch (error) {
        console.error('Error saving market data:', error);
      }
    } else {
      shakeText();
    }
  };

  const shakeText = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const openWhatsApp = () => {
    const phoneNumber = '9770837273'; 
    const message = 'Hello, I Interested in you service!'; 
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          alert('WhatsApp is not installed on your device');
        }
      })
      .catch((err) => console.error(err));
  };

  const makePhoneCall = () => {
    const phoneNumber = 'tel:9770837273'; 
    Linking.openURL(phoneNumber);
  };

  useEffect(() => {
    // Function to fetch both user and market data
    const fetchData = async () => {
      try {
        // Fetch user data
        const storedDataString = await AsyncStorage.getItem('userData');
        if (storedDataString) {
          const storedData = JSON.parse(storedDataString);
          const userResponse = await axios.get(`https://sratebackend-1.onrender.com/user/${storedData._id}`);
          await AsyncStorage.setItem('userData', JSON.stringify(userResponse.data));
          setUserData(userResponse.data);
        }

        // Fetch market data
        const marketResponse = await axios.get('https://sratebackend-1.onrender.com/api/market-data');
        setData(marketResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling interval (every 30 seconds)
    const interval = setInterval(fetchData, 30000);
    setPollInterval(interval);

    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  // Add focus effect to refresh data when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Fetch data immediately when screen is focused
      const fetchData = async () => {
        try {
          setLoading(true);
          const storedDataString = await AsyncStorage.getItem('userData');
          if (storedDataString) {
            const storedData = JSON.parse(storedDataString);
            const userResponse = await axios.get(`https://sratebackend-1.onrender.com/user/${storedData._id}`);
            await AsyncStorage.setItem('userData', JSON.stringify(userResponse.data));
            setUserData(userResponse.data);
          }

          const marketResponse = await axios.get('https://sratebackend-1.onrender.com/api/market-data');
          setData(marketResponse.data);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    });

    return unsubscribe;
  }, [navigation]);

  // Add pull-to-refresh functionality
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const storedDataString = await AsyncStorage.getItem('userData');
      if (storedDataString) {
        const storedData = JSON.parse(storedDataString);
        const userResponse = await axios.get(`https://sratebackend-1.onrender.com/user/${storedData._id}`);
        await AsyncStorage.setItem('userData', JSON.stringify(userResponse.data));
        setUserData(userResponse.data);
      }

      const marketResponse = await axios.get('https://sratebackend-1.onrender.com/api/market-data');
      setData(marketResponse.data);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.walletBtn}
          onPress={() => navigation.navigate('CustomDrawer')}>
          <Image
            source={{
              uri: 'https://img.icons8.com/ios-filled/50/ffffff/menu.png',
            }}
            style={styles.icon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kalyan Matka</Text>
        <TouchableOpacity onPress={()=>navigation.navigate("WalletStatement")}>
          <Image
            source={{
              uri: 'https://img.icons8.com/ios-filled/50/ffffff/wallet.png',
            }}
            style={styles.icon}
          />
          
          <Text style={styles.wallet}>
            ₹{userData?.wallet || '0.00'}
          </Text>
         
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}
         refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={openWhatsApp}>
            <Image
              source={{
                uri: 'https://img.icons8.com/ios-filled/50/ffffff/whatsapp.png',
              }}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Whatsapp</Text>
            <Text style={styles.subText}>Chats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={makePhoneCall}>
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

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={styles.error}>Error: {error}</Text>
        ) : (
          data.map((market, index) => {
            const marketOpen = isMarketOpen(
              market.open_time_formatted,
              market.close_time_formatted
            );
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.card,
                  {borderLeftColor: marketOpen ? 'green' : '#ED1C24'},
                ]}
                onPress={() => handleCardPress(market)}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    {market.market_name} ({market.open_time_formatted})
                  </Text>
                  <Text style={styles.cardPlaceholder}>{market?.aankdo_open}-{market?.figure_open}{market?.figure_close}-{market?.aankdo_close}</Text>
                  <Animated.Text
                    style={[
                      styles.cardStatus,
                      {
                        color: marketOpen ? 'green' : 'red',
                        transform: [
                          {translateX: marketOpen ? 0 : shakeAnimation},
                        ],
                      },
                    ]}>
                    {marketOpen
                      ? 'Market is open'
                      : 'Market is closed for today'}
                  </Animated.Text>
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
                      {market.open_time_formatted} -{' '}
                      {market.close_time_formatted}
                    </Text>
                    <Image
                      source={{
                        uri: marketOpen
                          ? 'https://img.icons8.com/ios-filled/50/0A840A/play.png'
                          : 'https://img.icons8.com/ios-filled/50/ED1C24/cancel.png',
                      }}
                      style={styles.playIcon}
                    />
                  </View>
                  
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wallet: {
    color: 'white',
  },
  walletBtn: {
    display: 'flex',
    flexDirection: 'row',
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
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A1F44',
  },
  cardPlaceholder: {
    fontSize: 15,
    color: '#F0BA40',
    marginVertical: 5,
    fontWeight:"bold"
  },
  cardStatus: {
    fontSize: 14,
    marginVertical: 5,
    fontWeight: '500',
  },
  cardTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  playIcon: {
    width: 30,
    height: 30,
  },
});

export default HomeScreen;