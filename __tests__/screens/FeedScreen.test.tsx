import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FeedScreen from '@/app/feedScreen';

// Mock external dependencies
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 10, bottom: 10, left: 0, right: 0 }),
}));
import UserInfo from '@/components/post/UserInfo';
jest.mock('@/components/post/ReportContent', () => 'ReportContent');
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

// Mock fetch API
global.fetch = jest.fn();

describe('FeedScreen', () => {
  // Mock data for tests
  const mockPosts = [
    {
      id: '1',
      caption: 'Test caption 1',
      createdAt: '2023-01-01T00:00:00Z',
      postedBy: 'TestUser',
      title: 'Test Title 1',
      category: { id: '1', name: 'Theft' },
      latitude: 37.7749,
      longitude: -122.4194,
    },
    {
      id: '2',
      caption: 'Test caption 2',
      createdAt: '2023-01-02T00:00:00Z',
      postedBy: null,
      title: 'Test Title 2',
      category: { id: '2', name: 'Lost Item' },
      latitude: 37.7749,
      longitude: -122.4194,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test initial loading state
  test('renders loading state initially', () => {
    // Mock fetch to not resolve yet
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
    
    const { getByText } = render(<FeedScreen />);
    expect(getByText('Loading posts...')).toBeTruthy();
  });

  // Test successful data fetching
  test('fetches and displays posts', async () => {
    // Mock successful fetch
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })
    );

    const { getByText, queryByText, UNSAFE_getAllByType } = render(<FeedScreen />);
    
    // Initially in loading state
    expect(getByText('Loading posts...')).toBeTruthy();
    
    // Wait for posts to load
    await waitFor(() => {
      expect(queryByText('Loading posts...')).toBeNull();
      const userInfoComponents = UNSAFE_getAllByType(UserInfo);
      expect(userInfoComponents.length).toBe(2);
    });

    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('http://10.0.2.2/post/all');
  });

  // Test error handling
  test('handles fetch error', async () => {
    // Mock fetch error
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );

    const { getByText, queryByText } = render(<FeedScreen />);
    
    // Wait for error state
    await waitFor(() => {
      expect(queryByText('Loading posts...')).toBeNull();
      expect(getByText('Failed to load posts. Please try again by pulling down to refresh.')).toBeTruthy();
    });

    // Test retry button
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );
    
    fireEvent.press(getByText('Retry'));
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  // Test HTTP error response
  test('handles HTTP error response', async () => {
    // Mock HTTP error
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    const { getByText } = render(<FeedScreen />);
    
    // Wait for error state
    await waitFor(() => {
      expect(getByText('Failed to load posts. Please try again by pulling down to refresh.')).toBeTruthy();
    });
  });

  // Test tab switching
  test('switches between tabs', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    const { getByText } = render(<FeedScreen />);
    
    // Initially "Near You" tab should be active
    const nearYouTab = getByText('Near You');
    expect(nearYouTab).toBeTruthy();
    
    // Switch to "Recents" tab
    const recentsTab = getByText('Recents');
    fireEvent.press(recentsTab);
  });

  // Test pull-to-refresh
  test('handles pull-to-refresh', async () => {
    // Setup initial successful fetch
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })
    );

    const { UNSAFE_getByType } = render(<FeedScreen />);
    
    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Setup next fetch response
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })
    );

    // Trigger refresh
    const flatList = UNSAFE_getByType('FlatList');
    const refreshControl = flatList.props.refreshControl;
    fireEvent(refreshControl, 'onRefresh');
    
    // Verify second fetch was triggered
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  // Test rendering of empty state
  test('renders empty state when no posts are available', async () => {
    // Mock successful fetch with empty array
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    const { getByText } = render(<FeedScreen />);
    
    // Wait for empty state
    await waitFor(() => {
      expect(getByText('No posts available')).toBeTruthy();
    });
  });

  // Test username and handle formatting
  test('formats username and handle correctly', async () => {
    const testPosts = [
      {
        id: '1',
        caption: 'Test',
        createdAt: '2023-01-01T00:00:00Z',
        postedBy: 'John Doe',
        title: 'Title',
        category: { id: '1', name: 'Theft' },
        latitude: 0,
        longitude: 0,
      },
      {
        id: '2',
        caption: 'Test',
        createdAt: '2023-01-02T00:00:00Z',
        postedBy: null,
        title: 'Title',
        category: { id: '1', name: 'Theft' },
        latitude: 0,
        longitude: 0,
      }
    ];
    
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(testPosts),
      })
    );

    const { UNSAFE_getAllByType } = render(<FeedScreen />);
    
    // Check username and handle formatting
    await waitFor(() => {
      const userInfoComponents = UNSAFE_getAllByType('UserInfo');
      expect(userInfoComponents.length).toBe(2);
      
      // Check first post with name
      expect(userInfoComponents[0].props.username).toBe('John Doe');
      expect(userInfoComponents[0].props.handle).toBe('@johndoe');
      
      // Check second post with null name (anonymous)
      expect(userInfoComponents[1].props.username).toBe('Anonymous');
      expect(userInfoComponents[1].props.handle).toBe('@anonymous');
    });
  });

  // Test date formatting
  test('formats date correctly', async () => {
    const testPost = {
      id: '1',
      caption: 'Test',
      createdAt: '2023-01-15T12:00:00Z',
      postedBy: 'User',
      title: 'Title',
      category: { id: '1', name: 'Theft' },
      latitude: 0,
      longitude: 0,
    };
    
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([testPost]),
      })
    );

    const { UNSAFE_getAllByType } = render(<FeedScreen />);
    
    // Check formatted date in UserInfo props
    await waitFor(() => {
      const userInfo = UNSAFE_getAllByType('UserInfo')[0];
      expect(userInfo.props.date).toBe('Jan 15');
    });
  });

  // Test category tags mapping
  test('maps category tags correctly', async () => {
    const categoryPosts = [
      {
        id: '1',
        caption: 'Test',
        createdAt: '2023-01-01T00:00:00Z',
        postedBy: 'User',
        title: 'Title',
        category: { id: '1', name: 'Theft' },
        latitude: 0,
        longitude: 0,
      },
      {
        id: '2',
        caption: 'Test',
        createdAt: '2023-01-02T00:00:00Z',
        postedBy: 'User',
        title: 'Title',
        category: null, // Test null category
        latitude: 0,
        longitude: 0,
      }
    ];
    
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(categoryPosts),
      })
    );

    const { UNSAFE_getAllByType } = render(<FeedScreen />);
    
    // Check category tags
    await waitFor(() => {
      const reportContents = UNSAFE_getAllByType('ReportContent');
      expect(reportContents.length).toBe(2);
      
      // First post with category
      expect(reportContents[0].props.selectedTags).toEqual(['Theft']);
      
      // Second post with null category
      expect(reportContents[1].props.selectedTags).toEqual([]);
    });
  });

  // Test different category mappings for getPinType
  test('maps different categories to pin types correctly', async () => {
    const categories = [
      { id: '1', name: 'Lost Item', expected: 'lost-item' },
      { id: '2', name: 'Found Item', expected: 'found-item' },
      { id: '3', name: 'Harassment', expected: 'harassment' },
      { id: '4', name: 'Flood', expected: 'flood' },
      { id: '5', name: 'Assault', expected: 'assault' },
      { id: '6', name: 'Fire', expected: 'fire' },
      { id: '7', name: 'Earthquake', expected: 'earthquake' },
      { id: '8', name: 'Other Disaster', expected: 'other-disaster' },
      { id: '9', name: 'Other Crime', expected: 'other-crime' },
      { id: '10', name: 'Crime Watch', expected: 'theft' }, // Mapped to theft
      { id: '11', name: 'Service Issue', expected: 'other-crime' },
      { id: '12', name: 'Unknown Category', expected: 'other-crime' }, // Default case
    ];
    
    // Create mock posts with each category
    const categoryPosts = categories.map((cat, index) => ({
      id: String(index),
      caption: `Test ${index}`,
      createdAt: new Date(2023, 0, index + 1).toISOString(),
      postedBy: `User${index}`,
      title: `Title ${index}`,
      category: cat,
      latitude: 0,
      longitude: 0,
    }));
    
    // Add a post with null category to test default behavior
    categoryPosts.push({
      id: 'null-category',
      caption: 'Test null category',
      createdAt: new Date(2023, 0, 20).toISOString(),
      postedBy: 'User',
      title: 'Title',
      category: null,
      latitude: 0,
      longitude: 0,
    });
    
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(categoryPosts),
      })
    );

    const { UNSAFE_getAllByType } = render(<FeedScreen />);
    
    // Check if all category types are mapped correctly
    await waitFor(() => {
      const userInfoComponents = UNSAFE_getAllByType('UserInfo');
      expect(userInfoComponents.length).toBe(categories.length + 1); // +1 for the null category
      
      // Check each category mapping
      categories.forEach((cat, index) => {
        expect(userInfoComponents[index].props.categoryType).toBe(cat.expected);
      });
      
      // Check null category
      expect(userInfoComponents[categories.length].props.categoryType).toBe('other-crime');
    });
  });

  // Test sorting of posts by createdAt
  test('sorts posts by createdAt in descending order', async () => {
    const unsortedPosts = [
      {
        id: '1',
        caption: 'Older post',
        createdAt: '2023-01-01T00:00:00Z',
        postedBy: 'User1',
        title: 'Title 1',
        category: { id: '1', name: 'Theft' },
        latitude: 0,
        longitude: 0,
      },
      {
        id: '2',
        caption: 'Newer post',
        createdAt: '2023-01-02T00:00:00Z',
        postedBy: 'User2',
        title: 'Title 2',
        category: { id: '1', name: 'Theft' },
        latitude: 0,
        longitude: 0,
      },
    ];
    
    // We'll return posts in reversed order to test sorting
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([...unsortedPosts].reverse()),
      })
    );

    const { UNSAFE_getAllByType } = render(<FeedScreen />);
    
    // Check if posts are sorted by createdAt
    await waitFor(() => {
      const reportContentComponents = UNSAFE_getAllByType('ReportContent');
      expect(reportContentComponents.length).toBe(2);
      
      // First post should be the newer one
      expect(reportContentComponents[0].props.title).toBe('Title 2');
      expect(reportContentComponents[0].props.content).toBe('Newer post');
      
      // Second post should be the older one
      expect(reportContentComponents[1].props.title).toBe('Title 1');
      expect(reportContentComponents[1].props.content).toBe('Older post');
    });
  });

  // Test search input functionality
  test('renders search input', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    const { getByPlaceholderText } = render(<FeedScreen />);
    
    // Check if search input is rendered
    const searchInput = getByPlaceholderText('Search');
    expect(searchInput).toBeTruthy();
    
    // Test input change (even though it doesn't affect component state in this version)
    fireEvent.changeText(searchInput, 'search term');
  });

  // Test filter button and mic button
  test('renders filter and mic buttons', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    const { UNSAFE_getAllByType } = render(<FeedScreen />);
    
    // Find all Feather icons
    const featherIcons = UNSAFE_getAllByType('Feather');
    
    // Find filter icon (menu) and mic icon
    const menuIcon = featherIcons.find(icon => icon.props.name === 'menu');
    const micIcon = featherIcons.find(icon => icon.props.name === 'mic');
    
    expect(menuIcon).toBeTruthy();
    expect(micIcon).toBeTruthy();
    
    // Test pressing the filter button and mic button
    const filterButton = menuIcon.parent;
    const micButton = micIcon.parent;
    
    fireEvent.press(filterButton);
    fireEvent.press(micButton);
  });
});