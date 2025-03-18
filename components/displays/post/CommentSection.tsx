import React, { useState } from "react";
import { View, Text, Image, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from "react-native";
import MoreOptionsButton from "@/components/buttons/post/MoreOptionsButton";
import Toast from "@/components/toast/Toast";

interface CommentSectionProps {
    avatarUrl: string;
    username: string;
    handle: string;
    date: string;
    content: string;
    likeCount: number;
    likeIconUrl: string;
    moreOptionsIconUrl: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
    avatarUrl,
    username,
    handle,
    date,
    content,
    likeCount,
    likeIconUrl,
    moreOptionsIconUrl,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const handleReport = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
    setModalVisible(false);
  };

  return (
    <View style={styles.comment}>
      <View style={styles.commentContent}>
        <Image source={{ uri: avatarUrl }} style={styles.commentAvatar} />
        <View style={styles.commentDetails}>
          <View style={styles.commentHeader}>
            <View style={styles.commentUser}>
              <Text style={styles.commentUsername}>{username}</Text>
              <Text style={styles.commentHandle}>
                {handle} • {date}
              </Text>
            </View>
          </View>
          <View style={styles.commentBody}>
            <Text style={styles.commentText}>{content}</Text>
            <View style={styles.commentActions}>
              <TouchableOpacity style={styles.likeButton}>
                <Image source={{ uri: likeIconUrl }} style={styles.actionIcon} />
                <Text style={styles.countText}>{likeCount}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
            testID="more-options-button"
            onPress={() => setModalVisible(true)}
            style={styles.moreOptionsButton}
            >
            <Image source={{ uri: moreOptionsIconUrl }} style={styles.moreOptionsIcon} />
        </TouchableOpacity>
      </View>

      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)} testID="more-options-modal">
        <TouchableWithoutFeedback 
          onPress={() => setModalVisible(false)} 
          testID="modal-overlay"
          accessible={false}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <MoreOptionsButton onSendMessage={() => {console.log("Send Message")}} onReport={handleReport} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal transparent animationType="fade" visible={toastVisible}>
        <TouchableWithoutFeedback onPress={() => setToastVisible(false)} testID="report-submitted">
            <View style={styles.toastOverlay}>
            <Toast text="Report Submitted"/>
            </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    comment: {
        backgroundColor: "#FEFEFE",
        width: "100%",
        marginTop: 10,
        padding: 11,
    },
    commentContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 11,
        width: "100%",
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    commentDetails: {
        flex: 1,
        width: "100%",
        minWidth: 0,
    },
    commentBody: {
        flex: 1,
        width: "100%",
        minWidth: 0,
    },
    commentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        width: "100%",
    },
    commentUser: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    commentUsername: {
        color: "#4D4544",
        fontSize: 14,
        fontWeight: "700",
    },
    commentHandle: {
        color: "#7F7574",
        fontSize: 14,
        fontWeight: "700",
        marginRight: 2,
    },
    commentText: {
        color: "#7F7574",
        fontSize: 12,
        fontWeight: "500",
        lineHeight: 14,
        marginVertical: 11,
    },
    commentActions: {
        flexDirection: "row",
        alignItems: "center",
    },
        likeButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    actionIcon: {
        width: 24,
        height: 24,
    },
    countText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#4D4544",
    },
    moreOptionsButton: {
        padding: 0,
    },
    moreOptionsIcon: {
        width: 10,
        height: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
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

export default CommentSection;