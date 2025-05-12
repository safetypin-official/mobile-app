import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Text, ListRenderItemInfo } from 'react-native';
import DataTabs, { TabConfig, FetchResult } from '@/components/displays/DataTabs';
import { Post, User } from '@/components/displays/Types';
import SearchBarFilter from '@/components/inputs/SearchBarFilter';
import * as Location from 'expo-location';
import UserInfo from '@/components/displays/post/UserInfo';
import ReportContent, { TagKey } from '@/components/displays/post/ReportContent';
import { authenticatedGet } from '@/utils/api';
import UserResult from '@/components/displays/UserResult';
import { router } from 'expo-router';

const PAGE_SIZE = 10;

function isUser(item: any): item is User {
  return typeof item.email === 'string';
}

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
      console.error('Error fetching user location:', error);
      setLocationError('Unable to fetch location. Please enable location services.');
    }
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  const fetchTopPosts = async (page: number, refresh: boolean): Promise<FetchResult<Post>> => {
    if (!userLocation) {
      if (locationError) {
        throw new Error(locationError);
      }
      throw new Error(locationError ?? 'Location not available');
    }
    
    let url = `https://safetypin.ppl.cs.ui.ac.id/posts/feed/distance?lat=${userLocation.latitude}&lon=${userLocation.longitude}&page=${page}&size=${PAGE_SIZE}`;
    
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
      const data = response.data?.content ?? [];
      const posts: Post[] = data.map((item: any) => {
        const post = item.post ?? item;
        return {
          id: post.id,
          title: post.title ?? 'Untitled',
          caption: post.caption ?? '',
          createdAt: post.createdAt,
          postedBy: post.postedBy,
          category: post.category ?? 'general',
          imageUrl: post.imageUrl,
          latitude: post.latitude ?? 0,
          longitude: post.longitude ?? 0,
          upvoteCount: post.upvoteCount ?? 0,
          downvoteCount: post.downvoteCount ?? 0,
          address: post.address ?? null,
          currentVote: post.currentVote ?? 'NONE',
          commentCount: post.commentCount ?? null,
        };
      });
      const hasMore = response.data ? response.data.hasNext : false;
      return {
        items: posts,
        currentPage: page,
        hasMore: hasMore
      };
    } catch (error) {
      console.error('Error fetching top posts:', error);
      throw error;
    }
  };

  const fetchLatestPosts = async (page: number, refresh: boolean): Promise<FetchResult<Post>> => {
    let url = `https://safetypin.ppl.cs.ui.ac.id/posts/feed/timestamp?page=${page}&size=${PAGE_SIZE}`;
    
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
    
    try {
      const response = await authenticatedGet(url);
      const data = response.data?.content ?? [];
      const posts: Post[] = data.map((item: any) => {
        const post = item.post ?? item;
        return {
          id: post.id,
          title: post.title ?? 'Untitled',
          caption: post.caption ?? '',
          createdAt: post.createdAt,
          postedBy: post.postedBy,
          category: post.category ?? 'general',
          imageUrl: post.imageUrl,
          latitude: post.latitude ?? 0,
          longitude: post.longitude ?? 0,
          address: post.address ?? null,
          upvoteCount: post.upvoteCount ?? 0,
          downvoteCount: post.downvoteCount ?? 0,
          currentVote: post.currentVote ?? 'NONE',
          commentCount: post.commentCount ?? null,
        };
      });
      const hasMore = response.data ? response.data.hasNext : false;
      return { items: posts, currentPage: page, hasMore: hasMore };
    } catch (error) {
      console.error('Error fetching latest posts:', error);
      throw error;
    }
  };

  const fetchUsers = async (
    page: number,
    refresh: boolean
  ): Promise<FetchResult<User>> => {
    let url =
      `https://safetypin.ppl.cs.ui.ac.id/api/users/search?page=${page}&size=${PAGE_SIZE}`;

    if (searchKeyword) {
      url += `&query=${encodeURIComponent(searchKeyword)}`;
    }

    console.log('Fetching users with URL:', url);

    try {
      const response = await authenticatedGet(url);
      const raw = response.content ?? [];
  
      const users: User[] = raw.map((item: any) => ({
        id: item.id,
        email: item.email,
        name: item.name,
        role: item.role,
        birthdate: item.birthdate,
        provider: item.provider,
        profilePicture: item.profilePicture,
        profileBanner: item.profileBanner,
        verified: item.verified,
      }));
      const hasMore = response.last === false;  
      return {
        items: users,
        currentPage: response.number ?? page,
        hasMore: hasMore,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
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
          commentCount={item.commentCount ?? null}
        />

        <View style={styles.divider} />
      </View>
    );
  };

  const renderItem = ({ item }: ListRenderItemInfo<Post | User>) => {
    if (isUser(item)) {
      // it's a User
      return (
        <UserResult
          id={item.id}
          avatarUri={item.profilePicture ?? 'https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true'} // Default placeholder image
          username={item.name}
          handle={item.email}
          onPress={() => {
            router.push(`/profile?userId=${item.id}`);
            /* navigate to user profile, e.g.
               navigation.navigate('UserProfile', { userId: item.id })
            */
          }}
        />
      );
    } else {
      return renderPostItem({ item: item });
    }
  };

  const tabsConfig: TabConfig<Post|User>[] = [
    { key: 'top', label: 'Top', fetchData: fetchTopPosts, refreshTrigger: searchRefresh },
    { key: 'latest', label: 'Latest', fetchData: fetchLatestPosts, refreshTrigger: searchRefresh },
    { key: 'people', label: 'People', fetchData: fetchUsers, refreshTrigger: searchRefresh },
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
        <DataTabs<Post|User>
          tabs={tabsConfig}
          renderItem={renderItem}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ ...styles.feedContainer, paddingBottom: 60 }}
        />
        <View style={styles.endMargin} />
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
  endMargin: {
    minHeight: 60, 
  },
});
