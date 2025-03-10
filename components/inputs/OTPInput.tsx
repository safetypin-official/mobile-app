import React from "react";
import { TextInput, StyleSheet, View } from "react-native";

interface OTPInputProps {
  otp: string[];
  inputRefs: React.MutableRefObject<(TextInput | null)[]>;
  handleChange: (text: string, index: number) => void;
  handleKeyPress: (e: any, index: number) => void;
  testID?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({ otp, inputRefs, handleChange, handleKeyPress, testID = "otp-input" }) => {
  return (
    <View style={styles.otpContainer}>
      {otp.map((digit, _index) => (
        
          <TextInput 
            testID={`otp-input-position-${_index + 1}`}
            key={`otp-digit-position-${_index + 1}`}
            ref={(el) => (inputRefs.current[_index] = el)}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(text) => handleChange(text, _index)}
            onKeyPress={(e) => handleKeyPress(e, _index)}
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
