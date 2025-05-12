// components/PostsTabs.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewStyle,
} from 'react-native';

export type Post = {
  address: string;
  id: string;
  title: string;
  caption: string;
  createdAt: string;
  postedBy: string | null;
  category: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  upvoteCount: number;
  downvoteCount: number;
};

export type FetchResult = {
  posts: Post[];
  currentPage: number;
  hasMore: boolean;
};

export type TabConfig = {
  key: string;
  label: string;
  fetchPosts: (page: number, refresh: boolean) => Promise<FetchResult>;
  refreshTrigger?: boolean | string | number; // Add this line to track external state changes
};

type TabState = {
  posts: Post[];
  currentPage: number;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
  scrollPosition: number;
  error?: string;
};

export type PostsTabsProps = {
  tabs: TabConfig[];
  renderItem: (info: ListRenderItemInfo<Post>) => JSX.Element;
  initialActiveTab?: string;
  contentContainerStyle?: ViewStyle;
  disableAutoLoad?: boolean; // <-- new prop for testing
};

const PostsTabs: React.FC<PostsTabsProps> = ({
  tabs,
  renderItem,
  initialActiveTab,
  contentContainerStyle,
  disableAutoLoad = false, // <-- default value for new prop
}) => {
  const initialTabKey = initialActiveTab ?? tabs[0].key;
  const [activeTab, setActiveTab] = useState<string>(initialTabKey);
  const [tabsState, setTabsState] = useState<Record<string, TabState>>(() => {
    const state: Record<string, TabState> = {};
    tabs.forEach((tab) => {
      state[tab.key] = {
        posts: [],
        currentPage: 0,
        hasMore: true,
        loading: false,
        refreshing: false,
        scrollPosition: 0,
        error: undefined,
      };
    });
    return state;
  });

  const flatListRef = useRef<FlatList<Post>>(null);

  const currentTabState = tabsState[activeTab];

  const loadPosts = useCallback(
    async (tabKey: string, page: number, refresh: boolean = false) => {
      // set loading state for this tab
      setTabsState((prev) => ({
        ...prev,
        [tabKey]: {
          ...prev[tabKey],
          loading: page === 0 && !refresh,
          refreshing: refresh,
          error: undefined,
        },
      }));

      const tabConfig = tabs.find((tab) => tab.key === tabKey);
      if (!tabConfig) return;

      try {
        const result = await tabConfig.fetchPosts(page, refresh);
        setTabsState((prev) => {
          const prevState = prev[tabKey];
          const posts =
            page === 0 || refresh ? result.posts : [...prevState.posts, ...result.posts];
          return {
            ...prev,
            [tabKey]: {
              ...prevState,
              posts,
              currentPage: result.currentPage,
              hasMore: result.hasMore,
              loading: false,
              refreshing: false,
            },
          };
        });
      } catch (error: any) {
        setTabsState((prev) => ({
          ...prev,
          [tabKey]: {
            ...prev[tabKey],
            loading: false,
            refreshing: false,
            error: error.message || 'Failed to load posts',
          },
        }));
      }
    },
    [tabs]
  );

  // Load initial posts for active tab on mount or when switching tabs
  useEffect(() => {
    if (!disableAutoLoad && tabsState[activeTab]?.posts?.length === 0) {
      loadPosts(activeTab, 0, true);
    }
  }, [activeTab, loadPosts, disableAutoLoad]);

  // Add this useEffect to watch for refreshTrigger changes
  useEffect(() => {
    // Find the active tab configuration
    const activeTabConfig = tabs.find(tab => tab.key === activeTab);
    
    if (activeTabConfig?.refreshTrigger !== undefined) {
      // If there's a refreshTrigger property, reload data when it changes
      loadPosts(activeTab, 0, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.map(tab => tab.refreshTrigger).join(','), activeTab]);

  const onRefresh = () => {
    loadPosts(activeTab, 0, true);
  };

  const handleLoadMore = () => {
    if (!currentTabState.loading && !currentTabState.refreshing && currentTabState.hasMore) {
      loadPosts(activeTab, currentTabState.currentPage + 1);
    }
  };

  const handleTabChange = (tabKey: string) => {
    // Optionally, you can store the scroll position here before switching
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
    setActiveTab(tabKey);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setTabsState((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        scrollPosition: offsetY,
      },
    }));
  };

  const renderFooter = () => {
    if (!currentTabState.loading && !currentTabState.refreshing && currentTabState.hasMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#9F3F3D" />
          <Text style={styles.footerText}>Loading more posts...</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Tabs Header */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => handleTabChange(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* List or Loading/Error State */}
      {(() => {
        if (currentTabState.loading && currentTabState.posts.length === 0) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator testID="loading-indicator" size="large" color="#9F3F3D" />
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          );
        } else if (currentTabState.error && currentTabState.posts.length === 0) {
          return (
            <View style={styles.errorContainer}>
              <Text testID="error-message" style={styles.errorText}>
                {currentTabState.error}
              </Text>
              <TouchableOpacity
                onPress={() => loadPosts(activeTab, 0, true)}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          );
        } else {
          return (
            <FlatList
              testID="posts-flatlist" // Added testID for testing
              ref={flatListRef}
              data={currentTabState.posts}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={contentContainerStyle}
              refreshControl={
                <RefreshControl
                  testID="posts-refreshControl" // Added testID for testing
                  refreshing={currentTabState.refreshing}
                  onRefresh={onRefresh}
                  colors={['#9F3F3D']}
                />
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              onScroll={onScroll}
              scrollEventThrottle={16}
              ListFooterComponent={renderFooter}
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
    alignItems: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  },
  footerLoader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default PostsTabs;