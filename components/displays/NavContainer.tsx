import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import NavButton from "@/components/buttons/NavButton";
import MapButton from "@/components/buttons/MapButton";

interface NavContainerProps {
  activeTab?: string;
  onHomePress?: () => void;
  onChatPress?: () => void;
  onMapPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  testID?: string;
}

const validTabs = ["home", "chat", "map", "notifications", "profile"] as const;

const NavContainer: React.FC<NavContainerProps> = ({
  activeTab = "home",
  onHomePress,
  onChatPress,
  onMapPress,
  onNotificationsPress,
  onProfilePress,
  testID = "nav-container"
}) => {

  const currentTab = validTabs.includes(activeTab as any) ? activeTab : "home";

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <NavButton type="home" active={activeTab === "home"} onPress={onHomePress} />
          <NavButton type="chat" active={activeTab === "chat"} onPress={onChatPress} />
        </View>

        <MapButton active={activeTab === "map"} onPress={onMapPress} />

        <View style={styles.rightSection}>
          <NavButton type="notifications" active={activeTab === "notifications"} onPress={onNotificationsPress} />
          <NavButton type="profile" active={activeTab === "profile"} onPress={onProfilePress} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 107,
    position: "absolute",
    bottom: 0,
  },
  content: {
    width: "100%",
    height: 75,
    paddingHorizontal: 25,
    position: "absolute",
    left: 0,
    top: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default NavContainer;
