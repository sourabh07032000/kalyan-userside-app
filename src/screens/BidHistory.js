import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BidsHistoryScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedData = JSON.parse(await AsyncStorage.getItem("userData"));
        if (storedData && storedData._id) {
          const response = await axios.get(
            `https://sratebackend-1.onrender.com/user/${storedData._id}`
          );
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("CustomDrawer")}
          style={styles.backButton}
        >
          <Image
            source={{
              uri: "https://img.icons8.com/ios-filled/50/ffffff/back.png",
            }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bids History</Text>
      </View>

      <View style={styles.dateContainer}>
        <TouchableOpacity style={styles.dateButton}>
          <Image
            source={{
              uri: "https://img.icons8.com/ios-filled/50/ffffff/calendar.png",
            }}
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>From Date</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateButton}>
          <Image
            source={{
              uri: "https://img.icons8.com/ios-filled/50/ffffff/calendar.png",
            }}
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>To Date</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.searchButton}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : (
        <FlatList
          data={userData?.betDetails || []}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{`Market ID: ${item.market_id}`}</Text>
              <View style={styles.cardContent}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Session:</Text>
                  <Text style={styles.cardValue}>{item.betTime || "N/A"}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Mode:</Text>
                  <Text style={styles.cardValue}>
                    {item.matkaBetType?.category}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Digit:</Text>
                  <Text style={styles.cardValue}>
                    {item.matkaBetNumber}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Amount:</Text>
                  <Text style={styles.cardValue}> {item.betAmount} Rs</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.noDataText}>No bet history available.</Text>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
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
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginVertical: 10,
    alignSelf: "center",
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
    alignSelf: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
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
    alignSelf: "center",
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
  noDataText: {
    fontSize: 16,
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
});

export default BidsHistoryScreen;