import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from "react-native";
import MoreOptionsButton from "../buttons/MoreOptionsButton";
import Toast from "../toast/Toast";

const UserInfo: React.FC<{ 
  avatarUrl: string; 
  username: string; 
  handle: string; 
  date: string; 
  location: string; 
  locationIconUrl: string; 
  moreOptionsIconUrl: string; 
  longitude: number;
  latitude: number;
}> = ({
  avatarUrl,
  username,
  handle,
  date,
  location,
  locationIconUrl,
  moreOptionsIconUrl,
  longitude,
  latitude,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const handleReport = () => {
    setModalVisible(false);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <View style={styles.userInfo}>
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      <View style={styles.userDetails}>
        <View style={styles.userHeader}>
          <View style={styles.userNameGroup}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.handle}>{handle}</Text>
            <Text style={styles.dateInfo}> • {date}</Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.moreOptionsButton} testID="more-options-button">
            <Image source={{ uri: moreOptionsIconUrl }} style={styles.moreOptionsIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.location}>
          <Image source={{ uri: locationIconUrl }} style={styles.locationIcon} />
          <Text style={styles.location}>{location}</Text>
        </View>
      </View>

      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)} testID="more-options-modal">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)} testID="modal-overlay">
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <MoreOptionsButton closeModal={() => setModalVisible(false)} onSendMessage={() => console.log("Send Message")} onReport={handleReport} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal transparent animationType="fade" visible={toastVisible}>
        <TouchableWithoutFeedback onPress={() => setToastVisible(false)}>
          <View style={styles.toastOverlay}>
            <Toast text="Report Submitted" />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  userDetails: {
    flex: 1,
    minWidth: 264,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  userNameGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  dateInfo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7f7574",
  },
  moreOptionsButton: {
    padding: 0,
  },
  moreOptionsIcon: {
    width: 10,
    height: 20,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    color: "#7f7574",
    gap: 8,
    fontSize: 12,
    fontWeight: 400
  },
  locationIcon: {
    width: 11.3,
    height: 16.2,
  },
  coordinates: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#EEE",
    alignSelf: "flex-start",
  },
  coordText: {
    fontSize: 12,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
  },
  modalContent: {
    width: "90%",
    maxWidth: 600,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignSelf: "center",
  },
  toastOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)" 
  },
});

export default UserInfo;
