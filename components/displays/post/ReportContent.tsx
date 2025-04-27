import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Dimensions,
  Pressable,
  Share
} from "react-native";
import ReportTags, { TAG_KEYS } from "./ReportTags";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import UserInteraction from '@/components/displays/post/UserInteraction';
import { authenticatedDelete, authenticatedPost } from "@/utils/api";

type TagKey = (typeof TAG_KEYS)[number];

interface ReportContentProps {
  title: string;
  content: string;
  likeCount: number;
  dislikeCount: number;
  selectedTags: TagKey[];
  imageUrl?: string;
  postId: string;
  currentVote?: string;
}

const ReportContent: React.FC<ReportContentProps> = ({
  title,
  content,
  likeCount: initialLikeCount,
  dislikeCount: initialDislikeCount,
  selectedTags,
  imageUrl,
  postId,
  currentVote = 'NONE',
}) => {
  const [likes, setLikes] = useState(initialLikeCount);
  const [dislikes, setDislikes] = useState(initialDislikeCount);
  
  // Initialize colors based on currentVote
  const [likeColor, setLikeColor] = useState(currentVote === 'UPVOTE' ? "#5E9F3D" : "#7F7574");
  const [dislikeColor, setDislikeColor] = useState(currentVote === 'DOWNVOTE' ? "#904A47" : "#7F7574");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookmarkClick = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleLikeClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      if (likeColor === "#7F7574") {
        // User is liking the post
        setLikes(prevLikes => prevLikes + 1);
        setLikeColor("#5E9F3D");

        const response = await authenticatedPost(`https://safetypin.ppl.cs.ui.ac.id/posts/vote/upvote?postId=${postId}`, {});
        console.log('Upvote response:', response);
        
        if (dislikeColor === "#904A47") {
          // If post was previously disliked, remove the dislike
          setDislikes(prevDislikes => prevDislikes - 1);
          setDislikeColor("#7F7574");
        }
      } else {
        // User is canceling their like
        setLikes(prevLikes => prevLikes - 1);
        setLikeColor("#7F7574");

        const response = await authenticatedDelete(`https://safetypin.ppl.cs.ui.ac.id/posts/vote/cancel-vote?postId=${postId}`, {});
        console.log('Cancel vote response:', response);
      }
    } catch (error) {
      console.error('Error updating vote:', error);
      // Revert UI changes if API call fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleDislikeClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      if (dislikeColor === "#7F7574") {
        // User is disliking the post
        setDislikes(prevDislikes => prevDislikes + 1);
        setDislikeColor("#904A47");

        const response = await authenticatedPost(`https://safetypin.ppl.cs.ui.ac.id/posts/vote/downvote?postId=${postId}`, {});
        console.log('Downvote response:', response);

        if (likeColor === "#5E9F3D") {
          // If post was previously liked, remove the like
          setLikes(prevLikes => prevLikes - 1);
          setLikeColor("#7F7574");
        }
      } else {
        // User is canceling their dislike
        setDislikes(prevDislikes => prevDislikes - 1);
        setDislikeColor("#7F7574");

        const response = await authenticatedDelete(`https://safetypin.ppl.cs.ui.ac.id/posts/vote/cancel-vote?postId=${postId}`, {});
        console.log('Cancel vote response:', response);
      }
    } catch (error) {
      console.error('Error updating vote:', error);
      // Revert UI changes if API call fails
    } finally {
      setIsLoading(false);
    }
  };

  const openImageModal = () => {
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
  };

  const handleShareClick = async () => {
    try {
      // Create the safetypin deep link if postId is provided
      const universalLink = `https://safety-pin.up.railway.app/open-post/${postId}`;
      
      
      let message = `${title}\n\n${content}`;

      message += `\n\n${universalLink}`;
      
      const shareOptions = {
        title: title,
        message: message,
        url: universalLink // Prioritize the deep link if available
      };
      
      const result = await Share.share(shareOptions);
      
      console.log('Shared content:', result);
    } catch (error) {
      console.error('Error sharing content:', error);
    }
  };

  return (
    <View style={styles.reportContent}>
      <TouchableOpacity 
        style={styles.imageContainer} 
        activeOpacity={imageUrl ? 0.9 : 1}
        onPress={openImageModal}
        disabled={!imageUrl}
        testID="image-container"
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            testID="image"
          />
        ) : (
          <View style={styles.placeholderImage} testID="placeholder-image" />
        )}
      </TouchableOpacity>
      <View style={styles.tagsContainer}>
        <ReportTags selectedTags={selectedTags} />
      </View>
      <View style={styles.contentText}>
        <Text style={styles.contentTitle}>{title}</Text>
        <Text style={styles.contentDescription}>{content}</Text>
      </View>
      <View style={styles.interactions}>
        <View style={styles.interactionButtons}>
          <View style={styles.actionButton} testID="like-button">
            <UserInteraction
              type="like-icon"
              onPress={handleLikeClick}
              width={18}
              height={18}
              fill={likeColor}  // Pass dynamic likeColor instead of hardcoded value
            />
            <Text testID="like-count" style={[styles.countText, { color: likeColor }]}>{likes}</Text>
          </View>
          <View style={styles.actionButton} testID="dislike-button">
            <UserInteraction
              type="dislike-icon"
              onPress={handleDislikeClick}
              width={18}
              height={18}
              fill={dislikeColor}  // Pass dynamic dislikeColor instead of hardcoded value
            />
            <Text testID="dislike-count" style={[styles.countText, { color: dislikeColor }]}>{dislikes}</Text>
          </View>
          <View style={styles.actionButton} testID="dislike-button">
            <UserInteraction
              type="comment-icon"
              onPress={handleDislikeClick}
              width={22}
              height={22}
            />
            <Text testID="comment-icon" style={[styles.countText, { color: dislikeColor }]}>{dislikes}</Text>
          </View>
        </View>
        <View style={styles.shareActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleBookmarkClick} testID="bookmark-button">
            <FontAwesome name={isBookmarked ? "bookmark" : "bookmark-o"} size={20} color="#7F7574" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShareClick} testID="share-button">
            <MaterialCommunityIcons name="share-variant-outline" size={20} color="#7F7574" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Full Screen Image Modal */}
      {imageModalVisible && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={imageModalVisible}
          onRequestClose={closeImageModal}
          testID="modal"
        >
          <SafeAreaView style={styles.modalContainer} testID="modal-container">
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeImageModal} style={styles.closeButton} testID="close-button">
                <FontAwesome name="times" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Pressable 
              style={styles.modalImageContainer} 
              onPress={closeImageModal}
              testID="modal-backdrop"
            >
              {imageUrl && (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.modalImage}
                  resizeMode="contain"
                  testID="modal-image"
                />
              )}
            </Pressable>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  reportContent: {
    width: "100%",
  },
  imageContainer: {
    backgroundColor: "#77565433",
    width: "100%",
    minHeight: 200,
    maxHeight: 300,
    marginTop: 10,
    overflow: "hidden",
  },
  tags: {
    flexDirection: "row",
    gap: 4,
    marginTop: 10,
  },
  tagsContainer: {
    marginTop: 10,
    marginLeft: 0
  },
  tagButton: {
    backgroundColor: "#9F3F3D",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 25,
    paddingHorizontal: 20,
    paddingVertical: 3,
  },
  tagIcon: {
    width: 16,
    height: 16,
  },
  tagText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  contentText: {
    width: "100%",
    marginTop: 10,
  },
  contentTitle: {
    color: "#4D4544",
    fontSize: 16,
    fontWeight: "700",
  },
  contentDescription: {
    color: "#7F7574",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    marginTop: 4,
  },
  interactions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    width: "100%",
    marginTop: 10,
  },
  interactionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionIcon: {
    width: 24,
    height: 24,
  },
  countText: {
    fontSize: 14,
    fontWeight: "500",
  },
  shareActions: {
    flexDirection: "row",
    gap: 8,
  },
  placeholderImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#77565433",
  },
  image: {
    width: "100%",
    height: 228,
    resizeMode: "cover",
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  modalHeader: {
    height: 50,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 15,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: windowWidth,
    height: windowHeight - 100,
  },
});

export default ReportContent;
export type { ReportContentProps, TagKey };