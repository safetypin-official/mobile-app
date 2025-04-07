import { router, Stack, usePathname, Slot } from "expo-router";
import { View, AppState, AppStateStatus } from "react-native";
import NavContainer from "@/components/displays/NavContainer";
import { useState, useEffect } from "react";
import { getAuthData } from "@/utils/auth";

export default function Layout() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("map");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [appReady, setAppReady] = useState(false);

  const hideNavBarRoutes = ["/", "/forgotPassword", "/forgotPassword/newPasswordScreen", "/forgotPassword/otpVerificationScreen", "/signUp", "/signUp/otp", "/post", "/profile"];

  // Check auth status on mount and app state changes
  useEffect(() => {
    async function initialCheckAuth() {
      try {
        const { token } = await getAuthData();
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setIsAuthenticated(false);
      } finally {
        setAppReady(true);
      }
    }
    
    initialCheckAuth();

    // Handle app state changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        async function recheckAuth() {
          const { token } = await getAuthData();
          setIsAuthenticated(!!token);
        }
        recheckAuth();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  // Update activeTab based on current pathname
  useEffect(() => {
    if (pathname === "/map") {
      setActiveTab("map");
    } else if (pathname === "/feedScreen") {
      setActiveTab("home");
    } else if (pathname === "/search") {
      setActiveTab("search");
    }
  }, [pathname]);

  // Handle navigation based on auth status AFTER the component mounts
  useEffect(() => {
    if (!appReady) return;

    if (isAuthenticated && ["/", "/signUp", "/forgotPassword"].some(route => 
      pathname === route || pathname.startsWith(route + '/'))) {
      router.replace('/map');
    }
    
    if (!isAuthenticated && pathname !== "/" && 
        !pathname.startsWith("/signUp") && 
        !pathname.startsWith("/forgotPassword")) {
      router.replace('/');
    }
  }, [isAuthenticated, pathname, appReady]);

  // Your existing navigation handlers
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

  const handleSearchPress = () => {
    setActiveTab("search");
    router.replace("/search");
  };

  // Always render the layout with Stack first
  return (
    <View style={{ flex: 1 }}>
      <Stack 
        screenOptions={{
          headerShown: false,
        }}
      />
      {!hideNavBarRoutes.includes(pathname) && (
        <NavContainer
          activeTab={activeTab}
          onHomePress={handleHomePress}
          onSearchPress={handleSearchPress}
          onMapPress={handleMapPress}
          onNotificationsPress={() => {
            setActiveTab("notifs");
          }}
          onProfilePress={() => {
            setActiveTab("profile");
            router.replace("/profile");
          }}
        />
      )}
    </View>
  );
}
