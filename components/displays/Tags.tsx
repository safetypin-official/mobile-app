import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import {
  lostItemTag,
  foundItemTag,
  theftTag,
  harassmentTag,
  floodTag,
  assaultTag,
  fireTag,
  otherDisasterTag,
  earthquakeTag,
  otherCrimeTag,
} from "@/assets/tags";

interface TagProps {
  type?: string;
  onPress: () => void;
}

const TAGS_MAP: Record<string, string> = {
  "lost-item": lostItemTag,
  "found-item": foundItemTag,
  "theft": theftTag,
  "harassment": harassmentTag,
  "flood": floodTag,
  "assault": assaultTag,
  "fire": fireTag,
  "other-disaster": otherDisasterTag,
  "earthquake": earthquakeTag,
  "other-crime": otherCrimeTag,
};

const Tag: React.FC<TagProps> = ({ type = "other-crime", onPress }) => {
  const pinXml = TAGS_MAP.hasOwnProperty(type) ? TAGS_MAP[type] : otherCrimeTag;
  const resolvedType = TAGS_MAP.hasOwnProperty(type) ? type : "other-crime"; // Ensures correct testID

  return (
    <TouchableOpacity onPress={onPress} testID="tag-button">
      <View testID={`tag-icon-${resolvedType}`}>
        <SvgXml xml={pinXml} />
      </View>
    </TouchableOpacity>
  );
};

export default Tag;