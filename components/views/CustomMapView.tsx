import React, { useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import UserLocationMarker from "@/components/displays/UserLocationMarker";

const CustomMapView = () => {
  const [location] = useState<Location.LocationObject | null>(null);

  const [region] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {}, []);

  return (
    <MapView
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
      style={styles.map}
      region={region}
      showsUserLocation
      showsMyLocationButton
      testID="custom-map-view"
    >
      {location && <UserLocationMarker latitude={location.coords.latitude} longitude={location.coords.longitude} />}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});

export default CustomMapView;
