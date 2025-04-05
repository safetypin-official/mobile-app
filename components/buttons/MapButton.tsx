import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { locationIcon, locationIconActive } from "@/assets/icons";

interface MapButtonProps {
  active?: boolean;
  onPress?: () => void;
  testID?: string;
}

const MapButton: React.FC<MapButtonProps> = ({ active = false, onPress, testID = "map-button" }) => {
  return (
    <TouchableOpacity style={styles.centerButton} onPress={onPress} testID={testID}>
      <SvgXml xml={active ? locationIconActive : locationIcon} width={26} height={37} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  centerButton: {
    position: "absolute",
    left: "50%",
    top: -22,
    width: 55,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    backgroundColor: "#904A47",
    elevation: 6, // Android only, safely ignored on web/iOS
  },  
});

export default MapButton;
