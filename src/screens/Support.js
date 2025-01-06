import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";

const SupportScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("CustomDrawer")} style={styles.backButton}>
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/ffffff/back.png" }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.supportCard}>
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/000000/phone.png" }}
            style={styles.supportIcon}
          />
          <View>
            <Text style={styles.supportText}>Call Us</Text>
            <Text style={styles.supportNumber}>+91617268731</Text>
          </View>
        </View>

        <View style={styles.supportCard}>
          <Image
            source={{ uri: "https://img.icons8.com/color/48/000000/whatsapp.png" }}
            style={styles.supportIcon}
          />
          <View>
            <Text style={styles.supportText}>Whatsapp Us</Text>
            <Text style={styles.supportNumber}>+91617268731</Text>
          </View>
        </View>

        <View style={styles.supportCard}>
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/000000/telegram-app.png" }}
            style={styles.supportIcon}
          />
          <View>
            <Text style={styles.supportText}>Telegram Us</Text>
            <Text style={styles.supportNumber}>+91617268731</Text>
          </View>
        </View>
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
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#000", // Black border
  },
  supportIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  supportText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  supportNumber: {
    fontSize: 14,
    color: "#333",
  },
});

export default SupportScreen;