import React, { useState } from "react";
import { View, Alert } from "react-native";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sendEmail = () => {
    if (!isValidEmail(email)) {
      Alert.alert("Invalid email format!");
      return;
    }
    Alert.alert("Send button Pressed!");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ForgotPasswordForm
        testID="forgot-password"
        onSend={sendEmail}
        setEmail={setEmail}
      />
    </View>
  );
};

export default ForgotPasswordScreen;