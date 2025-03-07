import React, { useState } from "react";
import { View, Alert } from "react-native";
import { router } from 'expo-router';
import SearchBar from "@/components/inputs/SearchBar";

const MapScreen = () => {
  return (
    <View testID="map-screen">
      <SearchBar />
    </View>
  );
};

export default MapScreen;