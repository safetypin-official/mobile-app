import React, { useState } from "react";
import { View, Alert } from "react-native";
import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import { router } from 'expo-router';
import validator from "validator";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");

  const isValidEmail = (email: string): boolean => {
    return !!validator.isEmail(email);
  };

  const sendEmail = () => {
    if (!isValidEmail(email)) {
      Alert.alert("Invalid email format!");
      return;
    }
    router.push('/forgotPassword/otpVerificationScreen')
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