import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import Button from "@/components/buttons/Button";

interface OTPVerificationProps {
  onVerify: (otp: string) => void;
  onResend: () => void;
  testID: string;

}

const OTPVerification: React.FC<OTPVerificationProps> = ({ onVerify, onResend, testID }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]); // Store refs for each input

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) return; // Prevent entering more than one character

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to the next input field
    if (text !== "" && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer} testID={testID}>
      <View style={styles.container}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>
          Enter the verification code we just sent to your email address.
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, _index) => {
            // Generate a stable ID based on position in the OTP sequence
            const digitPosition = _index + 1; // 1-based position
            
            return (
              <TextInput 
                testID={`otp-input-position-${digitPosition}`}
                key={`otp-digit-position-${digitPosition}`}
                ref={(el) => (inputRefs.current[_index] = el)}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={(text) => handleChange(text, _index)}
                onKeyPress={(e) => handleKeyPress(e, _index)}
                value={digit}
              />
            );
          })}
        </View>

        <TouchableOpacity onPress={onResend}>
          <Text style={styles.resendText}>Didn't receive a code? <Text style={styles.resendLink}>Resend.</Text></Text>
        </TouchableOpacity>

        <Button testID="verify-button" onPress={() => onVerify(otp.join(""))}>
          Verify
        </Button>
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "80%",
    marginTop: "2%",
    marginBottom: "2%",
  },
  otpInput: {
    backgroundColor: "white",
    width: 50,
    height: 50,
    textAlign: "center",
    fontSize: 22,
    borderRadius: 10,
    marginHorizontal: "2%",
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
