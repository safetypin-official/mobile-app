import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";

const screenWidth = Dimensions.get("window").width;

interface MoreOptionsButtonProps {
  onSendMessage: () => void;
  onDelete: () => void;
  onReport: () => void;
  closeModal: () => void;
}

const MoreOptionsButton: React.FC<MoreOptionsButtonProps> = ({ onSendMessage, onReport, onDelete, closeModal }) => {
  return (
    <View style={styles.frameParent}>
      <TouchableOpacity
        style={styles.chatDotsParent}
        onPress={() => {
          onSendMessage();
          closeModal();
        }}
        testID="send-message"
      >
        <Ionicons name="chatbubble-ellipses-outline" size={16} color="black" />
        <Text style={styles.sendMessage}>Send Message</Text>
      </TouchableOpacity>

      <View style={styles.instanceChild} />

      <TouchableOpacity
        style={styles.exclamationCircleParent}
        onPress={() => {
          onDelete();
          closeModal();
        }}
        testID="delete-post"
      >
        <AntDesign name="delete" size={16} color="#904a47" borderRadius={100} />
        <Text style={styles.report}>Delete</Text>
      </TouchableOpacity>

      <View style={styles.instanceChild1} />

      <TouchableOpacity
        style={styles.exclamationCircleParent}
        onPress={() => {
          onReport();
          closeModal();
        }}
        testID="report-post"
      >
        <AntDesign name="exclamationcircleo" size={16} color="#904a47" borderRadius={100} />
        <Text style={styles.report}>Report</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  frameParent: {
    width: "90%",
    maxWidth: screenWidth * 0.8,
    borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 12,
    textAlign: "center",
    alignSelf: "center",
  },
  chatDotsParent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    width: "100%",
  },
  sendMessage: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4d4544",
    letterSpacing: 0.1,
    lineHeight: 20,
    fontFamily: "Inter",
    marginLeft: 6,
  },
  instanceChild: {
    width: "100%",
    height: 2,
    backgroundColor: "#d9d9d9",
  },
  instanceChild1: {
    width: "100%",
    height: 1.5,
    backgroundColor: "#d9d9d9",
  },
  exclamationCircleParent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  report: {
    justifyContent: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#904a47",
    letterSpacing: 0.1,
    lineHeight: 20,
    fontFamily: "Inter",
    marginLeft: 6,
  },
});

export default MoreOptionsButton;