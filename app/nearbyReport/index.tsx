import React from "react";
import { View, Text, StyleSheet } from "react-native";

const NearbyReport: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Nearby Report</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEFEFE",
  },
});

export default NearbyReport;
