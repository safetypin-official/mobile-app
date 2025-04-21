import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import PostsTabs, { TabConfig, FetchResult, Post } from '@/components/displays/PostsTabs';
import SearchBarFilter from '@/components/inputs/SearchBarFilter';
import * as Location from 'expo-location';
import UserInfo from '@/components/displays/post/UserInfo';
import ReportContent, { TagKey } from '@/components/displays/post/ReportContent';

// Constants
const PAGE_SIZE = 10;
const API_BASE_URL = 'https://safetypin.ppl.cs.ui.ac.id/post/feed';
const DEFAULT_AVATAR = 'https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true';
const DEFAULT_POST_IMAGE = 'https://i.imgur.com/Ha3UkA3.jpg';

export default function SearchPage() {
  // Location State
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Location Permission
  const getUserLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({ 
        latitude: location.coords.latitude, 
        longitude: location.coords.longitude 
      });
    } catch (error) {
      setLocationError('Unable to fetch location. Please enable location services.');
    }
  }, []);

  useEffect(() => { getUserLocation(); }, [getUserLocation]);

  // Shared Fetch Logic
  const fetchPosts = async (url: string): Promise<FetchResult> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    
    const responseData = await response.json();
    const data = responseData.data?.content || [];
    
    const posts: Post[] = data.map((item: any) => ({
      id: item.post?.id || item.id,
      title: item.post?.title || item.title || 'Untitled',
      caption: item.post?.caption || item.caption || '',
      createdAt: item.post?.createdAt || item.createdAt,
      postedBy: item.post?.postedBy || item.postedBy,
      category: item.post?.category || item.category || 'general',
      imageUrl: item.post?.imageUrl || item.imageUrl,
      latitude: item.post?.latitude || item.latitude || 0,
      longitude: item.post?.longitude || item.longitude || 0,
    }));

    return {
      posts,
      currentPage: responseData.data?.number || 0,
      hasMore: responseData.data ? !responseData.data.last : posts.length === PAGE_SIZE,
    };
  };

  // Tab-specific Fetch Functions
  const fetchTopPosts = async (page: number): Promise<FetchResult> => {
    if (!userLocation) throw new Error(locationError ?? 'Location not available');
    const url = `${API_BASE_URL}/distance?lat=${userLocation.latitude}&lon=${userLocation.longitude}&page=${page}&size=${PAGE_SIZE}`;
    return fetchPosts(url);
  };

  const fetchLatestPosts = async (page: number): Promise<FetchResult> => {
    const url = `${API_BASE_URL}/timestamp?page=${page}&size=${PAGE_SIZE}`;
    return fetchPosts(url);
  };

  // Tab Configuration
  const createTabConfig = (
    key: string, 
    label: string, 
    fetcher: (page: number) => Promise<FetchResult>
  ): TabConfig => ({ key, label, fetchPosts: fetcher });

  const tabsConfig: TabConfig[] = [
    createTabConfig('top', 'Top', fetchTopPosts),
    createTabConfig('latest', 'Latest', fetchLatestPosts),
    createTabConfig('people', 'People', fetchTopPosts),
  ];

  // Post Rendering
  const renderPostItem = ({ item }: { item: Post }) => {
    const formattedDate = useMemo(
      () => new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      [item.createdAt]
    );

    const username = useMemo(
      () => item.postedBy ?? 'Anonymous',
      [item.postedBy]
    );

    const handle = useMemo(
      () => `@${username.toLowerCase().replace(/\s/g, '')}`,
      [username]
    );

    const getCategoryTags = (category: string): TagKey[] => [category as TagKey];

    return (
      <View style={styles.postCard}>
        <UserInfo
          avatarUrl={DEFAULT_AVATAR}
          username={username}
          handle={handle}
          date={formattedDate}
          location="Nearby"
          moreOptionsIconUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/43f6a47c22e1c702925915e6626ae6f483d1e56e047a9647d4ff9e5de9751425?placeholderIfAbsent=true"
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
          imageUrl={item.imageUrl || DEFAULT_POST_IMAGE}
          postId={item.id}
        />

        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} testID="search-page-safeAreaView">
      <View style={styles.container} testID="search-page">
        <Text style={styles.headerTitle}>Search</Text>
        <SearchBarFilter />
        <View style={styles.divider} />
        <PostsTabs
          tabs={tabsConfig}
          renderItem={renderPostItem}
          contentContainerStyle={{ ...styles.feedContainer, paddingBottom: 60 }}
        />
      </View>
    </SafeAreaView>
  );
}

// Styles remain unchanged
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  feedContainer: {
    padding: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#551022',
    marginVertical: 8,
    fontFamily: 'Inter',
  },
  postCard: {
    backgroundColor: '#FEFEFE',
    marginBottom: 8,
    paddingVertical: 12,
    width: '100%',
  },
  divider: {
    marginVertical: 6,
  },
});
