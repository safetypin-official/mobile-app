import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import NavContainer from "@/components/displays/NavContainer";
import { useState } from "react";

export default function Layout() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("map");

  const hideNavBarRoutes = ["/", "/forgotPassword", "/forgotPassword/newPasswordScreen", "/forgotPassword/otpVerificationScreen", "/signUp"];

  return (
    <View style={{ flex: 1 }}>
      <Stack />
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
