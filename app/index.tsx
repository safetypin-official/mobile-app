import { View } from "react-native";
import LoginForm from "@/components/LoginForm";

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <LoginForm testID="login-screen"
        onForgotPassword={() => alert("Forgot Password Pressed!")} 
        onSignUp={() => alert("Sign Up Pressed!")} 
        onLogIn={() => alert("Log In Pressed!")} 
      />
    </View>
  );
}
