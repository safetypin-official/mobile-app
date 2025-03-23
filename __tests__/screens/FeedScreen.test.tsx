import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { act } from 'react-test-renderer';
import FeedScreen from '@/app/feedScreen'; // Adjust path as needed

// Mock fetch function
global.fetch = jest.fn();

// Create arrays to track the props passed to our mocked components
const userInfoProps: any[] = [];
const reportContentProps: any[] = [];

// Mock components properly to avoid "Functions not valid as React child" warnings
jest.mock('@/components/displays/post/UserInfo', () => {
  return function MockUserInfo(props: any) {
    // Store the props for later assertions
    userInfoProps.push(props);
    return null;
  };
});

jest.mock('@/components/displays/post/ReportContent', () => {
  return function MockReportContent(props: any) {
    // Store the props for later assertions
    reportContentProps.push(props);
    return null;
  };
});

// Mock other dependencies
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 10, right: 0, bottom: 20, left: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: () => null,
}));

// Define types for mocks and tests
type MockPost = {
  id: string;
  title: string;
  caption: string;
  createdAt: string;
  postedBy: string | null;
  category: { id: string; name: string } | null;
  latitude: number;
  longitude: number;
  imageUrl: string | undefined;
};

// Define constants used in the component
const NAVBAR_HEIGHT = 60;

