import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";

interface SocialButtonProps {
  iconXml: string;
  onPress: () => void;
  testID?: string;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ iconXml, onPress, testID = "social-button" }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} testID={testID}>
      <SvgXml xml={iconXml} width={28} height={30} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
});
