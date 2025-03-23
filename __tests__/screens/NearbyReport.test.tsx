import React from 'react';
import { render, screen } from '@testing-library/react-native';
import NearbyReport from '@/app/nearbyReport';

// Mock the imported components using string factory
jest.mock('@/components/displays/post/UserInfo', () => 'UserInfo');
jest.mock('@/components/displays/post/ReportContent', () => 'ReportContent');
jest.mock('@/components/inputs/post/CommentInput', () => 'CommentInput');

describe('NearbyReport', () => {
  // Sample post data for testing
  const mockPost = {
    id: '1',
    caption: 'Test caption',
    createdAt: '2023-04-15T10:30:00Z',
    postedBy: 'Test User',
    title: 'Test Title',
    category: {
      id: 'cat1',
      name: 'Traffic'
    },
    latitude: 37.7749,
    longitude: -122.4194,
    imageUrl: 'https://example.com/test.jpg'
  };

  test('renders correctly with post data', () => {
    const { root } = render(<NearbyReport post={mockPost} />);
    
    // Check if all major components are rendered
    const userInfoComponent = root.findByType('UserInfo');
    const reportContentComponent = root.findByType('ReportContent');
    const commentInputComponent = root.findByType('CommentInput');
    
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
  });

  test('renders correctly with null post data', () => {
    const { root } = render(<NearbyReport />);
    
    // Check if all major components are still rendered
    const userInfoComponent = root.findByType('UserInfo');
    const reportContentComponent = root.findByType('ReportContent');
    const commentInputComponent = root.findByType('CommentInput');
    
    expect(userInfoComponent).toBeTruthy();
    expect(reportContentComponent).toBeTruthy();
    expect(commentInputComponent).toBeTruthy();
    
    // Verify UserInfo default props
    expect(userInfoComponent.props.username).toBe('Anonymous');
    expect(userInfoComponent.props.handle).toBe('@anonymous');
    expect(userInfoComponent.props.date).toBe('');
    expect(userInfoComponent.props.longitude).toBe(0);
    expect(userInfoComponent.props.latitude).toBe(0);
    expect(userInfoComponent.props.categoryType).toBe(undefined);
    
    // Verify ReportContent default props
    expect(reportContentComponent.props.title).toBe('Title');
    expect(reportContentComponent.props.content).toBe('Content');
    expect(reportContentComponent.props.imageUrl).toBe('https://i.imgur.com/Ha3UkA3.jpg');
    expect(reportContentComponent.props.selectedTags).toEqual([]);
  });

  test('renders with anonymous user when postedBy is null', () => {
    const postWithNullUser = {
      ...mockPost,
      postedBy: null
    };
    
    const { root } = render(<NearbyReport post={postWithNullUser} />);
    const userInfoComponent = root.findByType('UserInfo');
    
    expect(userInfoComponent.props.username).toBe('Anonymous');
    expect(userInfoComponent.props.handle).toBe('@anonymous');
  });

  test('handles null imageUrl', () => {
    const postWithNullImage = {
      ...mockPost,
      imageUrl: null
    };
    
    const { root } = render(<NearbyReport post={postWithNullImage} />);
    const reportContentComponent = root.findByType('ReportContent');
    
    expect(reportContentComponent.props.imageUrl).toBe('https://i.imgur.com/Ha3UkA3.jpg');
  });

  test('formats date correctly', () => {
    const postWithDifferentDate = {
      ...mockPost,
      createdAt: '2023-12-25T10:30:00Z'
    };
    
    const { root } = render(<NearbyReport post={postWithDifferentDate} />);
    const userInfoComponent = root.findByType('UserInfo');
    
    expect(userInfoComponent.props.date).toBe('Dec 25');
  });

  test('handles onClose callback', () => {
    const onCloseMock = jest.fn();
    
    render(<NearbyReport post={mockPost} onClose={onCloseMock} />);
    
    // Note: We're not actually testing the onClose functionality here since
    // the component doesn't directly use it in any user interaction
    // This is just verifying it can be passed without errors
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  test('gets correct category tags', () => {
    // Create a post with a different category
    const postWithCategory = {
      ...mockPost,
      category: {
        id: 'cat2',
        name: 'Weather'
      }
    };
    
    const { root } = render(<NearbyReport post={postWithCategory} />);
    const userInfoComponent = root.findByType('UserInfo');
    const reportContentComponent = root.findByType('ReportContent');
    
    expect(userInfoComponent.props.categoryType).toBe('Weather');
    expect(reportContentComponent.props.selectedTags).toEqual(['Weather']);
  });
});