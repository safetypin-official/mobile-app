import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import NearbyReport from '@/components/displays/NearbyReport';

// Mock the imported components
jest.mock('@/components/displays/post/UserInfo', () => 'UserInfo');
jest.mock('@/components/displays/post/ReportContent', () => 'ReportContent');
jest.mock('@/components/inputs/post/CommentInput', () => 'CommentInput');

// Mock axios
jest.mock('axios');

describe('NearbyReport', () => {
  // Sample post data for testing
  const mockPost = {
    id: '1',
    caption: 'Test caption',
    createdAt: '2023-04-15T10:30:00Z',
    postedBy: 'Test User',
    title: 'Test Title',
    category: 'Traffic',
    latitude: 37.7749,
    longitude: -122.4194,
    imageUrl: 'https://example.com/test.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with initialPost data', () => {
    const { toJSON, getByText } = render(<NearbyReport initialPost={mockPost} />);
    
    // Check if main components are rendered (we can't check for child components directly with the newer version of testing-library)
    expect(toJSON()).toBeTruthy();
    
    // We can assert that there's no loading or error state
    expect(() => getByText(/loading/i)).toThrow();
    expect(() => getByText(/error/i)).toThrow();
  });

  test('displays loading state while fetching post', () => {
    axios.get.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    const { getByText } = render(<NearbyReport postId="123" />);
    
    expect(getByText(/loading post 123/i)).toBeTruthy();
  });

  test('displays error state when fetch fails', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));
    
    const { getByText } = render(<NearbyReport postId="123" />);
    
    // Wait for the error to appear
    await waitFor(() => {
      expect(getByText(/failed to load post/i)).toBeTruthy();
      expect(getByText(/post id: 123/i)).toBeTruthy();
    });
  });

  test('displays post not found when post is undefined', () => {
    // Simulate a situation where post is undefined after loading
    axios.get.mockResolvedValue({ data: { success: true, message: null, data: null } });
    
    const { getByText } = render(<NearbyReport postId="123" />);
    
    return waitFor(() => {
      expect(getByText(/post not found/i)).toBeTruthy();
      expect(getByText(/post id: 123/i)).toBeTruthy();
    });
  });

  test('fetches and displays post data correctly', async () => {
    // Mock the axios response
    axios.get.mockResolvedValue({
      data: {
        success: true,
        message: null,
        data: mockPost
      }
    });
    
    const { UNSAFE_root } = render(<NearbyReport postId="1" />);
    
    // Wait for the data to load
    await waitFor(() => {
      // Now find the components after the data has loaded
      const userInfoComponent = UNSAFE_root.findByType('UserInfo');
      const reportContentComponent = UNSAFE_root.findByType('ReportContent');
      const commentInputComponent = UNSAFE_root.findByType('CommentInput');
      
      // Verify the components exist
      expect(userInfoComponent).toBeTruthy();
      expect(reportContentComponent).toBeTruthy();
      expect(commentInputComponent).toBeTruthy();
      
      // Verify UserInfo props
      expect(userInfoComponent.props.username).toBe('Test User');
      expect(userInfoComponent.props.handle).toBe('@testuser');
      expect(userInfoComponent.props.date).toBe('Apr 15');
      expect(userInfoComponent.props.longitude).toBe(-122.4194);
      expect(userInfoComponent.props.latitude).toBe(37.7749);
      expect(userInfoComponent.props.categoryType).toBe('Traffic');
      
      // Verify ReportContent props
      expect(reportContentComponent.props.title).toBe('Test Title');
      expect(reportContentComponent.props.content).toBe('Test caption');
      expect(reportContentComponent.props.imageUrl).toBe('https://example.com/test.jpg');
      expect(reportContentComponent.props.selectedTags).toEqual(['Traffic']);
      expect(reportContentComponent.props.postId).toBe('1');
    });
  });

  test('handles anonymous user when postedBy is null', () => {
    const postWithNullUser = {
      ...mockPost,
      postedBy: null
    };
    
    const { UNSAFE_root } = render(<NearbyReport initialPost={postWithNullUser} />);
    const userInfoComponent = UNSAFE_root.findByType('UserInfo');
    
    expect(userInfoComponent.props.username).toBe('Anonymous');
    expect(userInfoComponent.props.handle).toBe('@anonymous');
  });

  test('uses default image when imageUrl is null', () => {
    const postWithNullImage = {
      ...mockPost,
      imageUrl: null
    };
    
    const { UNSAFE_root } = render(<NearbyReport initialPost={postWithNullImage} />);
    const reportContentComponent = UNSAFE_root.findByType('ReportContent');
    
    expect(reportContentComponent.props.imageUrl).toBe('https://i.imgur.com/Ha3UkA3.jpg');
  });

  test('formats date correctly', () => {
    const postWithDifferentDate = {
      ...mockPost,
      createdAt: '2023-12-25T10:30:00Z'
    };
    
    const { UNSAFE_root } = render(<NearbyReport initialPost={postWithDifferentDate} />);
    const userInfoComponent = UNSAFE_root.findByType('UserInfo');
    
    expect(userInfoComponent.props.date).toBe('Dec 25');
  });

  test('correctly uses category as tag', () => {
    const postWithCategory = {
      ...mockPost,
      category: 'Weather'
    };
    
    const { UNSAFE_root } = render(<NearbyReport initialPost={postWithCategory} />);
    const reportContentComponent = UNSAFE_root.findByType('ReportContent');
    
    expect(reportContentComponent.props.selectedTags).toEqual(['Weather']);
  });
  
  test('returns empty tags array when category is undefined', () => {
    // Create a post with undefined category
    const postWithoutCategory = {
      ...mockPost,
      category: undefined
    };
    
    const { UNSAFE_root } = render(<NearbyReport initialPost={postWithoutCategory} />);
    const reportContentComponent = UNSAFE_root.findByType('ReportContent');
    
    // This should test line 92 which returns an empty array when post?.category is falsy
    expect(reportContentComponent.props.selectedTags).toEqual([]);
  });
  
  test('returns empty tags array when category is null', () => {
    // Create a post with null category
    const postWithNullCategory = {
      ...mockPost,
      category: null
    };
    
    const { UNSAFE_root } = render(<NearbyReport initialPost={postWithNullCategory} />);
    const reportContentComponent = UNSAFE_root.findByType('ReportContent');
    
    // This should test line 92 which returns an empty array when post?.category is falsy
    expect(reportContentComponent.props.selectedTags).toEqual([]);
  });
  
  test('returns empty tags array when category is empty string', () => {
    // Create a post with empty string category
    const postWithEmptyCategory = {
      ...mockPost,
      category: ''
    };
    
    const { UNSAFE_root } = render(<NearbyReport initialPost={postWithEmptyCategory} />);
    const reportContentComponent = UNSAFE_root.findByType('ReportContent');
    
    // This should test line 92 which returns an empty array when post?.category is falsy
    expect(reportContentComponent.props.selectedTags).toEqual([]);
  });

  test('correctly passes post ID to ReportContent', () => {
    const { UNSAFE_root } = render(<NearbyReport initialPost={mockPost} />);
    const reportContentComponent = UNSAFE_root.findByType('ReportContent');
    
    expect(reportContentComponent.props.postId).toBe('1');
  });
});