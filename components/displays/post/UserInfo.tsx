import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Alert } from "react-native";
import MoreOptionsButton from "@/components/buttons/post/MoreOptionsButton";
import Toast from "../../toasts/Toast";
import Pin from "@/components/displays/Pin";
import { authenticatedDelete } from "@/utils/api";


// Updated user interface to match new API response
export interface PostedByUser {
  id: string;
  name: string;
  profilePicture?: string;
}

// Update the props interface to include the new postedBy structure
const UserInfo: React.FC<{ 
  postedBy?: PostedByUser | null; 
  avatarUrl?: string; // Fallback avatar URL
  username?: string; // Fallback username
  handle?: string; // Fallback handle
  date: string; 
  location: string; 
  moreOptionsIconUrl: string; 
  longitude: number;
  latitude: number;
  categoryType?: string;
  postId: string;
  onPostDeleted?: () => void;
}> = ({
  postedBy,
  avatarUrl = "https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true",
  username,
  handle,
  date,
  location,
  moreOptionsIconUrl,
  longitude,
  latitude,
  categoryType = "other-crime",
  postId,
  onPostDeleted,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("Report Submitted");
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine the user display name and avatar from postedBy or fallbacks
  const displayName = postedBy?.name ?? username ?? "Anonymous";
  const displayHandle = handle ?? `@${displayName.toLowerCase().replace(/\s/g, "")}`;
  const displayAvatar = postedBy?.profilePicture ?? avatarUrl;

  const handleReport = () => {
    setModalVisible(false);
    setToastMessage("Report Submitted");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const deletePost = async () => {
    try {
      const response = await authenticatedDelete(`https://safetypin.ppl.cs.ui.ac.id/post/${postId}`);
      
      if (response.success) {
        setToastMessage("Post Deleted");
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
        
        if (onPostDeleted) {
          onPostDeleted();
        }
      } else {
        Alert.alert("Error", "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      Alert.alert("Error", "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setModalVisible(false);
      
      Alert.alert(
        "Delete Post",
        "Are you sure you want to delete this post?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: () => {
              void deletePost();
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error preparing deletion:", error);
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.userInfo}>
      <Image source={{ uri: displayAvatar }} style={styles.avatar} />
      <View style={styles.userDetails}>
        <View style={styles.userHeader}>
          <View style={styles.userNameGroup}>
            <Text 
              style={styles.username}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {displayName}
            </Text>
            <Text 
              style={styles.handle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {displayHandle}
            </Text>
            <Text style={styles.dateInfo}> • {date}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setModalVisible(true)} 
            style={styles.moreOptionsButton}
            testID="more-options-button"
          >
            <Text style={styles.moreOptionsText}>⋮</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.locationContainer}>
          <View style={styles.pinWrapper}>
            <Pin 
              type={categoryType} 
              onPress={() => {}} 
              width={16} 
              height={16}
            />
          </View>
          <Text 
            style={styles.locationText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {location}
          </Text>
        </View>
      </View>

      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)} testID="more-options-modal">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)} testID="modal-overlay">
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <MoreOptionsButton closeModal={() => setModalVisible(false)} onSendMessage={() => console.log("Send Message")} onReport={handleReport} onDelete={handleDelete}/>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal transparent animationType="fade" visible={toastVisible}>
        <TouchableWithoutFeedback onPress={() => setToastVisible(false)}>
          <View style={styles.toastOverlay}>
            <Toast text={toastMessage} />
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
    flexWrap: "nowrap",
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4d4544",
    flexShrink: 1,
  },
  handle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7f7574",
    flexShrink: 1,
  },
  dateInfo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7f7574",
    flexShrink: 0,
  },
  moreOptionsButton: {
    padding: 0,
  },
  moreOptionsIcon: {
    width: 10,
    height: 20,
  },
  moreOptionsText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#7f7574",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  pinWrapper: {
    height: 20,
    width: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#7f7574",
    flex: 1,
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