describe('FeedScreen Component', () => {
  // Sample mock data for posts
  const mockPosts: MockPost[] = [
    {
      id: '1',
      title: 'Test Post 1',
      caption: 'This is a test post',
      createdAt: '2023-01-01T12:00:00Z',
      postedBy: 'TestUser',
      category: { id: '1', name: 'Theft' },
      latitude: 35.12345,
      longitude: -120.98765,
      imageUrl: 'https://example.com/image1.jpg',
    },
    {
      id: '2',
      title: 'Test Post 2',
      caption: 'This is another test post',
      createdAt: '2023-01-02T12:00:00Z',
      postedBy: null,
      category: { id: '2', name: 'Lost Item' },
      latitude: 35.54321,
      longitude: -120.12345,
      imageUrl: undefined,
    },
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    userInfoProps.length = 0;
    reportContentProps.length = 0;
  });

  test('renders loading state initially', async () => {
    // Mock fetch to return a pending promise that never resolves
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
    
    const { getByText, queryByText } = render(<FeedScreen />);
    
    // Wait for the loading state
    await waitFor(() => {
      expect(getByText('Loading posts...')).toBeTruthy();
      expect(queryByText('No posts available')).toBeNull();
    });
  });

  test('renders posts successfully after fetching', async () => {
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })
    );
    
    // Render the component
    render(<FeedScreen />);
    
    // Wait for the posts to render and props to be collected
    await waitFor(() => {
      expect(userInfoProps.length).toBe(2);
      expect(reportContentProps.length).toBe(2);
    });
    
    // Find props by id instead of relying on order
    // Sort the collected props by post ID to ensure consistent order for testing
    const sortedUserProps = [...userInfoProps].sort((a, b) => {
      // Extract the post ID from the longitude/latitude which are unique per post
      return a.longitude - b.longitude;
    });
    
    const sortedReportProps = [...reportContentProps].sort((a, b) => {
      // Sort by title which is unique per post
      return a.title.localeCompare(b.title);
    });
    
    // Check UserInfo props for "TestUser" post (first in sorted order)
    expect(sortedUserProps[0].username).toBe('TestUser');
    expect(sortedUserProps[0].handle).toBe('@testuser');
    expect(sortedUserProps[0].date).toBe('Jan 1');
    expect(sortedUserProps[0].categoryType).toBe('Theft');
    
    // Check UserInfo props for "Anonymous" post (second in sorted order)
    expect(sortedUserProps[1].username).toBe('Anonymous');
    expect(sortedUserProps[1].handle).toBe('@anonymous');
    expect(sortedUserProps[1].date).toBe('Jan 2');
    expect(sortedUserProps[1].categoryType).toBe('Lost Item');
    
    // Check ReportContent props
    expect(sortedReportProps[0].title).toBe('Test Post 1');
    expect(sortedReportProps[0].selectedTags).toEqual(['Theft']);
    
    expect(sortedReportProps[1].title).toBe('Test Post 2');
    expect(sortedReportProps[1].selectedTags).toEqual(['Lost Item']);
  });

  test('renders error state when fetch fails', async () => {
    // Mock failed fetch response
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );
    
    const { getByText } = render(<FeedScreen />);
    
    // Wait for error state to display
    await waitFor(() => {
      expect(getByText('Failed to load posts. Please try again by pulling down to refresh.')).toBeTruthy();
      expect(getByText('Retry')).toBeTruthy();
    });
  });

  test('handles network error when fetching', async () => {
    // Mock network error
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    const { getByText } = render(<FeedScreen />);
    
    // Wait for error state to display
    await waitFor(() => {
      expect(getByText('Failed to load posts. Please try again by pulling down to refresh.')).toBeTruthy();
    });
  });

  test('renders empty state when no posts are available', async () => {
    // Mock successful fetch but empty response
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );
    
    const { getByText } = render(<FeedScreen />);
    
    // Wait for empty state to display
    await waitFor(() => {
      expect(getByText('No posts available')).toBeTruthy();
    });
  });

  test('retries fetching posts when retry button is pressed', async () => {
    // Mock first fetch to fail
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );
    
    const { getByText } = render(<FeedScreen />);
    
    // Wait for error state
    await waitFor(() => {
      expect(getByText('Retry')).toBeTruthy();
    });
    
    // Mock second fetch to succeed
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })
    );
    
    // Press retry button within act()
    await act(async () => {
      fireEvent.press(getByText('Retry'));
    });
    
    // Check that second fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  test('switches between tabs', async () => {
    // Mock successful fetch
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })
    );
    
    const { getByText } = render(<FeedScreen />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(getByText('Near You')).toBeTruthy();
    });
    
    // Get the tabs
    const nearYouTab = getByText('Near You');
    const recentsTab = getByText('Recents');
    
    // Initially Near You tab should be active
    expect(nearYouTab.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#333' })
      ])
    );
    expect(recentsTab.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#999' })
      ])
    );
    
    // Switch to Recents tab within act()
    await act(async () => {
      fireEvent.press(recentsTab);
    });
    
    // After switch, Recents tab should be active
    expect(nearYouTab.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#999' })
      ])
    );
    expect(recentsTab.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#333' })
      ])
    );
    
    // Switch back to Near You tab to cover line 207
    await act(async () => {
      fireEvent.press(nearYouTab);
    });
    
    // After switching back, Near You tab should be active again
    expect(nearYouTab.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#333' })
      ])
    );
    expect(recentsTab.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#999' })
      ])
    );
  });

  test('refreshes posts on pull-to-refresh', async () => {
    // Mock first fetch to succeed
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })
    );
    
    const rendered = render(<FeedScreen />);
    
    // Wait for posts to load
    await waitFor(() => {
      expect(userInfoProps.length).toBe(2);
    });
    
    // Clear props arrays for next assertion
    userInfoProps.length = 0;
    reportContentProps.length = 0;
    
    // Mock second fetch for refresh
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([...mockPosts]),
      })
    );
    
    // Find FlatList by querying for it
    const flatList = rendered.UNSAFE_queryByType(FlatList);
    expect(flatList).toBeTruthy();
    
    if (flatList) {
      // Trigger refresh within act()
      await act(async () => {
        flatList.props.refreshControl.props.onRefresh();
      });
      
      // Check that second fetch was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(userInfoProps.length).toBe(2); // Should render posts again
      });
    }
  });

  test('sorts posts by date (newest first)', async () => {
    // Create posts with different dates
    const unsortedPosts: MockPost[] = [
      {
        id: '1',
        title: 'Older Post',
        caption: 'This is an older post',
        createdAt: '2023-01-01T12:00:00Z',
        postedBy: 'User1',
        category: { id: '1', name: 'Theft' },
        latitude: 35.0,
        longitude: -120.0,
        imageUrl: undefined,
      },
      {
        id: '2',
        title: 'Newest Post',
        caption: 'This is the newest post',
        createdAt: '2023-01-03T12:00:00Z',
        postedBy: 'User2',
        category: { id: '2', name: 'Lost Item' },
        latitude: 35.0,
        longitude: -120.0,
        imageUrl: undefined,
      },
      {
        id: '3',
        title: 'Middle Post',
        caption: 'This is a middle-aged post',
        createdAt: '2023-01-02T12:00:00Z',
        postedBy: 'User3',
        category: { id: '3', name: 'Fire' },
        latitude: 35.0,
        longitude: -120.0,
        imageUrl: undefined,
      },
    ];
    
    // Mock successful fetch with unsorted posts
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(unsortedPosts),
      })
    );
    
    // Reset arrays
    reportContentProps.length = 0;
    
    render(<FeedScreen />);
    
    // Wait for ReportContent props to be collected
    await waitFor(() => {
      expect(reportContentProps.length).toBe(3);
    });
    
    // Check that posts are sorted by date (newest first)
    expect(reportContentProps[0].title).toBe('Newest Post');
    expect(reportContentProps[1].title).toBe('Middle Post');
    expect(reportContentProps[2].title).toBe('Older Post');
  });

  test('interacts with UI elements', async () => {
    // Mock successful fetch
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })
    );
    
    const rendered = render(<FeedScreen />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(userInfoProps.length).toBe(2);
    });
    
    const { getByPlaceholderText, UNSAFE_getAllByType } = rendered;
    
    // Get the search input and type in it
    const searchInput = getByPlaceholderText('Search');
    await act(async () => {
      fireEvent.changeText(searchInput, 'test search');
    });
    
    // Find all TouchableOpacity components
    const touchableOpacities = UNSAFE_getAllByType(TouchableOpacity);
    
    // Find and press filter button (menu icon)
    const filterButton = touchableOpacities.find(button => {
      return button.props.children && 
        typeof button.props.children === 'object' &&
        button.props.children.type === 'Feather' && 
        button.props.children.props && 
        button.props.children.props.name === 'menu';
    });
    
    if (filterButton) {
      await act(async () => {
        fireEvent.press(filterButton);
      });
    }
    
    // Find and press mic button
    const micButton = touchableOpacities.find(button => {
      return button.props.children && 
        typeof button.props.children === 'object' &&
        button.props.children.type === 'Feather' && 
        button.props.children.props && 
        button.props.children.props.name === 'mic';
    });
    
    if (micButton) {
      await act(async () => {
        fireEvent.press(micButton);
      });
    }
  });
  
  test('renders with safe area insets', async () => {
    // Mock successful fetch
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })
    );
    
    const rendered = render(<FeedScreen />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(userInfoProps.length).toBe(2);
    });
    
    // Find container View with padding
    const containers = rendered.UNSAFE_getAllByType(View);
    const containerWithPadding = containers.find(container => 
      container.props.style && 
      Array.isArray(container.props.style) && 
      container.props.style.some((style: any) => 
        style && style.paddingTop === 10
      )
    );
    
    expect(containerWithPadding).toBeTruthy();
    
    // Find FlatList with bottom padding
    const flatList = rendered.UNSAFE_queryByType(FlatList);
    expect(flatList).toBeTruthy();
    
    if (flatList) {
      // Check the contentContainerStyle includes the correct paddingBottom
      const contentContainerStyle = flatList.props.contentContainerStyle;
      expect(contentContainerStyle).toBeTruthy();
      
      // The style could be an object or array, so we need to handle both cases
      if (Array.isArray(contentContainerStyle)) {
        // If it's an array, find an object with paddingBottom
        const hasPaddingBottom = contentContainerStyle.some(
          (style: any) => style && style.paddingBottom === NAVBAR_HEIGHT + 20
        );
        expect(hasPaddingBottom).toBeTruthy();
      } else {
        // If it's an object, check paddingBottom directly
        expect(contentContainerStyle.paddingBottom).toBe(NAVBAR_HEIGHT + 20);
      }
    }
  });
});