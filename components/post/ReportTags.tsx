import React from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import {
    assaultTag, 
    earthquakeTag, 
    fireTag, 
    floodTag, 
    foundItemTag, 
    harassmentTag, 
    lostItemTag, 
    otherDisasterTag, 
    otherCrimeTag, 
    theftTag 
  } from '@/assets/tags';

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

const TAGS: Record<TagKey, { icon: any; color: string }> = {
    "Lost Item": { icon: lostItemTag, color: "#9F3F3D" },
    "Found Item": { icon: foundItemTag, color: "#5E9F3D" },
    "Theft": { icon: theftTag, color: "#9F3F3D" },
    "Harassment": { icon: harassmentTag, color: "#9F3F3D" },
    "Flood": { icon: floodTag, color: "#3D719F" },
    "Assault": { icon: assaultTag, color: "#9F3F3D" },
    "Fire": { icon: fireTag, color: "#BA1A1A" },
    "Other Natural Disasters": { icon: otherDisasterTag, color: "#391E1D" },
    "Earthquake": { icon: earthquakeTag, color: "#745A2B" },
    "Other Crime": { icon: otherCrimeTag, color: "#9F3F3D" },
    "Infrastructure Issue": {
        icon: otherCrimeTag,
        color: "#9F3F3D"
    },
    "Crime Watch": {
        icon: otherCrimeTag,
        color: "#9F3F3D"
    },
    "Lost Book": {
        icon: otherCrimeTag,
        color: "#9F3F3D"
    },
    "Lost Pet": {
        icon: otherCrimeTag,
        color: "#9F3F3D"
    },
    "Service Issue": {
        icon: otherCrimeTag,
        color: "#9F3F3D"
    },
    "Flooding": {
        icon: otherCrimeTag,
        color: "#9F3F3D"
    },
    "Stolen Vehicle": {
        icon: otherCrimeTag,
        color: "#9F3F3D"
    }
};

export interface ReportTagsProps {
  selectedTags?: TagKey[];
}

const ReportTags: React.FC<ReportTagsProps> = ({ selectedTags = [] }) => {
    return (
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tags} testID="tags-container">
        {selectedTags.map((tag, index) => {
          const tagData = TAGS[tag];
          return (
            <View key={index} style={[styles.tagButton, { backgroundColor: tagData.color }]}>
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