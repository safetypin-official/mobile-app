import { View, Alert } from "react-native";
import LoginForm from "@/components/LoginForm";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";


GoogleSignin.configure({
  webClientId: '77998854438-h9gj1fsua39svfoh38gftrn2c7iro2r6.apps.googleusercontent.com',
  forceCodeForRefreshToken: true,
  scopes: ["profile", "email"],
});

export const onGoogleAuth = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    console.log("success");
    console.log(userInfo.data);
  } catch (error: any) {
    console.log("error");
    console.log(error);
  }
}

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <LoginForm testID="login-screen"
        onForgotPassword={() => Alert.alert("Forgot Password Pressed!")} 
        onSignUp={() => Alert.alert("Sign Up Pressed!")} 
        onLogIn={() => Alert.alert("Log In Pressed!")}
        onGoogleAuth={onGoogleAuth} 
        onAppleAuth={() => Alert.alert("Apple Auth Pressed!")} 
      />
    </View>
  );
}
