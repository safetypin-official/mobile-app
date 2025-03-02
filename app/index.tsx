import React, { useState } from "react";
import { View, Alert } from "react-native";
import LoginForm from "@/components/LoginForm";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { router } from 'expo-router';

GoogleSignin.configure({
  webClientId: '77998854438-h9gj1fsua39svfoh38gftrn2c7iro2r6.apps.googleusercontent.com',
  forceCodeForRefreshToken: true,
  scopes: ["profile", "email", "https://www.googleapis.com/auth/user.birthday.read"],
});

export const onGoogleAuth = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    console.log("success");
    console.log(userInfo.data);
  } catch (error: any) {
    console.log("error");
    console.log(error);
  }
}

const LoginScreen = () => {
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
        onForgotPassword={() => router.push('/forgotPassword')}
        onSignUp={() => router.push('/signUp')}
        onLogIn={handleLogin}
        onGoogleAuth={onGoogleAuth} 
        onAppleAuth={() => Alert.alert("Apple Auth Pressed!")} 
        setEmail={setEmail}
      />
    </View>
  );
};

export default LoginScreen;