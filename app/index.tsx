import React, { useState } from "react";
import { View, Alert } from "react-native";
import LoginForm from "@/components/LoginForm";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";


GoogleSignin.configure();

export default function LoginScreen() {
  const [email, setEmail] = useState("");

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = () => {
    if (!isValidEmail(email)) {
      Alert.alert("Invalid email format!");
      return;
    }
    Alert.alert("Log In Pressed!");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <LoginForm testID="login-screen"
        onForgotPassword={() => Alert.alert("Forgot Password Pressed!")} 
        onSignUp={() => Alert.alert("Sign Up Pressed!")} 
        onLogIn={handleLogin}
        onGoogleAuth={() => Alert.alert("Google Auth Pressed!")} 
        onAppleAuth={() => Alert.alert("Apple Auth Pressed!")} 
        setEmail={setEmail}
      />
    </View>
  );
}
