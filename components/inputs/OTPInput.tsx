import React from "react";
import { TextInput, StyleSheet, View } from "react-native";

interface OTPInputProps {
  length: number;
  otp: string[];
  inputRefs: React.MutableRefObject<(TextInput | null)[]>;
  handleChange: (text: string, index: number) => void;
  handleKeyPress: (e: any, index: number) => void;
  testID?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({ length, otp, inputRefs, handleChange, handleKeyPress, testID = "otp-input" }) => {
  return (
    <View style={styles.otpContainer}>
      {otp.map((digit, index) => (
        <TextInput
          testID={testID}
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          style={styles.otpInput}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          value={digit}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: "white",
    width: 50,
    height: 50,
    textAlign: "center",
    fontSize: 22,
    borderRadius: 10,
    marginHorizontal: 8,
  },
});

export default OTPInput;
