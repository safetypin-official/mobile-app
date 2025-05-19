import React, { useState } from "react";
import { View, Text, Image, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import MoreOptionsButton from "@/components/buttons/post/MoreOptionsButton";
import CustomModal from "@/components/displays/CustomModal";
import Toast from "@/components/toasts/Toast";
import { authenticatedGet, authenticatedDelete } from "@/utils/api";
import { ReplyPagination, CommentReply } from "@/components/displays/Types";

// Type for comment replies

interface CommentSectionProps {
    avatarUrl: string;
    username: string;
    handle: string;
    date: string;
    content: string;
    commentId: string;
    onReply?: (commentId: string, username: string) => void;
    onCommentDeleted?: (commentId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
    avatarUrl,
    username,
    handle,
    date,
    content,
    commentId,
    onReply,
    onCommentDeleted,
}) => {
  const [commentConfirmDeleteVisible, setCommentConfirmDeleteVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("Report Submitted");
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentReply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesError, setRepliesError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeReplyModal, setActiveReplyModal] = useState<string | null>(null);
  const [replyConfirmDeleteId, setReplyConfirmDeleteId] = useState<string | null>(null);

  const handleReport = () => {
    setToastMessage("Report Submitted");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
    setModalVisible(false);
  };

  const triggerDeleteComment = () => {
     setModalVisible(false);
     setCommentConfirmDeleteVisible(true);
   };

  const handleDeleteComment = async () => {
    try {
      setIsDeleting(true);
      await authenticatedDelete(`https://safetypin.ppl.cs.ui.ac.id/posts/comment/onpost/${commentId}`);
      
      // Show success toast
      setToastMessage("Comment deleted successfully");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
      
      // Close the modal
      setModalVisible(false);
      
      // Clear replies display if needed
      if (showReplies) {
        setReplies([]);
        setShowReplies(false);
      }
      
      // Notify parent component that comment was deleted
      if (onCommentDeleted) {
        onCommentDeleted(commentId);
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setToastMessage("Failed to delete comment");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerDeleteReply = (replyId: string) => {
     setActiveReplyModal(null);
     setReplyConfirmDeleteId(replyId);
   };

  const handleDeleteReply = async (replyId: string) => {
    try {
      setIsDeleting(true);
      await authenticatedDelete(`https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment/${replyId}`);
      
      // Show success toast
      setToastMessage("Reply deleted successfully");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
      console.log("Deleting status:", isDeleting);
      
      // Close the modal
      setActiveReplyModal(null);
      
      // Refresh the replies
      fetchReplies();
    } catch (error) {
      console.error("Failed to delete reply:", error);
      setToastMessage("Failed to delete reply");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteComment = async () => {
    setCommentConfirmDeleteVisible(false);
    await handleDeleteComment();
  };
  
  const confirmDeleteReply = async () => {
    if (replyConfirmDeleteId) {
      const id = replyConfirmDeleteId;
      setReplyConfirmDeleteId(null);
      await handleDeleteReply(id);
    }
  };

  const fetchReplies = async () => {
    try {
      setRepliesLoading(true);
      setRepliesError(null);
      console.log(`Fetching replies for comment: ${commentId}`);
      
      const response = await authenticatedGet<ReplyPagination>(
        `https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment/${commentId}`
      );
      
      console.log("Replies Response:", response);
      // Ensure replies is always an array
      setReplies(Array.isArray(response.data.content) ? response.data.content : []);
    } catch (err) {
      console.error("Error fetching replies:", err);
      setRepliesError("Failed to load replies");
    } finally {
      setRepliesLoading(false);
    }
  };

  const toggleReplies = () => {
    if (!showReplies && replies.length === 0) {
      fetchReplies();
    }
    setShowReplies(!showReplies);
  };

  // Format date for replies
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    });
  };

  // Render replies content
  const renderRepliesContent = () => {
    if (repliesLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
          <Text style={styles.loadingText}>Loading replies...</Text>
        </View>
      );
    }
    
    if (repliesError) {
      return <Text style={styles.errorText}>{repliesError}</Text>;
    }
    
    if (!replies || replies.length === 0) {
      return <Text style={styles.noRepliesText}>No replies yet</Text>;
    }
    
    return replies.map((reply) => (
      <View key={reply.id} style={styles.replyItem}>
        <Image 
          source={{ 
            uri: reply.postedBy?.profilePicture ?? 
                "https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true" 
          }} 
          style={styles.replyAvatar} 
        />
        <View style={styles.replyContent}>
          <View style={styles.replyHeader}>
            <Text 
              style={styles.replyUsername}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {reply.postedBy?.name ?? "Anonymous"}
            </Text>
            <Text 
              style={styles.replyHandle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              @{(reply.postedBy?.name ?? "anonymous").toLowerCase().replace(/\s/g, "")}
            </Text>
            <Text style={styles.replyDate}>
              • {formatDate(reply.createdAt)}
            </Text>
          </View>
          <Text style={styles.replyText}>{reply.caption}</Text>
        </View>
        
        {/* Add more options button for each reply */}
        <TouchableOpacity
          testID={`reply-more-options-button-${reply.id}`}
          onPress={() => setActiveReplyModal(reply.id)}
          style={styles.replyMoreOptionsButton}
        >
          <Text style={styles.moreOptionsText}>⋮</Text>
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <View style={styles.comment}>
      <View style={styles.commentContent}>
        <Image source={{ uri: avatarUrl }} style={styles.commentAvatar} />
        <View style={styles.commentDetails}>
          <View style={styles.commentHeader}>
            <View style={styles.commentUser}>
              <Text 
                style={styles.commentUsername}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {username}
              </Text>
              <Text 
                style={styles.commentHandle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {handle}
              </Text>
              <Text style={styles.commentDate}>
                • {date}
              </Text>
            </View>
          </View>
          <View style={styles.commentBody}>
            <Text style={styles.commentText}>{content}</Text>
            <View style={styles.commentActionsRow}>
              {!!commentId && (
                <TouchableOpacity onPress={toggleReplies} style={styles.viewRepliesButton}>
                  <Text style={styles.viewRepliesText}>
                    {showReplies ? "Hide replies" : "View replies"}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={() => onReply?.(commentId, username)} 
                style={styles.replyButton}
              >
                <Text style={styles.replyButtonText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
            testID="more-options-button"
            onPress={() => setModalVisible(true)}
            style={styles.moreOptionsButton}
        >
            <Text style={styles.moreOptionsText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Replies section */}
      {showReplies && (
        <View style={styles.repliesContainer}>
          {renderRepliesContent()}
        </View>
      )}

      {/* Modal for reply options */}
      {activeReplyModal && (
        <Modal 
          transparent 
          animationType="fade" 
          visible={!!activeReplyModal} 
          onRequestClose={() => setActiveReplyModal(null)}
          testID="reply-options-modal"
        >
          <TouchableWithoutFeedback 
            onPress={() => setActiveReplyModal(null)} 
            testID="reply-modal-overlay"
            accessible={false}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <MoreOptionsButton 
                    closeModal={() => (null)} 
                    onSendMessage={() => {console.log("Send Message")}} 
                    onReport={handleReport} 
                    onDelete={() => triggerDeleteReply(activeReplyModal)}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Reply‐delete confirmation */}
      <CustomModal
        visible={!!replyConfirmDeleteId}
        testID="delete-reply-confirmation-modal"
        title="Delete Reply"
        message="Are you sure you want to delete this reply?"
        cancelText="Cancel"
        okText="Delete"
        onCancel={() => setReplyConfirmDeleteId(null)}
        onOk={confirmDeleteReply}
      />

      <Modal transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        testID="more-options-modal"
      >
        <TouchableWithoutFeedback 
          onPress={() => setModalVisible(false)} 
          testID="modal-overlay"
          accessible={false}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <MoreOptionsButton
                  closeModal={() => setModalVisible(false)}
                  onSendMessage={() => {console.log("Send Message")}}
                  onReport={handleReport}
                  onDelete={triggerDeleteComment}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Comment‐delete confirmation */}
      <CustomModal
        visible={commentConfirmDeleteVisible}
        testID="delete-comment-confirmation-modal"
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        cancelText="Cancel"
        okText="Delete"
        onCancel={() => setCommentConfirmDeleteVisible(false)}
        onOk={confirmDeleteComment}
      />

      <Modal transparent animationType="fade" visible={toastVisible}>
        <TouchableWithoutFeedback onPress={() => setToastVisible(false)} testID="toast-message">
            <View style={styles.toastOverlay}>
            <Toast text={toastMessage}/>
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
        maxWidth: "85%",
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
        width: "100%",
    },
    commentUser: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        flexWrap: "nowrap",
        maxWidth: "90%",
    },
    commentUsername: {
        color: "#4D4544",
        fontSize: 14,
        fontWeight: "700",
        maxWidth: 100,
        flexShrink: 1,
    },
    commentHandle: {
        color: "#7F7574",
        fontSize: 14,
        fontWeight: "700",
        marginRight: 2,
        maxWidth: 150,
        flexShrink: 1,
    },
    commentDate: {
        color: "#7F7574",
        fontSize: 14,
        fontWeight: "400", // Sedikit lebih ringan dari handle
        flexShrink: 0, // Jangan biarkan date menyusut
    },
    commentText: {
        color: "#7F7574",
        fontSize: 12,
        fontWeight: "500",
        lineHeight: 14,
        marginVertical: 8,
    },
    commentActionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginTop: 4,
    },
    moreOptionsButton: {
        padding: 5,
        minWidth: 30,
        alignItems: 'center',
    },
    moreOptionsText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#7F7574",
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
    viewRepliesButton: {
        marginTop: 0,
    },
    viewRepliesText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#9F3F3D",
    },
    replyButton: {
        marginTop: 0,
    },
    replyButtonText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#9F3F3D",
    },
    repliesContainer: {
        marginLeft: 40,
        marginTop: 8,
        borderLeftWidth: 1,
        borderLeftColor: "#E5E5E5",
        paddingLeft: 12,
    },
    replyItem: {
        flexDirection: "row",
        marginTop: 8,
        gap: 8,
    },
    replyAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    replyContent: {
        flex: 1,
    },
    replyHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    replyUsername: {
        fontSize: 12,
        fontWeight: "700",
        color: "#4D4544",
        maxWidth: 70,
        flexShrink: 1,
    },
    replyHandle: {
        fontSize: 12,
        fontWeight: "500",
        color: "#7F7574",
        maxWidth: 80,
        flexShrink: 1,
    },
    replyDate: {
        fontSize: 12,
        fontWeight: "400",
        color: "#7F7574",
        flexShrink: 0,
    },
    replyText: {
        fontSize: 11,
        color: "#7F7574",
        marginTop: 2,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        gap: 8,
    },
    loadingText: {
        fontSize: 12,
        color: "#666",
    },
    errorText: {
        fontSize: 12,
        color: "red",
        padding: 8,
    },
    noRepliesText: {
        fontSize: 12,
        color: "#666",
        padding: 8,
        fontStyle: "italic",
    },
    replyMoreOptionsButton: {
        padding: 3,
        minWidth: 20,
        alignItems: 'center',
        marginLeft: 'auto',
    },
});

export default CommentSection;