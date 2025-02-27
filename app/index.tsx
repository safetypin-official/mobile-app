import { View, Alert } from "react-native";
import LoginForm from "@/components/LoginForm";

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <LoginForm testID="login-screen"
        onForgotPassword={() => Alert.alert("Forgot Password Pressed!")} 
        onSignUp={() => Alert.alert("Sign Up Pressed!")} 
        onLogIn={() => Alert.alert("Log In Pressed!")} 
      />
    </View>
  );
}
