import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { homeIconActive, homeIcon, chatIcon, bellIcon, userIcon, chatIconActive, bellIconActive, userIconActive } from "@/assets/icons";

interface NavButtonProps {
  type?: string;
  active?: boolean;
  onPress?: () => void;
  testID?: string;
}

const icons = {
  home: { active: homeIconActive, inactive: homeIcon },
  chat: { active: chatIconActive, inactive: chatIcon },
  notifications: { active: bellIconActive, inactive: bellIcon },
  profile: { active: userIconActive, inactive: userIcon },
};

const NavButton: React.FC<NavButtonProps> = ({ type = "home", active = false, onPress, testID = `nav-button-${type}` }) => {
  const validType = (type in icons) ? (type as keyof typeof icons) : "home";
  
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress} testID={testID} >
      <SvgXml
        xml={active ? icons[validType].active : icons[validType].inactive}
        width={24}
        height={24}
        stroke={active ? "none" : "#AF8784"}
        fill={active ? "#904A47" : "none"}
      />
      {active &&
      <Text style={[styles.navText, active && styles.activeText]}>
        {validType[0].toUpperCase() + validType.slice(1).toLowerCase()}
      </Text>
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  navItem: {
    width: 70,
    height: 75,
    paddingVertical: 12.5,
    paddingHorizontal: 15,
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
  },
  navText: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  activeText: {
    color: "#904A47",
  },
});

export default NavButton;
