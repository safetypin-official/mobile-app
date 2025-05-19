import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { getTagInfo } from '@/components/displays/Types';

export const TAG_KEYS = [
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
  "Infrastructure Issue",
  "Crime Watch",
  "Lost Book",
  "Lost Pet",
  "Service Issue",
  "Flooding",
  "Stolen Vehicle",
] as const;

type TagKey = (typeof TAG_KEYS)[number];

export interface ReportTagsProps {
  selectedTags?: TagKey[];
}

const ReportTags: React.FC<ReportTagsProps> = ({ selectedTags = [] }) => {
  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tags} testID="tags-container">
      {selectedTags.map((tag) => {
        const tagData = getTagInfo(tag);
        return (
          <View key={tag} style={[styles.tagButton, { backgroundColor: tagData.color }]}>
            <SvgXml xml={tagData.icon} style={styles.tagIcon}/>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tags: {
    flexDirection: "row",
    paddingHorizontal: 0,
  },
  tagButton: {
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    height: 30,
  },
  tagIcon: {
    width: 12,
    height: 12,
  },
  tagText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ReportTags;