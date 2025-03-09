import React, { useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import UserLocationMarker from "@/components/displays/UserLocationMarker";

const CustomMapView = () => {
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission denied");
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation);
      setRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    };

    getLocation();
  }, []);

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
    flex: 1,
  },
});

export default CustomMapView;
