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

export type FetchResult<T> = {
  items: T[];
  currentPage: number;
  hasMore: boolean;
};

export type TabConfig<T> = {
  key: string;
  label: string;
  fetchData: (page: number, refresh: boolean) => Promise<FetchResult<T>>;
  refreshTrigger?: boolean | string | number;
  renderItem?: (info: ListRenderItemInfo<T>) => JSX.Element;
  keyExtractor?: (item: T) => string;
};

type TabState<T> = {
  items: T[];
  currentPage: number;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
  scrollPosition: number;
  error?: string;
};

const EmptyListComponent = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No items available</Text>
  </View>
);

export type DataTabsProps<T> = {
  tabs: TabConfig<T>[];
  renderItem?: (info: ListRenderItemInfo<T>) => JSX.Element;
  keyExtractor?: (item: T) => string;
  initialActiveTab?: string;
  contentContainerStyle?: ViewStyle;
  disableAutoLoad?: boolean;
};

export default function DataTabs<T>({
  tabs,
  renderItem,
  keyExtractor,
  initialActiveTab,
  contentContainerStyle,
  disableAutoLoad = false,
}: Readonly<DataTabsProps<T>>) {
  const initialTabKey = initialActiveTab ?? tabs[0].key;
  const [activeTab, setActiveTab] = useState<string>(initialTabKey);
  const [tabsState, setTabsState] = useState<Record<string, TabState<T>>>(() => {
    const state: Record<string, TabState<T>> = {};
    tabs.forEach((tab) => {
      state[tab.key] = {
        items: [] as T[],
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

  const flatListRef = useRef<FlatList<T>>(null);
  const currentTabState = tabsState[activeTab];
  const activeTabConfig = tabs.find(t => t.key === activeTab);

  const loadData = useCallback(
    async (tabKey: string, page: number, refresh: boolean = false) => {
      setTabsState((prev) => ({
        ...prev,
        [tabKey]: {
          ...prev[tabKey],
          loading: page === 0 && !refresh,
          refreshing: refresh,
          error: undefined,
        },
      }));

      const tabConfig = tabs.find((t) => t.key === tabKey);
      if (!tabConfig) return;

      try {
        const result = await tabConfig.fetchData(page, refresh);
        setTabsState((prev) => {
          const prevState = prev[tabKey];
          const items =
            page === 0 || refresh
              ? result.items
              : [...prevState.items, ...result.items];
          return {
            ...prev,
            [tabKey]: {
              ...prevState,
              items,
              currentPage: result.currentPage,
              hasMore: result.hasMore,
              loading: false,
              refreshing: false,
            },
          };
        });
      } catch (err: any) {
        setTabsState((prev) => ({
          ...prev,
          [tabKey]: {
            ...prev[tabKey],
            loading: false,
            refreshing: false,
            error: err.message ?? 'Failed to load data',
          },
        }));
      }
    },
    [tabs]
  );

  // initial load or tab switch
  useEffect(() => {
    if (!disableAutoLoad && currentTabState.items.length === 0) {
      loadData(activeTab, 0, true);
    }
  }, [activeTab, disableAutoLoad, loadData, currentTabState.items.length]);

  // refreshTrigger watcher
  useEffect(() => {
    const cfg = tabs.find((t) => t.key === activeTab);
    if (cfg?.refreshTrigger !== undefined) {
      loadData(activeTab, 0, true);
    }
  }, [tabs.map((t) => t.refreshTrigger).join(','), activeTab, loadData, tabs]);

  const onRefresh = () => loadData(activeTab, 0, true);
  const handleLoadMore = () => {
    if (
      !currentTabState.loading &&
      !currentTabState.refreshing &&
      currentTabState.hasMore
    ) {
      loadData(activeTab, currentTabState.currentPage + 1);
    }
  };
  const handleTabChange = (key: string) => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    setActiveTab(key);
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setTabsState((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], scrollPosition: y },
    }));
  };

  const renderFooter = () => {
    if (
      !currentTabState.loading &&
      !currentTabState.refreshing &&
      currentTabState.hasMore
    ) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#9F3F3D" />
          <Text style={styles.footerText}>Loading more…</Text>
        </View>
      );
    }
    return null;
  };

  // Get the correct render function for the active tab
  const getCurrentRenderItem = () => {
    return activeTabConfig?.renderItem || renderItem;
  };

  // Get the correct key extractor for the active tab
  const getCurrentKeyExtractor = () => {
    return activeTabConfig?.keyExtractor || keyExtractor;
  };

  const renderContent = () => {
    if (currentTabState.loading && currentTabState.items.length === 0) {
      return  (
      <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#9F3F3D" />
      <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
    }
    if (currentTabState.error && currentTabState.items.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{currentTabState.error}</Text>
          <TouchableOpacity
            onPress={() => loadData(activeTab, 0, true)}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <FlatList testID='flat-list'
          ref={flatListRef}
          data={currentTabState.items}
          keyExtractor={getCurrentKeyExtractor()}
          renderItem={getCurrentRenderItem()}
          contentContainerStyle={contentContainerStyle}
          refreshControl={
            <RefreshControl
              refreshing={currentTabState.refreshing}
              onRefresh={onRefresh}
              colors={['#9F3F3D']}
            />}
          ListEmptyComponent={EmptyListComponent}
          ListFooterComponent={renderFooter}
        />
    );
  };

  // main render
  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.activeTab]}
            testID={`tab-${t.key}`}
            onPress={() => handleTabChange(t.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === t.key && styles.activeTabText,
              ]}
            >
              {t.label}
            </Text>
            {activeTab === t.key && (
              <View
              testID={`indicator-${t.key}`}
              style={styles.activeTabIndicator} /> )}
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsContainer: { flexDirection: 'row', marginBottom: 4 },
  tab: { marginRight: 24, paddingVertical: 8 },
  activeTab: { position: 'relative' },
  tabText: { fontSize: 16, color: '#999', fontWeight: '500' },
  activeTabText: { color: '#333', fontWeight: '600' },
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
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: { fontSize: 16, color: '#F44336', textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#9F3F3D', padding: 10, borderRadius: 5 },
  retryButtonText: { color: 'white', fontWeight: 'bold' },
  footerLoader: { padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { marginLeft: 8, fontSize: 14, color: '#666' },
  emptyContainer: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
});