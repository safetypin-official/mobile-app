import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: object;
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onPress, style, testID = "button" }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} testID={testID}>
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#9f3f3d",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});

export default Button;
