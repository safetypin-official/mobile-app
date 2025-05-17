import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import NearbyReport from '@/components/displays/NearbyReport';

export default function PostScreen() {
  const { id } = useLocalSearchParams();
  
  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top} testID="top-section">
        <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 8 }}>
          <TouchableOpacity onPress={handleGoBack} testID="back-button">
            <Entypo name="chevron-left" size={24} color="#3b080a" />
          </TouchableOpacity>
          <Text style={styles.header}>Post Details</Text>
        </View>
      </View>
      
      <NearbyReport postId={id as string} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  top: {
    marginVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b080a",
    marginLeft: 8,
  }
});