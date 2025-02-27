import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView } from "react-native";
import InputField from "@/components/InputField";
import Button from "@/components/Button";

interface LoginFormProps {
  onForgotPassword: () => void;
  onSignUp: () => void;
  onLogIn: () => void;
  testID: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword, onSignUp, onLogIn, testID }) => {
  return (
    <SafeAreaView style={styles.safeContainer} testID={testID}>
      <View style={styles.container}>
        <Text style={styles.title}>Log In</Text>

        <View style={styles.form}>
          <InputField label="Username/E-mail" placeholder="Username/E-mail address"></InputField>
          <InputField label="Password" placeholder="Password" secureTextEntry={true}></InputField>

          <View style={styles.row}>
            <Image
              source={{
                uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/0d4fe278128951f94532544c445b0cdf30497d337da8e6b3c45ec99601a976d8?apiKey=3d252c2866cb40ed8f1b49e6bfb91bab&",
              }}
              style={styles.avatar}
            />
            <TouchableOpacity onPress={onForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>
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
