import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView } from "react-native";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { SocialButton } from "@/components/SocialButton";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

interface LoginFormProps {
  onForgotPassword: () => void;
  onSignUp: () => void;
  onLogIn: () => void;
  onGoogleAuth: () => void;
  onAppleAuth: () => void;
  testID: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword, onSignUp, onLogIn, onGoogleAuth, onAppleAuth, testID }) => {
  return (
    <SafeAreaView style={styles.safeContainer} testID={testID}>
      <View style={styles.container}>
        <Text style={styles.title}>Log In</Text>

        <View style={styles.form}>
          <InputField label="Username/E-mail" placeholder="Username/E-mail address"></InputField>
          <InputField label="Password" placeholder="Password" secureTextEntry={true}></InputField>

          <View style={styles.row}>
            <TouchableOpacity onPress={onForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.socialButtonsContainer}>
            <SocialButton icon="google" onPress={onGoogleAuth} testID="google-auth"/>
            <SocialButton icon="apple" onPress={onAppleAuth} testID="apple-auth"/>
          </View>

          <Button children="Log In" onPress={onLogIn} testID="login-button"></Button>
        </View>

        <Text style={styles.signupText}>
          Don't have an account?{" "}
          <Text style={styles.signupLink} onPress={onSignUp}>
            Sign up.
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export const onGoogleAuth = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    console.log(userInfo.data);
  } catch (error: any) {
    console.log("error");
    console.log(error);
  }
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#7B241C",
    width: "100%",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7B241C",
    paddingHorizontal: "10%",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
  },
  form: {
    width: "100%",
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 24
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  forgotPassword: {
    color: "white",
    textDecorationLine: "underline",
  },
  
  signupText: {
    marginTop: 30,
    color: "white",
    textAlign: "center",
  },
  signupLink: {
    color: "#e2c28c",
    fontWeight: "bold",
  },
});

export default LoginForm;
