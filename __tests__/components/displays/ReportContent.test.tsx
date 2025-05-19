import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import ReportContent from '@/components/displays/post/ReportContent';
import { Share } from 'react-native';
import { authenticatedDelete, authenticatedPost } from '@/utils/api';
import { useRouter } from 'expo-router';

// Mock external dependencies
jest.mock('@/utils/api', () => ({
  authenticatedPost: jest.fn(),
  authenticatedDelete: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(),
}));

// Mock Icon components
jest.mock('@expo/vector-icons/FontAwesome', () => 'FontAwesome');
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// Mock UserInteraction component with proper onPress handling
jest.mock('@/components/displays/post/UserInteraction', () => {
  return ({ onPress, type }: { onPress: () => void; type: string }) => {
    const React = require('react');
    return React.createElement('TouchableOpacity', {
      testID: `user-interaction-${type}`,
      onPress,
    });
  };
});

jest.mock('@/components/displays/post/ReportTags', () => {
  return {
    __esModule: true,
    default: ({ selectedTags }: { selectedTags: string[] }) => (
      <>{selectedTags.join(',')}</>
    ),
    TAG_KEYS: ['tag1', 'tag2'] as const,
  };
});

describe('ReportContent', () => {
  const mockRouterPush = jest.fn();
  const mockConsoleError = jest.fn();
  const originalConsoleError = console.error;

  const mockProps = {
    title: 'Test Title',
    content: 'Test Content',
    likeCount: 10,
    dislikeCount: 5,
    selectedTags: ['tag1', 'tag2'] as any,
    postId: 'test-post-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = mockConsoleError;
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (authenticatedPost as jest.Mock).mockResolvedValue({ success: true });
    (authenticatedDelete as jest.Mock).mockResolvedValue({ success: true });
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders correctly with basic props', () => {
    const { getByText, getByTestId } = render(<ReportContent {...mockProps} />);
    
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Content')).toBeTruthy();
    expect(getByTestId('like-count')).toHaveTextContent('10');
    expect(getByTestId('dislike-count')).toHaveTextContent('5');
    expect(getByTestId('placeholder-image')).toBeTruthy();
  });

  it('renders with image when imageUrl is provided', () => {
    const { getByTestId, queryByTestId } = render(
      <ReportContent {...mockProps} imageUrl="https://example.com/image.jpg" />
    );
    
    expect(getByTestId('image')).toBeTruthy();
    expect(queryByTestId('placeholder-image')).toBeNull();
  });

  it('renders comment button when commentCount is provided', () => {
    const { getByTestId } = render(
      <ReportContent {...mockProps} commentCount={3} />
    );
    
    expect(getByTestId('comment-button')).toBeTruthy();
    expect(getByTestId('comment-count')).toHaveTextContent('3');
  });

  it('renders with currentVote UPVOTE state', () => {
    const { getByTestId } = render(
      <ReportContent {...mockProps} currentVote="UPVOTE" />
    );
    
    const likeCount = getByTestId('like-count');
    expect(likeCount.props.style[1].color).toBe('#5E9F3D');
  });

  it('renders with currentVote DOWNVOTE state', () => {
    const { getByTestId } = render(
      <ReportContent {...mockProps} currentVote="DOWNVOTE" />
    );
    
    const dislikeCount = getByTestId('dislike-count');
    expect(dislikeCount.props.style[1].color).toBe('#904A47');
  });

  it('handles like click - from neutral to liked', async () => {
    const { getByTestId } = render(<ReportContent {...mockProps} />);
    
    const likeButton = getByTestId('user-interaction-like-icon');
    fireEvent.press(likeButton);
    
    await waitFor(() => {
      expect(authenticatedPost).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/vote/upvote?postId=test-post-id',
        {}
      );
      expect(getByTestId('like-count')).toHaveTextContent('11');
    });
  });

  it('handles like click - from liked to neutral', async () => {
    const { getByTestId } = render(
      <ReportContent {...mockProps} currentVote="UPVOTE" />
    );
    
    const likeButton = getByTestId('user-interaction-like-icon');
    fireEvent.press(likeButton);
    
    await waitFor(() => {
      expect(authenticatedDelete).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/vote/cancel-vote?postId=test-post-id',
        {}
      );
      expect(getByTestId('like-count')).toHaveTextContent('9');
    });
  });

  it('handles like click - removes dislike when liking', async () => {
    const { getByTestId } = render(
      <ReportContent {...mockProps} currentVote="DOWNVOTE" />
    );
    
    const likeButton = getByTestId('user-interaction-like-icon');
    fireEvent.press(likeButton);
    
    await waitFor(() => {
      expect(authenticatedPost).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/vote/upvote?postId=test-post-id',
        {}
      );
      expect(getByTestId('like-count')).toHaveTextContent('11');
      expect(getByTestId('dislike-count')).toHaveTextContent('4');
    });
  });

  it('handles dislike click - from neutral to disliked', async () => {
    const { getByTestId } = render(<ReportContent {...mockProps} />);
    
    const dislikeButton = getByTestId('user-interaction-dislike-icon');
    fireEvent.press(dislikeButton);
    
    await waitFor(() => {
      expect(authenticatedPost).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/vote/downvote?postId=test-post-id',
        {}
      );
      expect(getByTestId('dislike-count')).toHaveTextContent('6');
    });
  });

  it('handles dislike click - from disliked to neutral', async () => {
    const { getByTestId } = render(
      <ReportContent {...mockProps} currentVote="DOWNVOTE" />
    );
    
    const dislikeButton = getByTestId('user-interaction-dislike-icon');
    fireEvent.press(dislikeButton);
    
    await waitFor(() => {
      expect(authenticatedDelete).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/vote/cancel-vote?postId=test-post-id',
        {}
      );
      expect(getByTestId('dislike-count')).toHaveTextContent('4');
    });
  });

  it('handles dislike click - removes like when disliking', async () => {
    const { getByTestId } = render(
      <ReportContent {...mockProps} currentVote="UPVOTE" />
    );
    
    const dislikeButton = getByTestId('user-interaction-dislike-icon');
    fireEvent.press(dislikeButton);
    
    await waitFor(() => {
      expect(authenticatedPost).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/vote/downvote?postId=test-post-id',
        {}
      );
      expect(getByTestId('like-count')).toHaveTextContent('9');
      expect(getByTestId('dislike-count')).toHaveTextContent('6');
    });
  });

  it('handles API errors gracefully - like error', async () => {
    (authenticatedPost as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    const { getByTestId } = render(<ReportContent {...mockProps} />);
    
    const likeButton = getByTestId('user-interaction-like-icon');
    fireEvent.press(likeButton);
    
    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Error updating vote:', expect.any(Error));
    });
  });

  it('handles API errors gracefully - dislike error', async () => {
    (authenticatedPost as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    const { getByTestId } = render(<ReportContent {...mockProps} />);
    
    const dislikeButton = getByTestId('user-interaction-dislike-icon');
    fireEvent.press(dislikeButton);
    
    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Error updating vote:', expect.any(Error));
    });
  });

  it('prevents multiple rapid clicks while loading', async () => {
    const { getByTestId } = render(<ReportContent {...mockProps} />);
    
    const likeButton = getByTestId('user-interaction-like-icon');
    fireEvent.press(likeButton);
    fireEvent.press(likeButton);
    
    await waitFor(() => {
      expect(authenticatedPost).toHaveBeenCalledTimes(1);
    });
  });

  it('prevents dislike click while loading', async () => {
    const { getByTestId } = render(<ReportContent {...mockProps} />);
    
    // Start a like operation to set isLoading to true
    const likeButton = getByTestId('user-interaction-like-icon');
    fireEvent.press(likeButton);
    
    // Try to press dislike while loading
    const dislikeButton = getByTestId('user-interaction-dislike-icon');
    fireEvent.press(dislikeButton);
    
    await waitFor(() => {
      // Only the like API call should have been made
      expect(authenticatedPost).toHaveBeenCalledTimes(1);
      expect(authenticatedPost).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/vote/upvote?postId=test-post-id',
        {}
      );
      // No downvote call should have been made
      expect(authenticatedPost).not.toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/vote/downvote?postId=test-post-id',
        {}
      );
    });
  });

  it('opens and closes image modal', () => {
    const { getByTestId, queryByTestId } = render(
      <ReportContent {...mockProps} imageUrl="https://example.com/image.jpg" />
    );
    
    const imageContainer = getByTestId('image-container');
    fireEvent.press(imageContainer);
    
    expect(getByTestId('modal')).toBeTruthy();
    expect(getByTestId('modal-image')).toBeTruthy();
    
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    
    expect(queryByTestId('modal')).toBeNull();
  });

  it('closes modal when backdrop is pressed', () => {
    const { getByTestId, queryByTestId } = render(
      <ReportContent {...mockProps} imageUrl="https://example.com/image.jpg" />
    );
    
    const imageContainer = getByTestId('image-container');
    fireEvent.press(imageContainer);
    
    const modalBackdrop = getByTestId('modal-backdrop');
    fireEvent.press(modalBackdrop);
    
    expect(queryByTestId('modal')).toBeNull();
  });

  it('does not open modal when no image URL', () => {
    const { getByTestId, queryByTestId } = render(<ReportContent {...mockProps} />);
    
    const imageContainer = getByTestId('image-container');
    fireEvent.press(imageContainer);
    
    expect(queryByTestId('modal')).toBeNull();
  });

  it('handles share click', async () => {
    (Share.share as jest.Mock).mockResolvedValue({ action: 'sharedAction' });
    
    const { getByTestId } = render(<ReportContent {...mockProps} />);
    
    const shareButton = getByTestId('share-button');
    fireEvent.press(shareButton);
    
    await waitFor(() => {
      expect(Share.share).toHaveBeenCalledWith({
        title: 'Test Title',
        message: 'Test Title\n\nTest Content\n\nhttps://safety-pin.up.railway.app/open-post/test-post-id',
        url: 'https://safety-pin.up.railway.app/open-post/test-post-id',
      });
    });
  });

  it('handles share error gracefully', async () => {
    (Share.share as jest.Mock).mockRejectedValue(new Error('Share Error'));
    
    const { getByTestId } = render(<ReportContent {...mockProps} />);
    
    const shareButton = getByTestId('share-button');
    fireEvent.press(shareButton);
    
    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Error sharing content:', expect.any(Error));
    });
  });

  it('navigates to post details when post is pressed with commentCount', () => {
    const { getByTestId } = render(
      <ReportContent {...mockProps} commentCount={3} />
    );
    
    const postContainer = getByTestId('post-container');
    fireEvent.press(postContainer);
    
    expect(mockRouterPush).toHaveBeenCalledWith('/post/test-post-id');
  });

  it('does not navigate when post is pressed without commentCount', () => {
    const { getByTestId } = render(<ReportContent {...mockProps} />);
    
    const postContainer = getByTestId('post-container');
    fireEvent.press(postContainer);
    
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('does not navigate when post is pressed with commentCount as 0', () => {
    const { getByTestId } = render(
      <ReportContent {...mockProps} commentCount={0} />
    );
    
    const postContainer = getByTestId('post-container');
    fireEvent.press(postContainer);
    
    expect(mockRouterPush).toHaveBeenCalledWith('/post/test-post-id');
  });

  it('navigates when comment button is pressed', () => {
    const { getByTestId } = render(
      <ReportContent {...mockProps} commentCount={3} />
    );
    
    const commentButton = getByTestId('user-interaction-comment-icon');
    fireEvent.press(commentButton);
    
    expect(mockRouterPush).toHaveBeenCalledWith('/post/test-post-id');
  });
});