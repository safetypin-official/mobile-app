import React from 'react';
import { act, render, waitFor } from '@testing-library/react-native';
import SearchPage from '@/app/search/index';
import * as Location from 'expo-location';

// Variable to capture PostsTabs props
let postsTabsProps: any = null;

// --- Mocks ---

// Mock expo-location functions.
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// Mock PostsTabs to capture its props (without stripping functions).
jest.mock('@/components/displays/PostsTabs', () => {
  const { Text } = require('react-native');
  return (props: any) => {
    postsTabsProps = props;
    return <Text testID="posts-tabs" />;
  };
});

// Mock SearchBarFilter with a testID.
jest.mock('@/components/inputs/SearchBarFilter', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text testID="search-bar-filter">SearchBarFilter</Text>;
});

// Mock UserInfo and ReportContent to allow inspection of props.
jest.mock('@/components/displays/post/UserInfo', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text testID="user-info">{JSON.stringify(props)}</Text>;
});
jest.mock('@/components/displays/post/ReportContent', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text testID="report-content">{JSON.stringify(props)}</Text>;
});

beforeEach(() => {
  postsTabsProps = null;
  jest.resetAllMocks();
  global.fetch = jest.fn();
});

describe('SearchPage', () => {
  const grantedLocation = { status: 'granted' };
  const deniedLocation = { status: 'denied' };
  const mockCoords = { latitude: 10, longitude: 20 };

  const samplePost = {
    id: '1',
    title: 'Sample Title',
    caption: 'Sample Caption',
    createdAt: '2023-04-05T00:00:00Z',
    postedBy: null, // Should default to "Anonymous"
    category: 'general',
    imageUrl: '',
    latitude: 0,
    longitude: 0,
  };

  // --- Layout and Rendering Tests ---

  test('renders SearchPage components correctly', () => {
    const { getByTestId, getByText } = render(<SearchPage />);
    // Check SafeAreaView, container View, header, and SearchBarFilter are rendered.
    expect(getByTestId('search-page-safeAreaView')).toBeTruthy();
    expect(getByTestId('search-page')).toBeTruthy();
    expect(getByText('Search')).toBeTruthy();
    expect(getByTestId('search-bar-filter')).toBeTruthy();
  });

  test('SafeAreaView has correct style', () => {
    const { getByTestId } = render(<SearchPage />);
    const safeAreaView = getByTestId('search-page-safeAreaView');
    expect(safeAreaView.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#ffffff',
        flex: 1,
      })
    );
  });

  test('container View has correct style', () => {
    const { getByTestId } = render(<SearchPage />);
    const container = getByTestId('search-page');
    expect(container.props.style).toEqual(
      expect.objectContaining({
        flex: 1,
        paddingHorizontal: 16,
      })
    );
  });

  // --- Location & Fetch Function Tests ---

  test('sets user location when permission is granted and fetchTopPosts returns posts on success', async () => {
    // Simulate successful location request.
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: mockCoords });
    
    // Render the component outside of act().
    render(<SearchPage />);
    
    // Now flush effects by waiting inside act().
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    
    // postsTabsProps should now be updated.
    const topTab = postsTabsProps.tabs.find((tab: any) => tab.key === 'top');
    expect(topTab).toBeTruthy();
  
    // Set up fetch to return a successful response.
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          content: [
            {
              post: {
                id: '1',
                title: 'Test Top Post',
                caption: 'Caption',
                createdAt: '2023-04-05T00:00:00Z',
                postedBy: 'User',
                category: 'news',
                imageUrl: 'http://example.com/img.jpg',
                latitude: mockCoords.latitude,
                longitude: mockCoords.longitude,
              },
            },
          ],
          last: true,
        },
      }),
    });
  
    let result;
    await act(async () => {
      result = await topTab.fetchPosts(1, false);
    });
    expect(global.fetch).toHaveBeenCalledWith(
      `https://safetypin.ppl.cs.ui.ac.id/post/feed/distance?lat=${mockCoords.latitude}&lon=${mockCoords.longitude}&page=1&size=10`
    );
    expect(result).toEqual({
      posts: [
        {
          id: '1',
          title: 'Test Top Post',
          caption: 'Caption',
          createdAt: '2023-04-05T00:00:00Z',
          postedBy: 'User',
          category: 'news',
          imageUrl: 'http://example.com/img.jpg',
          latitude: mockCoords.latitude,
          longitude: mockCoords.longitude,
        },
      ],
      currentPage: 1,
      hasMore: false,
    });
  });  

  test('fetchLatestPosts returns posts on success', async () => {
    // Latest posts do not depend on location.
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: mockCoords });
    render(<SearchPage />);
    await waitFor(() => {
      expect(postsTabsProps).not.toBeNull();
    });
    const latestTab = postsTabsProps.tabs.find((tab: any) => tab.key === 'latest');
    expect(latestTab).toBeTruthy();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          content: [
            {
              post: {
                id: '2',
                title: 'Latest Post',
                caption: 'Latest Caption',
                createdAt: '2023-04-05T00:00:00Z',
                postedBy: 'LatestUser',
                category: 'updates',
                imageUrl: 'http://example.com/latest.jpg',
                latitude: 5,
                longitude: 6,
              },
            },
          ],
          last: false,
        },
      }),
    });
    const result = await latestTab.fetchPosts(1, false);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://safetypin.ppl.cs.ui.ac.id/post/feed/timestamp?page=1&size=10`
    );
    expect(result).toEqual({
      posts: [
        {
          id: '2',
          title: 'Latest Post',
          caption: 'Latest Caption',
          createdAt: '2023-04-05T00:00:00Z',
          postedBy: 'LatestUser',
          category: 'updates',
          imageUrl: 'http://example.com/latest.jpg',
          latitude: 5,
          longitude: 6,
        },
      ],
      currentPage: 1,
      hasMore: true,
    });
  });

  test('fetchTopPosts throws error when location is not available due to permission denied', async () => {
    // Simulate permission denied.
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(deniedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('Location error'));
    render(<SearchPage />);
    await waitFor(() => {
      expect(postsTabsProps).not.toBeNull();
    });
    const topTab = postsTabsProps.tabs.find((tab: any) => tab.key === 'top');
    await waitFor(() =>
      expect(topTab.fetchPosts(1, false)).rejects.toThrow(
        'Permission to access location was denied'
      )
    );
  });

  test('fetchTopPosts throws error when getCurrentPositionAsync fails (catch block)', async () => {
    // Simulate permission granted but getCurrentPositionAsync fails.
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('Test error'));
    render(<SearchPage />);
    await waitFor(() => {
      expect(postsTabsProps).not.toBeNull();
    });
    const topTab = postsTabsProps.tabs.find((tab: any) => tab.key === 'top');
    await waitFor(() =>
      expect(topTab.fetchPosts(1, false)).rejects.toThrow(
        'Location not available'
      )
    );
  });

  test('fetchLatestPosts throws error for non-ok HTTP response', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: mockCoords });
    render(<SearchPage />);
    await waitFor(() => {
      expect(postsTabsProps).not.toBeNull();
    });
    const latestTab = postsTabsProps.tabs.find((tab: any) => tab.key === 'latest');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });
    await expect(latestTab.fetchPosts(1, false)).rejects.toThrow('HTTP error: 404');
  });

  test('fetchTopPosts throws error for non-ok HTTP response', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: mockCoords });
    render(<SearchPage />);
    await waitFor(() => {
      expect(postsTabsProps).not.toBeNull();
    });
    const topTab = postsTabsProps.tabs.find((tab: any) => tab.key === 'top');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });
    await waitFor(() =>
      expect(topTab.fetchPosts(1, false)).rejects.toThrow('Location not available')
    );
  });

  // --- Render Post Item Tests ---

  test('renderPostItem renders UserInfo and ReportContent correctly', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: mockCoords });
    render(<SearchPage />);
    await waitFor(() => {
      expect(postsTabsProps).not.toBeNull();
    });
    const renderItem = postsTabsProps.renderItem;
    const renderedItem = renderItem({ item: samplePost });
    const { getByTestId } = render(renderedItem);
    // Check that UserInfo renders with fallback for postedBy ("Anonymous")
    const userInfo = getByTestId('user-info');
    const userInfoProps = JSON.parse(userInfo.props.children);
    expect(userInfoProps.username).toBe('Anonymous');
    expect(userInfoProps.handle).toBe('@anonymous');
    expect(userInfoProps.date).toContain('Apr');
    // Check ReportContent props
    const reportContent = getByTestId('report-content');
    const reportContentProps = JSON.parse(reportContent.props.children);
    expect(reportContentProps.title).toBe(samplePost.title);
    expect(reportContentProps.selectedTags).toEqual(['general']);
  });
});
