import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

// Update the props interface to include category type
const UserResult: React.FC<{
  id: string; 
  avatarUri: string; 
  username: string; 
  handle: string;
  onPress: () => void; // Add onPress prop for navigation
}> = ({
  id,
  avatarUri,
  username,
  handle,
  onPress, // Destructure the onPress prop
}) => {
  return (
    <TouchableOpacity onPress={onPress} testID="user-result">
        <View style={styles.userInfo}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} testID="user-avatar" />
            <View style={styles.userDetails}>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.handle}>{handle}</Text>
            </View>
        </View>
        <View style={styles.horizontalLine} testID="horizontal-line" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    paddingVertical: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 22,
  },
  userDetails: {
    flex: 1,
    width: "100%",
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4d4544",
  },
  handle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7f7574",
  },
  horizontalLine: {
    borderBottomColor: '#d3d3d3',
    borderBottomWidth: StyleSheet.hairlineWidth,
    maxWidth: '97%',
  },
});

export default UserResult;