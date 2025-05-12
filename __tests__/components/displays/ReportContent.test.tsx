import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ReportContent, { TagKey } from '@/components/displays/post/ReportContent';

// Mock the Share API separately without spreading the entire react-native
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(() => Promise.resolve({ action: 'sharedAction', activityType: 'test' })),
  sharedAction: 'sharedAction',
  dismissedAction: 'dismissedAction',
}));

// Create mock TAG_KEYS that match your actual implementation
const MOCK_TAG_KEYS = [
  'Environment', 'PublicSafety', 'Accessibility', 'Lost Item', 
  'Found Item', 'Theft', 'Harassment', 'Flood', 'Assault', 
  'Fire', 'Other Natural Disasters', 'Earthquake', 'Other Crime', 
  'Infrastructure Issue', 'Crime Watch', 'Vandalism', 'Stolen Vehicle'
];

// Mock dependencies with proper TypeScript typing
jest.mock('@/components/displays/post/UserInteraction', () => {
  const { TouchableOpacity } = require('react-native');
  return function MockUserInteraction(props: { type: any; onPress: React.MouseEventHandler<HTMLButtonElement> | undefined; fill: any; }) {
    // Add the testID directly to the mocked component
    return (
      <TouchableOpacity 
        testID={props.type} 
        onClick={props.onPress} 
        style={{ color: props.fill }} 
      />
    );
  };
});

jest.mock('@/components/displays/post/ReportTags', () => {
  return {
    __esModule: true,
    default: function MockReportTags(props: { selectedTags: any[]; }) {
      return <div data-testid="report-tags">{props.selectedTags.join(',')}</div>;
    },
    TAG_KEYS: MOCK_TAG_KEYS,
  };
});

jest.mock('@expo/vector-icons/FontAwesome', () => {
  const { View } = require('react-native');
  return function MockFontAwesome(props: { name: any; size: any; color: any; }) {
    return (
      <View 
        testID={`font-awesome-${props.name}`} 
        style={{ fontSize: props.size, color: props.color }} 
      />
    );
  };
});

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  const { View } = require('react-native');
  return function MockMaterialIcons(props: { name: any; size: any; color: any; }) {
    return (
      <View 
        testID={`material-icon-${props.name}`} 
        style={{ fontSize: props.size, color: props.color }} 
      />
    );
  };
});

