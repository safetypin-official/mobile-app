import { Text, View, StyleSheet, Alert } from 'react-native';
import OTPVerification from '@/components/OTPVerification';
import { useLocalSearchParams } from 'expo-router';

const OTPVerificationScreen = () => {
  const { email } = useLocalSearchParams(); // Retrieve email from params

  const handleVerify = (otp: string) => {
    Alert.alert("Entered OTP", `Your OTP is: ${otp}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>OTP sent to {email}</Text>
      <OTPVerification 
        testID="otp-verification"
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
    marginBottom: 16,
    fontSize: 16,
  },
});

export default OTPVerificationScreen;