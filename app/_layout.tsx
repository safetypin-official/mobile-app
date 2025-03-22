import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import NavContainer from "@/components/displays/NavContainer";
import { useState } from "react";

export default function Layout() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("map");

  const hideNavBarRoutes = ["/", "/forgotPassword", "/forgotPassword/newPasswordScreen", "/forgotPassword/otpVerificationScreen", "/signUp", "/signUp/otp"];

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Log In' }} />
        <Stack.Screen name="forgotPassword/index" options={{ title: 'Forgot Password' }} />
        <Stack.Screen name="signUp/index" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="otpVerificationScreen" options={{ title: "OTP Verification" }} />
        <Stack.Screen name="nearbyReport/index" options={{ title: "Nearby Report" }} />
      </Stack>

      {!hideNavBarRoutes.includes(pathname) && (
        <NavContainer
          activeTab={activeTab}
          onHomePress={() => setActiveTab("home")}
          onChatPress={() => setActiveTab("chat")}
          onMapPress={() => setActiveTab("map")}
          onNotificationsPress={() => setActiveTab("notifications")}
          onProfilePress={() => setActiveTab("profile")}
        />
      )}
    </View>
  );
}
