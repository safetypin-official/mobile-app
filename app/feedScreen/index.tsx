import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TextInput
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import components from NearbyReport
import UserInfo from "@/components/post/UserInfo";
import ReportContent, { TagKey } from "@/components/post/ReportContent";

// Reusing types from your existing code
type Category = {
  id: string;
  name: string;
};

type Post = {
  id: string;
  caption: string;
  createdAt: string;
  postedBy: string | null;
  title: string;
  category: Category;
  latitude: number;
  longitude: number;
};

// Get screen dimensions
const { width } = Dimensions.get('window');
// Navbar height
const NAVBAR_HEIGHT = 60;

const FeedScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'near_you' | 'recents'>('near_you');
  
  const insets = useSafeAreaInsets();

  // Function to fetch posts from backend
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://10.0.2.2/post/all');
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched posts:', data);
      
      // Sort posts by createdAt (newest first)
      const sortedPosts = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again by pulling down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  // Format date to more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    });
  };

  // Get username or default value
  const getUsername = (postedBy: string | null): string => {
    if (postedBy) {
      return postedBy;
    }
    return "Anonymous";
  };

  // Get handle
  const getHandle = (postedBy: string | null): string => {
    return `@${getUsername(postedBy).toLowerCase().replace(/\s/g, "")}`;
  };
  
  // Get category tags for a post
  const getCategoryTags = (category: Category): TagKey[] => {
    if (category) {
      return [category.name as TagKey];
    }
    return [];
  };
  
  // Map category name to pin type
  const getPinType = (category: Category): string => {
    if (!category) return "other-crime";
    
    // Map category name to pin type
    const categoryMap: Record<string, string> = {
      "Lost Item": "lost-item",
      "Found Item": "found-item",
      "Theft": "theft",
      "Harassment": "harassment",
      "Flood": "flood",
      "Assault": "assault",
      "Fire": "fire",
      "Earthquake": "earthquake",
      "Other Disaster": "other-disaster",
      "Other Crime": "other-crime",
      "Crime Watch": "theft", // Mapping similar categories
      "Service Issue": "other-crime",
      "Lost Book": "lost-item",
      "Lost Pet": "lost-item",
      "Infrastructure Issue": "other-disaster"
    };
    
    return categoryMap[category.name] || "other-crime";
  };

  // Render each post item
  const renderPostItem = ({ item }: { item: Post }) => {
    return (
      <View style={styles.postCard}>
        <UserInfo
          avatarUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true"
          username={getUsername(item.postedBy)}
          handle={getHandle(item.postedBy)}
          date={formatDate(item.createdAt)}
          location="Morioh-Cho"
          moreOptionsIconUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/43f6a47c22e1c702925915e6626ae6f483d1e56e047a9647d4ff9e5de9751425?placeholderIfAbsent=true"
          longitude={item.longitude}
          latitude={item.latitude}
          categoryType={getPinType(item.category)} // Pass the pin type based on category
        />

        <ReportContent
          title={item.title}
          content={item.caption}
          likeCount={0}
          dislikeCount={0}
          selectedTags={getCategoryTags(item.category)}
          imageUrl={"https://safetypin.s3.ap-southeast-2.amazonaws.com/694f2299-fb1d-47ae-b9d5-9df7dce1fd23.jpeg"}
        />
        
        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#666" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search" 
              placeholderTextColor="#999"
            />
            <TouchableOpacity>
              <Feather name="mic" size={18} color="#666" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Feather name="menu" size={22} color="#333" />
          </TouchableOpacity>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'near_you' && styles.activeTab]} 
            onPress={() => setActiveTab('near_you')}
          >
            <Text style={[styles.tabText, activeTab === 'near_you' && styles.activeTabText]}>
              Near You
            </Text>
            {activeTab === 'near_you' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'recents' && styles.activeTab]} 
            onPress={() => setActiveTab('recents')}
          >
            <Text style={[styles.tabText, activeTab === 'recents' && styles.activeTabText]}>
              Recents
            </Text>
            {activeTab === 'recents' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabSeparator} />
      </View>
      
      {/* Posts List */}
      {(() => {
        if (loading && posts.length === 0) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9F3F3D" />
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          );
        } else if (error && posts.length === 0) {
          return (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchPosts}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          );
        } else {
          return (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              renderItem={renderPostItem}
              contentContainerStyle={[
                styles.feedContainer,
                { paddingBottom: NAVBAR_HEIGHT + insets.bottom }
              ]}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  colors={['#9F3F3D']} 
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No posts available</Text>
                </View>
              }
            />
          );
        }
      })()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFEFE",
  },
  header: {
    paddingHorizontal: 16,
    backgroundColor: "#FEFEFE",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#551022',
    marginVertical: 8,
    fontFamily: 'Inter',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EDED',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter',
  },
  filterButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  tab: {
    marginRight: 24,
    paddingVertical: 8,
  },
  activeTab: {
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#9F3F3D',
    borderRadius: 2,
  },
  tabSeparator: {
    height: 1,
    backgroundColor: '#DDD',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  retryButton: {
    backgroundColor: '#9F3F3D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter',
  },
  feedContainer: {
    padding: 4,
  },
  postCard: {
    backgroundColor: "#FEFEFE",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
});

export default FeedScreen;