import React, { useState } from "react";
import { View, Alert } from "react-native";
import LoginForm from "@/components/forms/LoginForm";
import { router } from 'expo-router';
import { onGoogleAuth, onAppleIDAuth, isValidEmail, loginWithEmail } from "@/utils/auth";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    
    if (!password || password.trim() === "") {
      Alert.alert("Password Required", "Please enter your password.");
      return;
    }
    
    console.log(email);
    console.log(password);

    try {
      const result = await loginWithEmail(email, password);
      console.log("Email login successful:", result);
      // Navigate to home or dashboard after successful login
      // router.push('/dashboard');
    } catch (error: any) {
      // Errors are handled in the loginWithEmail function
      console.error("Email login failed:", error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await onGoogleAuth();
      console.log("Google auth successful:", result);
    } catch (error) {
      // The alerts are already handled in the onGoogleAuth function
      console.error("Google auth failed in component:", error);
    }
  };

  const handleAppleAuth = async () => {
    try {
      const result = await onAppleIDAuth();
      console.log("Apple auth successful:", result);
    } catch (error) {
      // The alerts are already handled in the onAppleIDAuth function
      console.error("Apple auth failed in component:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <LoginForm 
        testID="login-screen"
        onForgotPassword={() => router.push('/forgotPassword')}
        onSignUp={() => router.push('/signUp')}
        onLogIn={handleLogin}
        onGoogleAuth={handleGoogleAuth}
        onAppleAuth={handleAppleAuth}
        setEmail={setEmail}
        setPassword={setPassword}
      />
    </View>
  );
};

export default LoginScreen;