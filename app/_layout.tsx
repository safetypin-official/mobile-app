import { router, Stack, usePathname } from "expo-router";
import { View } from "react-native";
import NavContainer from "@/components/displays/NavContainer";
import { useState, useEffect } from "react";

export default function Layout() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("map");

  const hideNavBarRoutes = ["/", "/forgotPassword", "/forgotPassword/newPasswordScreen", "/forgotPassword/otpVerificationScreen", "/signUp", "/signUp/otp", "/post"];

  // Update activeTab based on current pathname
  useEffect(() => {
    if (pathname === "/map") {
      setActiveTab("map");
    } else if (pathname === "/feedScreen") {
      setActiveTab("home");
    }
  }, [pathname]);

  const handleMapPress = () => {
    if (activeTab === "map") {
      // If already on map tab, navigate to post
      router.push("/createPost");
    } else {
      // If not on map tab, set active tab to map and navigate to map
      setActiveTab("map");
      router.replace("/map");
    }
  };

  const handleHomePress = () => {
    setActiveTab("home");
    router.replace("/feedScreen");
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack 
        screenOptions={{
          headerShown: false,  // This will hide the header for all screens
          // If you need the header on some screens but not others, you can use a more specific approach
        }}
      />
      {!hideNavBarRoutes.includes(pathname) && (
        <NavContainer
          activeTab={activeTab}
          onHomePress={handleHomePress}
          onChatPress={() => {
            setActiveTab("chat");
          }}
          onMapPress={handleMapPress}
          onNotificationsPress={() => {
            setActiveTab("notifications");
          }}
          onProfilePress={() => {
            setActiveTab("profile");
          }}
        />
      )}
    </View>
  );
}
