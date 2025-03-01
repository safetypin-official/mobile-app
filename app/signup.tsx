import SignUpForm from "@/components/SignUpForm";
import { router } from "expo-router";
import { Alert } from "react-native";

export default function SignUpPage() {
  const handleLogIn = () => {
    router.push("/");
  };

  return (
    <SignUpForm
      onSignUp={() => Alert.alert("Sign Up Pressed!")}
      onLogIn={handleLogIn}
      testID="signup-form"
    />
  );
}