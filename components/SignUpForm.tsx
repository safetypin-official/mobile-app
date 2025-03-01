import React from "react";
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from "react-native";
import InputField from "./InputField";
import Button from "@/components/Button";

interface SignUpFormProps {
  onSignUp: () => void;
  onLogIn: () => void;
  testID: string;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUp, onLogIn, testID }) => {
  const handleSignUp = () => {
    onSignUp(); // Call the onSignUp prop
  };

  return (
    <SafeAreaView style={styles.safeContainer} testID={testID}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>

        <View style={styles.form}>
          <InputField label="Username" placeholder="Username"></InputField>
          <InputField label="E-mail" placeholder="E-mail address"></InputField>
          <InputField label="Date of Birth" placeholder="Date of Birth"></InputField>
          <InputField label="Password" placeholder="Password" secureTextEntry={true}></InputField>
          <InputField label="Confirm Password" placeholder="Confirm Password" secureTextEntry={true}></InputField>

          <View style={styles.row}>
            <Image
              source={{
                uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/0d4fe278128951f94532544c445b0cdf30497d337da8e6b3c45ec99601a976d8?apiKey=3d252c2866cb40ed8f1b49e6bfb91bab&",
              }}
              style={styles.avatar}
            />
          </View>

          <Button children="Sign Up" onPress={handleSignUp} testID="signup-button"></Button>
        </View>

        <Text style={styles.loginText}>
          Already have an account?{" "}
          <TouchableOpacity onPress={onLogIn} testID="login-link">
            <Text style={styles.loginLink}>Log in.</Text>
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  loginText: {
    marginTop: 30,
    color: "white",
    textAlign: "center",
  },
  loginLink: {
    color: "#e2c28c",
    fontWeight: "bold",
  },
});

export default SignUpForm;