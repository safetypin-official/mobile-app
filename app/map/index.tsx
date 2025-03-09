import React from "react";
import { View, StyleSheet } from "react-native";
import SearchBar from "@/components/inputs/SearchBar";
import CustomMapView from "@/components/views/CustomMapView";

const MapScreen = () => {
  return (
    <View style={styles.container} testID="map-screen">
      <SearchBar />
      <CustomMapView />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapScreen;
