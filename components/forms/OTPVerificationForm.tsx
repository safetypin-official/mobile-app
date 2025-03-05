// forms/OTPVerification.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import OTPInput from "@/components/inputs/OTPInput";
import Button from "@/components/buttons/Button";
import { useOTP } from "@/components/hooks/useOTP";

interface OTPVerificationProps {
  onVerify: (otp: string) => void;
  onResend: () => void;
  testID?: string;
  otpLength?: number;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ onVerify, onResend, testID = "otp-verification-form" , otpLength = 4 }) => {
  const { otp, setOtp, inputRefs, handleChange, handleKeyPress } = useOTP(otpLength);

  return (
    <SafeAreaView style={styles.safeContainer} testID={testID}>
      <View style={styles.container}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>Enter the verification code sent to your email.</Text>

        <OTPInput otp={otp} inputRefs={inputRefs} handleChange={handleChange} handleKeyPress={handleKeyPress} />

        <TouchableOpacity onPress={onResend}>
          <Text style={styles.resendText}>Didn't receive a code? <Text style={styles.resendLink}>Resend.</Text></Text>
        </TouchableOpacity>

        <Button
          testID="verify-button"
          onPress={() => {
            const otpCode = otp.join("");
            if (otpCode.length === otpLength) { 
              onVerify(otpCode);
            }
          }}
          children="Verify" />
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
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
    paddingHorizontal: 10,
  },
  resendText: {
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  resendLink: {
    color: "#e2c28c",
    fontWeight: "bold",
  },
});

export default OTPVerification;
