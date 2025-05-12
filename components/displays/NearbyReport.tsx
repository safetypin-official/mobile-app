import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, Modal, TouchableWithoutFeedback } from "react-native";
import UserInfo from "@/components/displays/post/UserInfo";
import ReportContent, { TagKey } from "@/components/displays/post/ReportContent";
import CommentInput from "@/components/inputs/post/CommentInput";
import ReplyBanner from "@/components/inputs/post/ReplyBanner";
import { authenticatedGet, authenticatedPost } from "@/utils/api";
import CommentSection from "./post/CommentSection";
import Toast from "@/components/toasts/Toast";

export type Post = {
  currentVote: string;
  downvoteCount: number;
  upvoteCount: number;
  address?: string | null;
  id: string;
  caption: string;
  createdAt: string;
  postedBy?: {
    userId: string;
    name: string;
    profilePicture?: string;
  } | null;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
  commentCount?: number;
};

// Add these types under your existing types
type CommentUser = {
  userId: string;
  name: string;
  profilePicture?: string;
};

type Comment = {
  id: string;
  caption: string;
  postedBy: CommentUser;
  postedById: string;
  createdAt: string;
};

type CommentPagination = {
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  currentPage: number;
  content: Comment[];
};

// Define the component props
interface NearbyReportProps {
  initialPost?: Post;
  postId?: string;
  onClose?: () => void;
}

const NearbyReport: React.FC<NearbyReportProps> = ({ initialPost, postId, onClose }) => {
  const [post, setPost] = useState<Post | undefined>(initialPost);
  const [isLoading, setIsLoading] = useState<boolean>(!initialPost && !!postId);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [activeReply, setActiveReply] = useState<{ commentId: string; username: string } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    // If we already have a post or no ID, don't fetch
    if (initialPost || !postId) {
      return;
    }

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching post with ID: ${postId}`);
        
        // Use the authenticatedGet function instead of axios
        const response = await authenticatedGet<Post>(
          `https://safetypin.ppl.cs.ui.ac.id/posts/${postId}`
        );
        
        console.log("API Response:", response);
        setPost(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, initialPost]);

  useEffect(() => {
    // If we have a post with an ID, fetch comments
    if (post?.id) {
      fetchComments(post.id);
    }
  }, [post?.id]);

  // Add this function within the component
  const fetchComments = async (id: string) => {
    try {
      setCommentsLoading(true);
      console.log(`Fetching comments for post: ${id}`);
      
      const response = await authenticatedGet<CommentPagination>(
        `https://safetypin.ppl.cs.ui.ac.id/posts/comment/onpost/${id}`
      );
      
      console.log("Comments Response:", response);
      setComments(response.data.content);
      setCommentsError(null);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setCommentsError("Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentSubmit = async (comment: string) => {
    if (!post?.id || !comment.trim()) {
      return;
    }
    
    try {
      if (activeReply) {
        // Submitting a reply to a comment
        console.log(`Submitting reply to comment: ${activeReply.commentId}`);
        
        const response = await authenticatedPost(
          'https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment',
          {
            caption: comment,
            parentId: activeReply.commentId
          }
        );
        
        console.log("Reply submission response:", response);
        
        // Clear the active reply state
        setActiveReply(null);
        
        // Refresh the comments list which includes replies
        fetchComments(post.id);
      } else {
        // Submitting a comment on the post
        console.log(`Submitting comment for post: ${post.id}`);
        
        const response = await authenticatedPost(
          'https://safetypin.ppl.cs.ui.ac.id/posts/comment/onpost',
          {
            caption: comment,
            parentId: post.id
          }
        );
        
        console.log("Comment submission response:", response);
        
        // Refresh the comments list
        fetchComments(post.id);
      }
    } catch (err) {
      console.error("Error submitting comment/reply:", err);
      // You could also set an error state here to show to the user
    }
  };

  const handleReplyStart = (commentId: string, username: string) => {
    setActiveReply({ commentId, username });
  };

  const handleCommentDeleted = (commentId: string) => {
    // Show success toast
    setToastMessage("Comment deleted successfully");
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
    
    // Option 2: Refetch all comments from the server
    if (post?.id) {
      fetchComments(post.id);
    }
  };

  // Format date to more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    });
  };
  
  const getCategoryTags = (): TagKey[] => {
    if (post?.category) {
      return [post.category as TagKey];
    }
    return [];
  }

  // Display loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading post {postId}...</Text>
      </View>
    );
  }

  // Display error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.detailText}>Post ID: {postId}</Text>
      </View>
    );
  }

  // Display when post not found
  if (!post) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Post not found</Text>
        <Text style={styles.detailText}>Post ID: {postId}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollableContent}>
        <View style={styles.mainContent}>
          <View style={styles.contentWrapper}>
            <UserInfo
              postedBy={post.postedBy}
              date={formatDate(post.createdAt)}
              location={post.address ?? "Nearby"}
              moreOptionsIconUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/43f6a47c22e1c702925915e6626ae6f483d1e56e047a9647d4ff9e5de9751425?placeholderIfAbsent=true"
              longitude={post.longitude}
              latitude={post.latitude}
              categoryType={post.category}
              postId={post.id}
              onPostDeleted={onClose}
            />

            <ReportContent
              title={post.title}
              content={post.caption}
              likeCount={post.upvoteCount ?? 0}
              dislikeCount={post.downvoteCount ?? 0}
              selectedTags={getCategoryTags()}
              imageUrl={post.imageUrl ?? "https://i.imgur.com/Ha3UkA3.jpg"}
              postId={post.id}
              currentVote={post.currentVote || "NONE"}
            />

            <View style={styles.divider} />

            {/* Show loading indicator while comments are loading */}
            {commentsLoading && (
              <View style={styles.commentsLoader}>
                <ActivityIndicator size="small" color="#0000ff" />
                <Text style={styles.loadingText}>Loading comments...</Text>
              </View>
            )}

            {/* Show error message if comments failed to load */}
            {commentsError && (
              <Text style={styles.errorText}>{commentsError}</Text>
            )}

            {/* Display all fetched comments */}
            {comments.map((comment) => (
              <CommentSection
                key={comment.id}
                commentId={comment.id}
                avatarUrl={comment.postedBy?.profilePicture ?? "https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true"}
                username={comment.postedBy?.name ?? "Anonymous"}
                handle={`@${(comment.postedBy?.name ?? "anonymous").toLowerCase().replace(/\s/g, "")}`}
                date={formatDate(comment.createdAt)}
                content={comment.caption}
                onReply={handleReplyStart}
                onCommentDeleted={handleCommentDeleted}
              />
            ))}

            {/* Add empty View to provide extra space below the last comment */}
            <View style={{ height: 80 }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.commentInputWrapper}>
        {activeReply && (
          <ReplyBanner 
            username={activeReply.username} 
            onCancel={() => setActiveReply(null)} 
          />
        )}
        <CommentInput 
          onSubmit={handleCommentSubmit} 
        />
      </View>

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
  container: {
    flex: 1,
    backgroundColor: "#FEFEFE",
    marginBottom: 0
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  scrollableContent: {
    flex: 1,
    paddingBottom: 120,
  },
  tagsContainer: {
    margin: 10
  },
  mainContent: {
    flex: 1,
    width: "100%",
    marginTop: 29,
    paddingHorizontal: 24,
  },
  contentWrapper: {
    flexDirection: "column",
    width: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  commentInputWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    backgroundColor: "#FEFEFE",
    zIndex: 10,
    paddingVertical: 10,
  },
  commentsLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  toastOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default NearbyReport;