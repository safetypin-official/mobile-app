import SignUpForm from "@/components/SignUpForm";
import { router } from "expo-router";

export default function SignUpPage() {
  const handleLogIn = () => {
    router.push("/");
  };

  return (
    <SignUpForm
      onSignUp={() => alert("Sign Up Pressed!")}
      onLogIn={handleLogIn}
      testID="signup-form"
    />
  );
}