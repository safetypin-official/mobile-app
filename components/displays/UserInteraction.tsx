import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { likeIcon, dislikeIcon } from "@/assets/userInteractions";

interface UserInteractionProps {
  type?: string;
  onPress: () => void;
}

const INTERACTIONS_MAP: Record<string, string> = {
  "like-icon": likeIcon,
  "dislike-icon": dislikeIcon,
};

const UserInteraction: React.FC<UserInteractionProps> = ({ type = "like-icon", onPress }) => {
  const userInteractionXml = INTERACTIONS_MAP[type] || likeIcon;
  const resolvedType = INTERACTIONS_MAP.hasOwnProperty(type) ? type : "like-icon"; // Ensures correct testID

  return (
    <TouchableOpacity onPress={onPress} testID="user-interaction-button">
      <View testID={`user-interaction-${resolvedType}`}>
        <SvgXml xml={userInteractionXml} />
      </View>
    </TouchableOpacity>
  );
};

export default UserInteraction;