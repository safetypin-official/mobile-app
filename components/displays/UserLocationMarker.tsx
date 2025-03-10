import React from "react";
import { View, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";

interface UserLocationMarkerProps {
  latitude: number;
  longitude: number;
  testID?: string;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ latitude, longitude, testID = "user-location-marker" }) => {
  return (
    <Marker coordinate={{ latitude, longitude }} testID={testID}>
      <View style={styles.marker} testID="custom-marker-view"/>
    </Marker>
  );
};

const styles = StyleSheet.create({
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "red",
    borderWidth: 2,
    borderColor: "white",
  },
});

export default UserLocationMarker;