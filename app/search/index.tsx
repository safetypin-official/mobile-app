import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import PostsTabs, { TabConfig, FetchResult, Post } from '@/components/displays/PostsTabs';
import SearchBarFilter from '@/components/inputs/SearchBarFilter';
import * as Location from 'expo-location';
import UserInfo from '@/components/displays/post/UserInfo';
import ReportContent, { TagKey } from '@/components/displays/post/ReportContent';
import { authenticatedGet } from '@/utils/api';

const PAGE_SIZE = 10;

export default function SearchPage() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [searchRefresh, setSearchRefresh] = useState<boolean>(false);

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

  const fetchTopPosts = async (page: number, refresh: boolean): Promise<FetchResult> => {
    if (!userLocation) {
      throw new Error(locationError ?? 'Location not available');
    }
    
    let url = `https://safetypin.ppl.cs.ui.ac.id/post/feed/distance?lat=${userLocation.latitude}&lon=${userLocation.longitude}&page=${page}&size=${PAGE_SIZE}`;
    
    if (searchKeyword) {
      url += `&keyword=${encodeURIComponent(searchKeyword)}`;
    }
    
    if (selectedCategories.length > 0) {
      url += `&categories=${encodeURIComponent(selectedCategories.join(','))}`;
    }
    
    if (fromDate) {
      url += `&dateFrom=${encodeURIComponent(fromDate)}`;
    }
    
    if (toDate) {
      url += `&dateTo=${encodeURIComponent(toDate)}`;
    }
    
    try {
      const response = await authenticatedGet(url);
      const data = response.data?.content || [];
      const posts: Post[] = data.map((item: any) => {
        const post = item.post || item;
        return {
          id: post.id,
          title: post.title || 'Untitled',
          caption: post.caption || '',
          createdAt: post.createdAt,
          postedBy: post.postedBy,
          category: post.category || 'general',
          imageUrl: post.imageUrl,
          latitude: post.latitude || 0,
          longitude: post.longitude || 0,
          upvoteCount: post.upvoteCount || 0,
          downvoteCount: post.downvoteCount || 0,
          address: post.address || null,
          currentVote: post.currentVote || 'NONE',
        };
      });
      const hasMore = response.data ? response.data.hasNext : false;
      return { posts, currentPage: page, hasMore };
    } catch (error) {
      console.error('Error fetching top posts:', error);
      throw error;
    }
  };

  const fetchLatestPosts = async (page: number, refresh: boolean): Promise<FetchResult> => {
    let url = `https://safetypin.ppl.cs.ui.ac.id/post/feed/timestamp?page=${page}&size=${PAGE_SIZE}`;
    
    if (searchKeyword) {
      url += `&keyword=${encodeURIComponent(searchKeyword)}`;
    }
    
    if (selectedCategories.length > 0) {
      url += `&categories=${encodeURIComponent(selectedCategories.join(','))}`;
    }
    
    if (fromDate) {
      url += `&fromDate=${encodeURIComponent(fromDate)}`;
    }
    
    if (toDate) {
      url += `&toDate=${encodeURIComponent(toDate)}`;
    }
    
    console.log(`Fetching latest posts from: ${url}`);
    
    try {
      const response = await authenticatedGet(url);
      const data = response.data?.content || [];
      const posts: Post[] = data.map((item: any) => {
        const post = item.post || item;
        return {
          id: post.id,
          title: post.title || 'Untitled',
          caption: post.caption || '',
          createdAt: post.createdAt,
          postedBy: post.postedBy,
          category: post.category || 'general',
          imageUrl: post.imageUrl,
          latitude: post.latitude || 0,
          longitude: post.longitude || 0,
          address: post.address || null,
          upvoteCount: post.upvoteCount || 0,
          downvoteCount: post.downvoteCount || 0,
          currentVote: post.currentVote || 'NONE',
        };
      });
      const hasMore = response.data ? response.data.hasNext : false;
      return { posts, currentPage: page, hasMore };
    } catch (error) {
      console.error('Error fetching latest posts:', error);
      throw error;
    }
  };

  const handleSearchSubmit = (text: string) => {
    setSearchKeyword(text);
    setSearchRefresh(prev => !prev);
  };

  const handleFilterSave = (filters: { selectedTags: string[], fromDate: string, toDate: string }) => {
    setSelectedCategories(filters.selectedTags);
    setFromDate(filters.fromDate || null);
    setToDate(filters.toDate || null);
    setSearchRefresh(prev => !prev);
  };
  
  const renderPostItem = ({ item }: { item: Post }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getCategoryTags = (category: string): TagKey[] => [category as TagKey];

    return (
      <View style={styles.postCard}>
        <UserInfo
          postedBy={item.postedBy}
          date={formatDate(item.createdAt)}
          location={item.address ?? 'Nearby'}
          moreOptionsIconUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/43f6a47c22e1c702925915e6626ae6f483d1e56e047a9647d4ff9e5de9751425?placeholderIfAbsent=true"
          longitude={item.longitude}
          latitude={item.latitude}
          categoryType={item.category}
          postId={item.id}
          onPostDeleted={() => setSearchRefresh(prev => !prev)}
        />

        <ReportContent
          title={item.title}
          content={item.caption}
          likeCount={item.upvoteCount ?? 69}
          dislikeCount={item.downvoteCount ?? 0}
          selectedTags={getCategoryTags(item.category)}
          imageUrl={item.imageUrl ?? 'https://i.imgur.com/Ha3UkA3.jpg'}
          postId={item.id}
          currentVote={item.currentVote || 'NONE'}
        />

        <View style={styles.divider} />
      </View>
    );
  };

  const tabsConfig: TabConfig[] = [
    { key: 'top', label: 'Top', fetchPosts: fetchTopPosts, refreshTrigger: searchRefresh },
    { key: 'latest', label: 'Latest', fetchPosts: fetchLatestPosts, refreshTrigger: searchRefresh },
    { key: 'people', label: 'People', fetchPosts: fetchTopPosts, refreshTrigger: searchRefresh },
  ];

  return (
    <SafeAreaView style={styles.safeArea} testID="search-page-safeAreaView">
      <View style={styles.container} testID="search-page">
        <Text style={styles.headerTitle}>Search</Text>
        <SearchBarFilter 
          onSubmit={handleSearchSubmit}
          onSave={handleFilterSave}
        />
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
