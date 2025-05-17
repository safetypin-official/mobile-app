import SignUpForm from "@/components/forms/SignUpForm";
import { router } from "expo-router";
import { onGoogleAuth, registerEmailPassword } from "@/utils/auth"; // Import auth functions

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
      if (!day || !month || !year) {
        throw new Error("Invalid date of birth format");
      }
      const formattedBirthdate = `${year}-${month}-${day}`; // Convert to YYYY-MM-DD format
      
      const result = await registerEmailPassword(
        userData.email,
        userData.password,
        userData.username,
        formattedBirthdate
      );

      console.log(result);
      
      router.push(`/signUp/otp?email=${encodeURIComponent(userData.email)}`);
    } catch (error) {
      // Error handling is already done in registerEmailPassword
      console.error("Sign up failed:", error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await onGoogleAuth();
      console.log(result);
      console.log("Google auth successful");

      router.push('/map');
    } catch (error) {
      console.error("Google auth failed:", error);
      // Error alerts are handled within onGoogleAuth
    }
  };

  return (
    <SignUpForm
      onSignUp={handleSignUp}
      onLogIn={handleLogIn}
      onGoogleAuth={handleGoogleAuth}
      testID="signup-form"
    />
  );
}