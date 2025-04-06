import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import NearbyReport from '@/components/displays/NearbyReport';

export default function PostScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Post Details',
          headerTitleAlign: 'center'
        }} 
      />
      <NearbyReport postId={id as string} />
    </>
  );
}