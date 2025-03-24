import React from "react";
import { View, StyleSheet } from "react-native";
import NavButton from "@/components/buttons/NavButton";
import MapButton from "@/components/buttons/MapButton";

interface NavContainerProps {
  activeTab?: string;
  onHomePress?: () => void;
  onSearchPress?: () => void;
  onMapPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  testID?: string;
}

const validTabs = ["home", "search", "map", "notifications", "profile"] as const;

const NavContainer: React.FC<NavContainerProps> = ({
  activeTab = "home",
  onHomePress,
  onSearchPress,
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
          <NavButton type="home" active={currentTab === "home"} onPress={onHomePress} />
          <NavButton type="search" active={currentTab === "search"} onPress={onSearchPress} />
        </View>

        <MapButton active={currentTab === "map"} onPress={onMapPress} />

        <View style={styles.rightSection}>
          <NavButton type="notifications" active={currentTab === "notifications"} onPress={onNotificationsPress} />
          <NavButton type="profile" active={currentTab === "profile"} onPress={onProfilePress} />
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
    boxShadow: "0 -6px 20px rgba(144, 74, 71, 0.15)",
    elevation: 4,
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
