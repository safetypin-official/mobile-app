import { router, Stack, usePathname } from "expo-router";
import { View, AppState, AppStateStatus } from "react-native";
import NavContainer from "@/components/displays/NavContainer";
import { useState, useEffect } from "react";
import { getAuthData } from "@/utils/auth";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://769eb726ddaa03cc0e48f597ea4f5b73@o4509202885312512.ingest.us.sentry.io/4509202886361088',

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
  // profilesSampleRate is relative to tracesSampleRate.
  // Here, we'll capture profiles for 100% of transactions.
  profilesSampleRate: 1.0,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function Layout() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("map");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [appReady, setAppReady] = useState(false);

  const hideNavBarRoutes = ["/", "/forgotPassword", "/forgotPassword/newPasswordScreen", "/forgotPassword/otpVerificationScreen", "/signUp", "/signUp/otp", "/createPost", "/post"];

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
      {!(hideNavBarRoutes.includes(pathname) || pathname.startsWith('/post/')) && (
        <NavContainer
          activeTab={activeTab}
          onHomePress={handleHomePress}
          onSearchPress={handleSearchPress}
          onMapPress={handleMapPress}
          onNotificationsPress={() => {
            setActiveTab("notifs");
            router.replace("/notifs");
          }}
          onProfilePress={() => {
            setActiveTab("profile");
            router.replace("/profile");
          }}
        />
      )}
    </View>
  );
});