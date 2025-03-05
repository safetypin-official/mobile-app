import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView } from "react-native";
import InputField from "@/components/InputField";
import Button from "@/components/Button";

interface ForgotPasswordFormProps {
  onSend: () => void;
  testID: string;
  setEmail: (email: string) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSend, testID, setEmail }) => {
  return (
    <SafeAreaView style={styles.safeContainer} testID={testID}>
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password?</Text>

        <Text style={styles.subtitle}>Enter the email address associated with your account. We will email you a verification code to reset your password.</Text>

        <View style={styles.form}>
          <InputField
            label=""
            placeholder="Enter email address"
            onChangeText={setEmail}
          ></InputField>

          <View style={styles.row}>
          <Button children="Send" onPress={onSend} testID="send-button"></Button>
          </View>
        </View>
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
  subtitle: {
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
    paddingHorizontal: 10,
    marginTop: "2%",
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
});

export default ForgotPasswordForm;