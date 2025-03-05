import SignUpForm from "@/components/forms/SignUpForm";
import { router } from "expo-router";
import { Alert } from "react-native";
import {
  GoogleSignin,
} from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: '77998854438-h9gj1fsua39svfoh38gftrn2c7iro2r6.apps.googleusercontent.com',
  forceCodeForRefreshToken: true,
  scopes: ["profile", "email", "https://www.googleapis.com/auth/user.birthday.read"],
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

export default function SignUpScreen() {
  const handleLogIn = () => {
    router.push("/");
  };

  return (
    <SignUpForm
      onSignUp={() => Alert.alert("Sign Up Pressed!")}
      onLogIn={handleLogIn}
      testID="signup-form"
      onGoogleAuth = {onGoogleAuth}
      onAppleAuth = {() => Alert.alert("Apple Auth Pressed!")}
    />
  );
}