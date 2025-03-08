import React, { useState } from "react";
import { View } from "react-native";
import SearchBar from "@/components/inputs/SearchBar";
import PostForm from "@/components/forms/PostForm";

const MapScreen = () => {
  const [isPostFormVisible, setPostFormVisible] = useState(true);

  const handleClose = () => {
    setPostFormVisible(false);
  };

  const handleSubmit = (post: { title: string; description: string; tags: string[]; images: string[] }) => {
    console.log("New Post Submitted:", post);
    setPostFormVisible(false); // Close form after submission
  };

  return (
    <View testID="map-screen">
      <SearchBar />
      <View style={{ flex: 1, overflow: "visible" }}>
        <PostForm
          visible={isPostFormVisible}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
      </View>
    </View>
  );
};

export default MapScreen;
