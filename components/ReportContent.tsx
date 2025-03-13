import React, { ReactElement, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import ReportTags from "./ReportTags";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SvgXml } from "react-native-svg";
import {
  likeIcon, 
  dislikeIcon, 
} from '@/assets/userInteractions';

const TAG_KEYS = [
    "Lost Item",
    "Found Item",
    "Theft",
    "Harassment",
    "Flood",
    "Assault",
    "Fire",
    "Other Natural Disasters",
    "Earthquake",
    "Other Crime",
  ] as const;

type TagKey = (typeof TAG_KEYS)[number];

interface ReportContentProps {
  title: string;
  content: string;
  likeCount: number;
  dislikeCount: number;
  selectedTags: TagKey[];
}

const ReportContent: React.FC<ReportContentProps> = ({
  title,
  content,
  likeCount: initialLikeCount,
  dislikeCount: initialDislikeCount,
  selectedTags,
}) => {
  const [likes, setLikes] = useState(initialLikeCount);
  const [dislikes, setDislikes] = useState(initialDislikeCount);
  const [likeColor, setLikeColor] = useState("#7F7574");
  const [dislikeColor, setDislikeColor] = useState("#7F7574");
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmarkClick = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleLikeClick = () => {
    if (likeColor === "#7F7574") { 
      setLikes(prevLikes => prevLikes + 1);
      setLikeColor("#5E9F3D");
      
    if (dislikeColor === "#904A47") {
      setDislikes(prevDislikes => prevDislikes - 1);
      setDislikeColor("#7F7574");
    }
    } else {
      setLikes(prevLikes => prevLikes - 1);
      setLikeColor("#7F7574");
    }
  };
  
  const handleDislikeClick = () => {
    if (dislikeColor === "#7F7574") {
      setDislikes(prevDislikes => prevDislikes + 1);
      setDislikeColor("#904A47");
  
    if (likeColor === "#5E9F3D") {
      setLikes(prevLikes => prevLikes - 1);
      setLikeColor("#7F7574");
    }
    } else {
      setDislikes(prevDislikes => prevDislikes - 1);
      setDislikeColor("#7F7574");
    }
  };

  return (
    <View style={styles.reportContent}>
      <View style={styles.imageContainer} />
      <View style={styles.tagsContainer}>
        <ReportTags selectedTags={selectedTags} />
      </View>
      <View style={styles.contentText}>
        <Text style={styles.contentTitle}>{title}</Text>
        <Text style={styles.contentDescription}>{content}</Text>
      </View>
      <View style={styles.interactions}>
        <View style={styles.interactionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLikeClick} testID="like-button">
            <SvgXml xml={likeIcon} width={24} height={24} fill={likeColor} />
            <Text style={[styles.countText, { color: likeColor }]}>{likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDislikeClick} testID="dislike-button">
            <SvgXml xml={dislikeIcon} width={24} height={24} fill={dislikeColor} />
            <Text style={[styles.countText, { color: dislikeColor }]}>{dislikes}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.shareActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleBookmarkClick} testID="bookmark-button">
            <FontAwesome name={isBookmarked ? "bookmark" : "bookmark-o"} size={20} color="#7F7574" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="share-variant-outline" size={20} color="#7F7574" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reportContent: {
    width: "100%",
  },
  imageContainer: {
    backgroundColor: "#77565433",
    width: "100%",
    minHeight: 228,
    marginTop: 10,
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
});

export default ReportContent;
export type { ReportContentProps, TagKey };