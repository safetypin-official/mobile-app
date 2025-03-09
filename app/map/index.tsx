import React, { useState } from "react";
import { View } from "react-native";
import SearchBar from "@/components/inputs/SearchBar";

const MapScreen = () => {
  return (
    <View testID="map-screen">
      <SearchBar />
    </View>
  );
};

export default MapScreen;
