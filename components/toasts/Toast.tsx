import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface ToastProps {
  text: string; // Removed ? to make it required
  icon?: JSX.Element;
}

const screenWidth = Dimensions.get("window").width;

const Toast: React.FC<ToastProps> = ({
  text, // Removed default value
  icon = <AntDesign name="exclamationcircleo" size={16} color="#904a47" />,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.iconTextContainer}>
          {icon}
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    maxWidth: screenWidth * 0.8,
    borderRadius: 15,
    backgroundColor: "#FEFEFE",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
    textAlign: "center",
    alignSelf: "center",
  },
  innerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
  },
  text: {
    letterSpacing: 0.43,
    lineHeight: 21,
    fontWeight: "500",
    fontSize: 17,
    color: "#904a47",
  },
});

export default Toast;