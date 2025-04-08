import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PostsTabs, { TabConfig, FetchResult, Post } from '@/components/displays/PostsTabs';
import * as Location from 'expo-location';
import { authenticatedGet } from '@/utils/api';

// Components for rendering each post
import UserInfo from '@/components/displays/post/UserInfo';
import ReportContent, { TagKey } from '@/components/displays/post/ReportContent';

const PAGE_SIZE = 2;

const FeedScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
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

  // Fetch function for "Near You" posts
  const fetchNearYouPosts = async (page: number, refresh: boolean): Promise<FetchResult> => {
    if (!userLocation) {
      throw new Error(locationError ?? 'Location not available');
    }
    const url = `https://safetypin.ppl.cs.ui.ac.id/post/feed/distance?lat=${userLocation.latitude}&lon=${userLocation.longitude}&page=${page}&size=${PAGE_SIZE}`;
    console.log(`Fetching: ${url}`);
    
    try {
      const response = await authenticatedGet(url);
      console.log('Response Data:', response);
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
      console.log('📱 Has more:', hasMore);
      return {
        posts,
        currentPage: page,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching near you posts:', error);
      throw error;
    }
  };

  // Fetch function for "Recents" posts
  const fetchRecentsPosts = async (page: number, refresh: boolean): Promise<FetchResult> => {
    const url = `https://safetypin.ppl.cs.ui.ac.id/post/feed/timestamp?page=${page}&size=${PAGE_SIZE}`;
    
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
      return {
        posts,
        currentPage: page,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      throw error;
    }
  };

  // Render function for each post item (keeps presentation logic separate)
  const renderPostItem = ({ item }: { item: Post }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    const getUsername = (postedBy: string | null) => {
      const username = postedBy ?? 'Anonymous';
      // Truncate username if longer than 15 characters
      return username.length > 10 ? username.substring(0, 8) + '...' : username;
    };
    const getHandle = (postedBy: string | null) =>
      `@${getUsername(postedBy).toLowerCase().replace(/\s/g, '')}`;
    const getCategoryTags = (category: string): TagKey[] => [category as TagKey];

    return (
      <View style={styles.postCard}>
        <UserInfo
          avatarUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true"
          username={getUsername(item.postedBy)}
          handle={getHandle(item.postedBy)}
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
    { key: 'near_you', label: 'Near You', fetchPosts: fetchNearYouPosts, refreshTrigger: searchRefresh },
    { key: 'recents', label: 'Recents', fetchPosts: fetchRecentsPosts, refreshTrigger: searchRefresh },
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
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
    paddingHorizontal: 16,
  },
  feedContainer: {
    padding: 4,
  },
  postCard: {
    backgroundColor: '#FEFEFE',
    marginBottom: 8,
    paddingVertical: 12,
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#551022',
    marginVertical: 8,
    fontFamily: 'Inter',
  },
});

export default FeedScreen;
