import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from "react-native";
import UserInfo from "@/components/displays/post/UserInfo";
import ReportContent, { TagKey } from "@/components/displays/post/ReportContent";
import CommentInput from "@/components/inputs/post/CommentInput";
import { authenticatedGet } from "@/utils/api";

type ApiResponse = {
  success: boolean;
  message: string | null;
  data: Post;
};

export type Post = {
  currentVote: string;
  downvoteCount: number;
  upvoteCount: number;
  address?: string | null;
  id: string;
  caption: string;
  createdAt: string;
  postedBy?: string | null;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
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
          `https://safetypin.ppl.cs.ui.ac.id/post/${postId}`
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

  // Format date to more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    });
  };

  // Get username or default value
  const getUsername = (): string => {
    if (post?.postedBy) {
      return post.postedBy;
    }
    return "Anonymous";
  };

  // Get handle
  const getHandle = (): string => {
    return `@${getUsername().toLowerCase().replace(/\s/g, "")}`;
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
              avatarUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true"
              username={getUsername()}
              handle={getHandle()}
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

            {/* Comment section would go here if we had comments data */}
          </View>
        </View>
      </ScrollView>

      <View style={styles.commentInputWrapper}>
        <CommentInput />
      </View>
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
});

export default NearbyReport;