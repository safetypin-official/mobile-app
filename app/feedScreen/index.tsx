// feedScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PostsTabs, { TabConfig, FetchResult, Post } from '@/components/displays/PostsTabs';
import * as Location from 'expo-location';
import UserInfo from '@/components/displays/post/UserInfo';
import ReportContent, { TagKey } from '@/components/displays/post/ReportContent';
import { fetchPostsByType } from '@/utils/fetchPosts';

const FeedScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getUserLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    } catch (error) {
      setLocationError('Unable to fetch location. Please enable location services.');
    }
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  const fetchNearYouPosts = async (page: number, refresh: boolean): Promise<FetchResult> => {
    if (!userLocation) throw new Error(locationError ?? 'Location not available');
    return fetchPostsByType('distance', page, userLocation);
  };

  const fetchRecentsPosts = async (page: number, refresh: boolean): Promise<FetchResult> => {
    return fetchPostsByType('timestamp', page);
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const getUsername = (postedBy: string | null) => (postedBy ?? 'Anonymous');
    const getHandle = (postedBy: string | null) => `@${getUsername(postedBy).toLowerCase().replace(/\s/g, '')}`;
    const getCategoryTags = (category: string): TagKey[] => [category as TagKey];

    return (
      <View style={styles.postCard}>
        <UserInfo
          avatarUrl="https://cdn.builder.io/api/v1/image/assets/.../avatar"
          username={getUsername(item.postedBy)}
          handle={getHandle(item.postedBy)}
          date={formatDate(item.createdAt)}
          location="Nearby"
          moreOptionsIconUrl="https://cdn.builder.io/api/v1/image/assets/.../more"
          longitude={item.longitude}
          latitude={item.latitude}
          categoryType={item.category}
        />
        <ReportContent
          title={item.title}
          content={item.caption}
          likeCount={0}
          dislikeCount={0}
          selectedTags={getCategoryTags(item.category)}
          imageUrl={item.imageUrl ?? 'https://i.imgur.com/Ha3UkA3.jpg'}
          postId={item.id}
        />
        <View style={styles.divider} />
      </View>
    );
  };

  const tabsConfig: TabConfig[] = [
    { key: 'near_you', label: 'Near You', fetchPosts: fetchNearYouPosts },
    { key: 'recents', label: 'Recents', fetchPosts: fetchRecentsPosts },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Explore</Text>
      <PostsTabs
        tabs={tabsConfig}
        renderItem={renderPostItem}
        contentContainerStyle={{ ...styles.feedContainer, paddingBottom: 60 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEFEFE', paddingHorizontal: 16 },
  feedContainer: { padding: 4 },
  postCard: { backgroundColor: '#FEFEFE', marginBottom: 8, paddingVertical: 12, width: '100%' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 10 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#551022', marginVertical: 8, fontFamily: 'Inter' },
});

export default FeedScreen;
