import { View, StyleSheet, Alert } from 'react-native';
import OTPVerification from '@/components/forms/OTPVerificationForm';
import { router } from 'expo-router';
import { verifyOTP } from "@/utils/auth";
import { useSearchParams } from 'expo-router/build/hooks';

const SignUpOTPScreen = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleVerify = async (otp: string) => {
    Alert.alert("Entered OTP", `Your OTP is: ${otp}`);
    
    try {
      if (!email) {
        throw new Error("Email is missing");
      }

      const result = await verifyOTP(
        email,
        otp
      );

      if (result.success === false)
        throw new Error(result.message);
      else
        Alert.alert("Verification Successful", result.message);
      console.log(result.message)
      
      router.push('/map');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("OTP Verification Failed", error.message);
        console.error("Sign up failed:", error);
      } else {
        Alert.alert("OTP Verification Failed", "An unknown error occurred");
        console.error("Sign up failed:", error);
      }
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <OTPVerification testID="otp-verification"
        otpLength={6}
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

export default SignUpOTPScreen;