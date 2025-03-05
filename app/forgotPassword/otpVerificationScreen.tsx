import { Text, View, StyleSheet, Alert } from 'react-native';
import OTPVerification from '@/components/forms/OTPVerificationForm';

const OTPVerificationScreen = () => {
  const handleVerify = (otp: string) => {
    Alert.alert("Entered OTP", `Your OTP is: ${otp}`);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <OTPVerification testID="otp-verification"
        onVerify={handleVerify} 
        onResend={() => Alert.alert("Resend Pressed!")} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});

export default OTPVerificationScreen;