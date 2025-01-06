import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";

const ChangePasswordScreen = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("CustomDrawer")} style={styles.backButton}>
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/ffffff/back.png" }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Old Password</Text>
        <View style={styles.inputWrapper}>
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/000000/lock.png" }}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Old Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={oldPassword}
            onChangeText={(text) => setOldPassword(text)}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrapper}>
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/000000/lock.png" }}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter New Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={newPassword}
            onChangeText={(text) => setNewPassword(text)}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  inputContainer: {
    width: "90%",
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChangePasswordScreen;