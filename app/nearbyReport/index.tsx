import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import UserInfo from "@/components/displays/post/UserInfo";
import ReportContent, { TagKey } from "@/components/displays/post/ReportContent";
import CommentInput from "@/components/inputs/post/ComponentInput";

// Add type definition for the post prop
type Category = {
  id: string;
  name: string;
};

type Post = {
  id: string;
  caption: string;
  createdAt: string;
  postedBy: string | null;
  title: string;
  category: Category;
  latitude: number;
  longitude: number;
};

// Define the component props
interface NearbyReportProps {
  post?: Post;
  onClose?: () => void;
}

const NearbyReport: React.FC<NearbyReportProps> = ({ post, onClose }) => {
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
      return [post.category.name as TagKey];
    }
    return [];
  }
  
  // Map category name to pin type
  const getPinType = (): string => {
    if (!post?.category) return "other-crime";
    
    // Map category name to pin type
    const categoryMap: Record<string, string> = {
      "Lost Item": "lost-item",
      "Found Item": "found-item",
      "Theft": "theft",
      "Harassment": "harassment",
      "Flood": "flood",
      "Assault": "assault",
      "Fire": "fire",
      "Earthquake": "earthquake",
      "Other Disaster": "other-disaster",
      "Other Crime": "other-crime"
    };
    
    return categoryMap[post.category.name] || "other-crime";
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollableContent}>
        <View style={styles.mainContent}>
          <View style={styles.contentWrapper}>
            <UserInfo
              avatarUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true"
              username={getUsername()}
              handle={getHandle()}
              date={post ? formatDate(post.createdAt) : ""}
              location="Location"
              moreOptionsIconUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/43f6a47c22e1c702925915e6626ae6f483d1e56e047a9647d4ff9e5de9751425?placeholderIfAbsent=true"
              longitude={post?.longitude ?? 0}
              latitude={post?.latitude ?? 0}
              categoryType={getPinType()} // Pass the pin type based on category
            />

            <ReportContent
              title={post?.title ?? "Title"}
              content={post?.caption ?? "Content"}
              likeCount={0}
              dislikeCount={0}
              selectedTags={getCategoryTags()}
              imageUrl={`https://safetypin.s3.ap-southeast-2.amazonaws.com/694f2299-fb1d-47ae-b9d5-9df7dce1fd23.jpeg`}
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