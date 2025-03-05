import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, SafeAreaView } from "react-native";
import InputField from "@/components/inputs/InputField";
import Button from "@/components/buttons/Button";

const NewPasswordScreen: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdate = () => {
    if (newPassword === confirmPassword) {
      Alert.alert("Password updated successfully!");
    } else {
      Alert.alert("Passwords do not match.");
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
        <Text testID="title" style={styles.title}>New Password</Text>
        <Text style={styles.subtitle}>
            Your identity has been verified! Set your new password.
        </Text>

        <InputField
            label="New Password"
            placeholder="Enter new password"
            secureTextEntry
            onChangeText={setNewPassword}
        />

        <InputField
            label="Confirm Password"
            placeholder="Re-enter new password"
            secureTextEntry
            onChangeText={setConfirmPassword}
        />

        <Button onPress={handleUpdate} testID="update-button">
            Update Password
        </Button>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#7B241C",
    width: "100%",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    paddingHorizontal: "10%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default NewPasswordScreen;
