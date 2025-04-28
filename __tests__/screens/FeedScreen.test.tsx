import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import FeedScreen from '@/app/feedScreen/index';
import * as Location from 'expo-location';

// This variable will hold the props passed to the PostsTabs component.
let postsTabsProps: any = null;

// --- Mocks ---
// Mock expo-location functions.
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// Mock PostsTabs to capture its props without stringifying functions.
jest.mock('@/components/displays/PostsTabs', () => {
  const { Text } = require('react-native');
  return (props: any) => {
    postsTabsProps = props;
    return <Text testID="posts-tabs" />;
  };
});

// Mock UserInfo and ReportContent to verify renderPostItem output.
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

describe('FeedScreen', () => {
  const grantedLocation = { status: 'granted' };
  const deniedLocation = { status: 'denied' };
  const mockCoords = { latitude: 10, longitude: 20 };

  const samplePost = {
    id: '1',
    title: 'Sample Title',
    caption: 'Sample Caption',
    createdAt: '2023-04-05T00:00:00Z',
    postedBy: null, // should fallback to "Anonymous"
    category: 'general',
    imageUrl: '',
    latitude: 0,
    longitude: 0,
  };

  test('renders header and PostsTabs', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: mockCoords });
    const { getByText, getByTestId } = render(<FeedScreen />);
    await waitFor(() => expect(getByText('Explore')).toBeTruthy());
    expect(getByTestId('posts-tabs')).toBeTruthy();
  });

  test('sets user location when permission is granted', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: mockCoords });
    render(<FeedScreen />);
    await waitFor(() => {
      expect(postsTabsProps).not.toBeNull();
    });
    expect(postsTabsProps.tabs).toHaveLength(2);
  });

  test('fetchNearYouPosts returns posts on success', async () => {
    // Simulate permission granted and valid location.
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: mockCoords });
    // Set up fetch to return a successful response with one post.
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          content: [
            {
              post: {
                id: '1',
                title: 'Test Post',
                caption: 'Test Caption',
                createdAt: '2023-04-05T00:00:00Z',
                postedBy: 'TestUser',
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
    render(<FeedScreen />);
    let result;
    // Wait until userLocation is set so that fetchPosts does not throw.
    await waitFor(async () => {
      const nearYouTab = postsTabsProps.tabs.find((tab: any) => tab.key === 'near_you');
      result = await nearYouTab.fetchPosts(1, false);
      expect(result).toBeDefined();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      `https://safetypin.ppl.cs.ui.ac.id/post/feed/distance?lat=${mockCoords.latitude}&lon=${mockCoords.longitude}&page=1&size=10`
    );
    expect(result).toEqual({
      posts: [
        {
          id: '1',
          title: 'Test Post',
          caption: 'Test Caption',
          createdAt: '2023-04-05T00:00:00Z',
          postedBy: 'TestUser',
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

  test('fetchRecentsPosts returns posts on success', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: mockCoords });
    // Set up fetch to return a successful response for recents.
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          content: [
            {
              post: {
                id: '2',
                title: 'Recent Post',
                caption: 'Recent Caption',
                createdAt: '2023-04-05T00:00:00Z',
                postedBy: 'RecentUser',
                category: 'updates',
                imageUrl: 'http://example.com/recent.jpg',
                latitude: 5,
                longitude: 6,
              },
            },
          ],
          last: false,
        },
      }),
    });
    render(<FeedScreen />);
    await waitFor(() => {
      expect(postsTabsProps).not.toBeNull();
    });
    const recentsTab = postsTabsProps.tabs.find((tab: any) => tab.key === 'recents');
    expect(recentsTab).toBeTruthy();

    // No location dependency here so we can call directly.
    const result = await recentsTab.fetchPosts(1, false);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://safetypin.ppl.cs.ui.ac.id/post/feed/timestamp?page=1&size=10`
    );
    expect(result).toEqual({
      posts: [
        {
          id: '2',
          title: 'Recent Post',
          caption: 'Recent Caption',
          createdAt: '2023-04-05T00:00:00Z',
          postedBy: 'RecentUser',
          category: 'updates',
          imageUrl: 'http://example.com/recent.jpg',
          latitude: 5,
          longitude: 6,
        },
      ],
      currentPage: 1,
      hasMore: true,
    });
  });

  test('fetchNearYouPosts throws error when location is not available due to denied permission', async () => {
    // Simulate permission denied so that location is not set.
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(deniedLocation);
    // Even if getCurrentPositionAsync is not called, we can simulate a rejection.
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('Location error'));
    render(<FeedScreen />);
    await waitFor(() => {
      expect(postsTabsProps).not.toBeNull();
    });
    const nearYouTab = postsTabsProps.tabs.find((tab: any) => tab.key === 'near_you');
    expect(nearYouTab).toBeTruthy();
    await waitFor(() =>
      expect(nearYouTab.fetchPosts(1, false)).rejects.toThrow(
        'Permission to access location was denied'
      )
    );
  });

  test('fetchNearYouPosts throws error when getCurrentPositionAsync fails (catch block)', async () => {
    // Simulate permission granted but getCurrentPositionAsync fails.
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('Test error'));
    render(<FeedScreen />);
    await waitFor(() => {
      expect(postsTabsProps).not.toBeNull();
    });
    const nearYouTab = postsTabsProps.tabs.find((tab: any) => tab.key === 'near_you');
    await waitFor(() =>
      expect(nearYouTab.fetchPosts(1, false)).rejects.toThrow(
        'Location not available'
      )
    );
  });

  test('fetchNearYouPosts throws error for non-ok HTTP response', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: mockCoords });
    // Simulate an HTTP error response.
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });
    render(<FeedScreen />);
    await waitFor(() => {
      expect(postsTabsProps).not.toBeNull();
    });
    const nearYouTab = postsTabsProps.tabs.find((tab: any) => tab.key === 'near_you');
    await waitFor(() =>
      expect(nearYouTab.fetchPosts(1, false)).rejects.toThrow('Location not available')
    );
  });

  test('fetchRecentsPosts throws error for non-ok HTTP response', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: mockCoords });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });
    render(<FeedScreen />);
    await waitFor(() => {
      expect(postsTabsProps).not.toBeNull();
    });
    const recentsTab = postsTabsProps.tabs.find((tab: any) => tab.key === 'recents');
    await expect(recentsTab.fetchPosts(1, false)).rejects.toThrow('HTTP error: 404');
  });

  test('renderPostItem renders UserInfo and ReportContent correctly', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(grantedLocation);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: mockCoords });
    const { } = render(<FeedScreen />);
    await waitFor(() => {
      expect(postsTabsProps).not.toBeNull();
    });
    // Call the renderItem function with a sample post.
    const renderedItem = postsTabsProps.renderItem({ item: samplePost });
    const { getByTestId: getByTestIdInItem } = render(renderedItem);
    // Verify UserInfo renders with fallback for postedBy.
    const userInfo = getByTestIdInItem('user-info');
    const userInfoProps = JSON.parse(userInfo.props.children);
    expect(userInfoProps.username).toBe('Anonymous');
    expect(userInfoProps.handle).toBe('@anonymous');
    expect(userInfoProps.date).toContain('Apr');
    // Verify ReportContent receives the correct title and tags.
    const reportContent = getByTestIdInItem('report-content');
    const reportContentProps = JSON.parse(reportContent.props.children);
    expect(reportContentProps.title).toBe(samplePost.title);
    expect(reportContentProps.selectedTags).toEqual(['general']);
  });
});