describe('ReportContent', () => {
  // Create a mutable array of TagKey type
  const selectedTags: TagKey[] = ['Lost Item', 'Infrastructure Issue'];
  
  const defaultProps = {
    title: 'Test Title',
    content: 'Test content description',
    likeCount: 10,
    dislikeCount: 5,
    selectedTags, // Use mutable array
    postId: 'test-post-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to prevent test output noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders correctly with required props', () => {
    const { getByText, queryByTestId } = render(<ReportContent {...defaultProps} />);
    
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test content description')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    
    // Should show placeholder when no image
    expect(queryByTestId('placeholder-image')).toBeTruthy();
  });

  test('renders with image when imageUrl is provided', () => {
    const props = { ...defaultProps, imageUrl: 'https://example.com/image.jpg' };
    const { queryByTestId } = render(<ReportContent {...props} />);
    
    const image = queryByTestId('image');
    expect(image).toBeTruthy();
    expect(image?.props.source.uri).toBe('https://example.com/image.jpg');
  });

  test('handles like button click', () => {
    const { getByTestId } = render(<ReportContent {...defaultProps} />);
    
    const likeButton = getByTestId('like-button').findByProps({ testID: 'like-icon' });
    fireEvent.press(likeButton);
    
    // Like count should increment and color should change
    expect(getByTestId('like-count').props.children).toBe(10);
    
    // Click again to unlike
    fireEvent.press(likeButton);
    expect(getByTestId('like-count').props.children).toBe(10);
  });

  test('handles dislike button click', () => {
    const { getByTestId } = render(<ReportContent {...defaultProps} />);
    
    const dislikeButton = getByTestId('dislike-button').findByProps({ testID: 'dislike-icon' });
    fireEvent.press(dislikeButton);
    
    // Dislike count should increment
    expect(getByTestId('dislike-count').props.children).toBe(5);
    
    // Click again to un-dislike
    fireEvent.press(dislikeButton);
    expect(getByTestId('dislike-count').props.children).toBe(5);
  });

  test('switches from like to dislike', () => {
    const { getByTestId } = render(<ReportContent {...defaultProps} />);
    
    // Like first
    const likeButton = getByTestId('like-button').findByProps({ testID: 'like-icon' });
    fireEvent.press(likeButton);
    expect(getByTestId('like-count').props.children).toBe(10);
    
    // Then dislike (should remove like)
    const dislikeButton = getByTestId('dislike-button').findByProps({ testID: 'dislike-icon' });
    fireEvent.press(dislikeButton);
    
    // Like count should reset, dislike count should increase
    expect(getByTestId('like-count').props.children).toBe(10);
    expect(getByTestId('dislike-count').props.children).toBe(5);
  });

  test('switches from dislike to like', () => {
    const { getByTestId } = render(<ReportContent {...defaultProps} />);
    
    // Dislike first
    const dislikeButton = getByTestId('dislike-button').findByProps({ testID: 'dislike-icon' });
    fireEvent.press(dislikeButton);
    expect(getByTestId('dislike-count').props.children).toBe(5);
    
    // Then like (should remove dislike)
    const likeButton = getByTestId('like-button').findByProps({ testID: 'like-icon' });
    fireEvent.press(likeButton);
    
    // Dislike count should reset, like count should increase
    expect(getByTestId('dislike-count').props.children).toBe(5);
    expect(getByTestId('like-count').props.children).toBe(10);
  });

  test('handles bookmark toggle', () => {
    const { getByTestId } = render(<ReportContent {...defaultProps} />);
    
    const bookmarkButton = getByTestId('bookmark-button');
    
    // Initially should be bookmark-o (not bookmarked)
    expect(bookmarkButton.findByProps({ testID: 'font-awesome-bookmark-o' })).toBeTruthy();
    
    // Click to bookmark
    fireEvent.press(bookmarkButton);
    
    // Should now be bookmarked
    expect(bookmarkButton.findByProps({ testID: 'font-awesome-bookmark' })).toBeTruthy();
    
    // Click again to un-bookmark
    fireEvent.press(bookmarkButton);
    expect(bookmarkButton.findByProps({ testID: 'font-awesome-bookmark-o' })).toBeTruthy();
  });

  test('handles share dismissal', async () => {
    // Mock share dismissed
    const Share = require('react-native/Libraries/Share/Share');
    Share.share.mockResolvedValueOnce({ action: 'dismissedAction' });
    
    const { getByTestId } = render(<ReportContent {...defaultProps} />);
    const shareButton = getByTestId('share-button');
    fireEvent.press(shareButton);
    
    // Ensure console.log was called
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(console.log).toHaveBeenCalledWith('Shared content:', { action: 'dismissedAction' });
  });

  test('handles share error', async () => {
    // Mock share error
    const Share = require('react-native/Libraries/Share/Share');
    Share.share.mockRejectedValueOnce(new Error('Share failed'));
    
    const { getByTestId } = render(<ReportContent {...defaultProps} />);
    const shareButton = getByTestId('share-button');
    fireEvent.press(shareButton);
    
    // Ensure console.error was called
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(console.error).toHaveBeenCalledWith('Error sharing content:', expect.any(Error));
  });

  test('opens image modal when image is clicked', () => {
    const props = { ...defaultProps, imageUrl: 'https://example.com/image.jpg' };
    const { getByTestId, queryByTestId } = render(<ReportContent {...props} />);
    
    // Initially modal should not be visible
    expect(queryByTestId('modal-container')).toBeNull();
    
    // Click image to open modal
    const imageContainer = getByTestId('image-container');
    fireEvent.press(imageContainer);
    
    // Modal should now be visible
    expect(queryByTestId('modal-container')).toBeTruthy();
  });

  test('closes image modal with close button', () => {
    const props = { ...defaultProps, imageUrl: 'https://example.com/image.jpg' };
    const { getByTestId, queryByTestId } = render(<ReportContent {...props} />);
    
    // Open modal
    const imageContainer = getByTestId('image-container');
    fireEvent.press(imageContainer);
    
    // Close modal
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    // Modal should no longer be visible
    expect(queryByTestId('modal-container')).toBeNull();
  });

  test('closes image modal by pressing backdrop', () => {
    const props = { ...defaultProps, imageUrl: 'https://example.com/image.jpg' };
    const { getByTestId, queryByTestId } = render(<ReportContent {...props} />);
    
    // Open modal
    const imageContainer = getByTestId('image-container');
    fireEvent.press(imageContainer);
    
    // Close modal by pressing backdrop
    const modalBackdrop = getByTestId('modal-backdrop');
    fireEvent.press(modalBackdrop);
    
    // Modal should no longer be visible
    expect(queryByTestId('modal-container')).toBeNull();
  })

});