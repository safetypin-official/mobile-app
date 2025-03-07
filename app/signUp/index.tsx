import SignUpForm from "@/components/SignUpForm";
import { router } from "expo-router";
import { Alert } from "react-native";
import { onGoogleAuth, onAppleIDAuth, registerEmailPassword } from "@/utils/auth"; // Import auth functions

export default function SignUpScreen() {
  const handleLogIn = () => {
    router.push("/");
  };

  const handleSignUp = async (userData: { 
    username: string, 
    email: string, 
    dateOfBirth: string, 
    password: string 
  }) => {
    try {
      // Format the date of birth if needed (assuming it's in DD/MM/YYYY format in the form)
      const [day, month, year] = userData.dateOfBirth.split('/');
      const formattedBirthdate = `${year}-${month}-${day}`; // Convert to YYYY-MM-DD format
      
      const result = await registerEmailPassword(
        userData.email,
        userData.password,
        userData.username,
        formattedBirthdate
      );
      
      Alert.alert(
        "Registration Successful", 
        "Your account has been created successfully!",
        // [{ text: "OK", onPress: () => router.push("/home") }]
      );
    } catch (error) {
      // Error handling is already done in registerEmailPassword
      console.error("Sign up failed:", error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await onGoogleAuth();
      console.log("Google auth successful");
    } catch (error) {
      console.error("Google auth failed:", error);
      // Error alerts are handled within onGoogleAuth
    }
  };

  const handleAppleAuth = async () => {
    try {
      const result = await onAppleIDAuth();
      console.log("Apple auth successful");
    } catch (error) {
      console.error("Apple auth failed:", error);
      // Error alerts are handled within onAppleIDAuth
    }
  };

  return (
    <SignUpForm
      onSignUp={handleSignUp}
      onLogIn={handleLogIn}
      onGoogleAuth={handleGoogleAuth}
      onAppleAuth={handleAppleAuth}
      testID="signup-form"
    />
  );
}