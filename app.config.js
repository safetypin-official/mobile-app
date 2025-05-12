import 'dotenv/config';

export default {
  expo: {
    name: "safety-pin",
    slug: "safety-pin",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "safetypin",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.safetypin",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ["location", "fetch", "remote-notification"],
        NSLocationAlwaysAndWhenInUseUsageDescription: "SafetyPin needs your location for friend tracking and safety features even when the app is closed.",
        NSLocationWhenInUseUsageDescription: "SafetyPin needs your location to show you nearby safety reports."
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      },
      associatedDomains: ["applinks:safetypin.ppl.cs.ui.ac.id"]
    },
    android: {
      package: "com.safetypin",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      intentFilters: [
        {
          action: "VIEW",
          category: ["DEFAULT", "BROWSABLE"],
          data: {
            scheme: "safetypin"
          }
        }
      ],
      permissions: [
        "ACCESS_BACKGROUND_LOCATION",
        "ACCESS_COARSE_LOCATION", 
        "ACCESS_FINE_LOCATION",
        "FOREGROUND_SERVICE",
        "WAKE_LOCK",
        "RECEIVE_BOOT_COMPLETED"
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: "com.googleusercontent.apps.77998854438-r4jmipgt2l3r6ge0het3f5v3lqeo8gue"
        }
      ],
      [
        "@sentry/react-native/expo",
        {
          "url": "https://sentry.io/",
          "project": "react-native",
          "organization": "safety-pin"
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "SafetyPin needs your location to enable friend tracking and safety alerts even when the app is closed.",
          "locationAlwaysPermission": "SafetyPin needs background location access to enable friend tracking and safety alerts even when the app is closed.",
          "locationWhenInUsePermission": "SafetyPin needs your location to show you nearby safety reports and enable friend tracking.",
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "bb07147f-741f-4cb1-bb77-bf387ad92f49"
      }
    },
    cli: {
      appVersionSource: "remote"
    },
    owner: "keego"
  }
};
