import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import InputField from "@/components/inputs/InputField";
import Button from "@/components/buttons/Button";
import { SocialButton } from "@/components/buttons/SocialButton";
import { googleIcon, appleIcon } from "@/assets/icons";

interface LoginFormProps {
  onForgotPassword: () => void;
  onSignUp: () => void;
  onLogIn: () => void;
  onGoogleAuth: () => void;
  onAppleAuth: () => void;
  testID?: string;
  setEmail: (email: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword, onSignUp, onLogIn, onGoogleAuth, onAppleAuth, testID = "login-form" , setEmail }) => {
  return (
    <SafeAreaView style={styles.safeContainer} testID={testID}>
      <View style={styles.container}>
        <Text style={styles.title}>Log In</Text>

        <View style={styles.form}>
          <InputField
            label="Username/E-mail"
            placeholder="Username/E-mail address"
            onChangeText={setEmail}
          ></InputField>
          <InputField label="Password" placeholder="Password" secureTextEntry={true}></InputField>

          <View style={styles.row}>
            <TouchableOpacity onPress={onForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.socialButtonsContainer}>
            <SocialButton iconXml={googleIcon} onPress={onGoogleAuth} testID="google-auth"/>
            <SocialButton iconXml={appleIcon} onPress={onAppleAuth} testID="apple-auth"/>
          </View>

          <Button children="Log In" onPress={onLogIn} testID="login-button"></Button>
        </View>

        <Text style={styles.signupText}>
          Already have an account?{" "}
          <TouchableOpacity onPress={onSignUp} testID="signup-link">
            <Text style={styles.signupLink}>Sign Up.</Text>
          </TouchableOpacity>
        </Text>
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
