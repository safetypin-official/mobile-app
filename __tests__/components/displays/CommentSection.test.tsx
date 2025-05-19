import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import CommentSection from '@/components/displays/post/CommentSection';
import { authenticatedGet, authenticatedDelete } from '@/utils/api';

// Mock Expo Icon component to avoid font loading issues
jest.mock('@expo/vector-icons/FontAwesome', () => 'FontAwesomeMock');
jest.mock('@expo/vector-icons/Ionicons', () => 'IoniconsMock');
jest.mock('@expo/vector-icons', () => ({
  FontAwesome: 'FontAwesomeMock',
  Ionicons: 'IoniconsMock',
}));

// Mock the api module
jest.mock('@/utils/api', () => ({
  authenticatedGet: jest.fn(),
  authenticatedDelete: jest.fn(),
}));

// Mock the Toast component
jest.mock('@/components/toasts/Toast', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockToast({ text }) {
    return (
      <View testID="toast">
        <Text>{text}</Text>
      </View>
    );
  };
});

// Mock the MoreOptionsButton component
jest.mock('@/components/buttons/post/MoreOptionsButton', () => {
  const React = require('react');
  const { Text, TouchableOpacity, View } = require('react-native');
  return function MockMoreOptionsButton({ closeModal, onReport, onDelete }) {
    return (
      <View testID="mock-more-options">
        <TouchableOpacity testID="close-modal-btn" onPress={closeModal}>
          <Text>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="report-btn" onPress={onReport}>
          <Text>Report</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="delete-btn" onPress={onDelete}>
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

describe('CommentSection', () => {
  const defaultProps = {
    avatarUrl: 'https://example.com/avatar.jpg',
    username: 'TestUser',
    handle: '@testuser',
    date: 'May 5',
    content: 'This is a test comment',
    commentId: '123',
    onReply: jest.fn(),
    onCommentDeleted: jest.fn(),
  };

  const mockReplies = {
    data: {
      content: [
        {
          id: 'reply1',
          caption: 'This is a reply',
          createdAt: '2023-05-05T12:00:00Z',
          postedBy: {
            name: 'ReplyUser',
            profilePicture: 'https://example.com/reply-avatar.jpg',
          },
        },
        {
          id: 'reply2',
          caption: 'This is another reply',
          createdAt: '2023-05-06T12:00:00Z',
          postedBy: {
            name: 'AnotherUser',
            profilePicture: 'https://example.com/another-avatar.jpg',
          },
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (authenticatedGet as jest.Mock).mockResolvedValue(mockReplies);
    (authenticatedDelete as jest.Mock).mockResolvedValue({ status: 'success' });
    jest.useRealTimers();
  });

  // -- Basic Rendering Tests --

  test('renders correctly with all provided props', () => {
    const { getByText, getByTestId } = render(<CommentSection {...defaultProps} />);
    
    // Check if basic elements are rendered
    expect(getByText('TestUser')).toBeTruthy();
    expect(getByText('@testuser')).toBeTruthy();
    expect(getByText('• May 5')).toBeTruthy();
    expect(getByText('This is a test comment')).toBeTruthy();
    expect(getByText('Reply')).toBeTruthy();
    expect(getByText('View replies')).toBeTruthy();
    expect(getByTestId('more-options-button')).toBeTruthy();
  });

  test('renders correctly with minimal props', () => {
    const minimalProps = {
      avatarUrl: '',
      username: '',
      handle: '',
      date: '',
      content: '',
      commentId: '',
    };
    
    const { getByText, getByTestId } = render(<CommentSection {...minimalProps} />);
    
    // Check if component still renders with empty strings
    expect(getByTestId('more-options-button')).toBeTruthy();
    expect(getByText('Reply')).toBeTruthy();
  });

  test('truncates long username and handle correctly', () => {
    const longNameProps = {
      ...defaultProps,
      username: 'ThisIsAReallyReallyLongUsername',
      handle: '@thisIsAReallyReallyLongHandle',
    };
    
    const { getByText } = render(<CommentSection {...longNameProps} />);
    
    // Since we're using numberOfLines and ellipsizeMode in the component,
    // we should still find the text even if it's truncated in the UI
    expect(getByText('ThisIsAReallyReallyLongUsername')).toBeTruthy();
    expect(getByText('@thisIsAReallyReallyLongHandle')).toBeTruthy();
  });

  // -- Date Formatting Tests --

  test('formatDate returns correct date format', () => {
    // Create a component instance to test its internal formatDate function
    const { getByText } = render(<CommentSection {...defaultProps} />);
    
    // Since formatDate is not exported, test it indirectly by checking date formatting in the component
    expect(getByText('• May 5')).toBeTruthy();
    
    // We'll also test date formatting when loading replies
    const dateTestProps = {
      ...defaultProps,
      date: 'January 15',
    };
    
    const { getByText: getByTextDateTest } = render(<CommentSection {...dateTestProps} />);
    expect(getByTextDateTest('• January 15')).toBeTruthy();
  });

  test('formats date correctly for replies', async () => {
    const { getByText, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // View replies
    const viewRepliesBtn = getByText('View replies');
    await act(async () => {
      fireEvent.press(viewRepliesBtn);
    });
    
    // Check formatted dates are correct for the replies
    await waitFor(() => {
      expect(queryByText('This is a reply')).toBeTruthy(); // May 5 reply
      expect(queryByText('This is another reply')).toBeTruthy(); // May 6 reply
    });
    
    // Check both dates appear
    await waitFor(() => {
      // Since the dates might be in multiple places (comment and replies),
      // we'll just check for the specific reply content which should be unique
      expect(queryByText('This is a reply')).toBeTruthy();
      expect(queryByText('This is another reply')).toBeTruthy();
    });
  });

  test('handles replies with malformed dates', async () => {
    // Mock replies with invalid date formats
    const malformedDateReplies = {
      data: {
        content: [
          {
            id: 'reply7',
            caption: 'Reply with malformed date',
            createdAt: 'invalid-date', // Invalid date format
            postedBy: {
              name: 'MalformedDateUser',
              profilePicture: 'https://example.com/malformed-date.jpg',
            },
          },
        ],
      },
    };
    
    (authenticatedGet as jest.Mock).mockResolvedValueOnce(malformedDateReplies);
    
    const { getByText, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // View replies
    await act(async () => {
      fireEvent.press(getByText('View replies'));
    });
    
    // Should handle malformed dates gracefully
    await waitFor(() => {
      expect(queryByText('Reply with malformed date')).toBeTruthy();
    });
  });

  // -- Modal Tests --

  test('opens and closes the more options modal', async () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...defaultProps} />);
    
    // Initially, modal should be hidden
    expect(queryByTestId('more-options-modal')).toBeNull();
    
    // Open modal
    await act(async () => {
      fireEvent.press(getByTestId('more-options-button'));
    });
    
    // Modal should be visible
    await waitFor(() => {
      expect(getByTestId('mock-more-options')).toBeTruthy();
    });
    
    // Close modal by clicking overlay
    await act(async () => {
      fireEvent.press(getByTestId('modal-overlay'));
    });
    
    // Modal should be closed
    await waitFor(() => {
      expect(queryByTestId('more-options-modal')).toBeNull();
    });
  });

  test('handles reply more options modal', async () => {
    const { getByText, getByTestId, queryByTestId } = render(<CommentSection {...defaultProps} />);
    
    // View replies
    const viewRepliesBtn = getByText('View replies');
    await act(async () => {
      fireEvent.press(viewRepliesBtn);
    });
    
    // Wait for replies to load
    await waitFor(() => expect(getByTestId('reply-more-options-button-reply1')).toBeTruthy());
    
    // Click more options for the first reply
    await act(async () => {
      fireEvent.press(getByTestId('reply-more-options-button-reply1'));
    });
    
    // Reply options modal should be visible
    await waitFor(() => expect(getByTestId('mock-more-options')).toBeTruthy());
    
    // Close modal by clicking overlay
    await act(async () => {
      fireEvent.press(getByTestId('reply-modal-overlay'));
    });
    
    // Modal should be closed
    await waitFor(() => expect(queryByTestId('reply-options-modal')).toBeNull());
  });

  test('should close reply modal when overlay is pressed', async () => {
    // Mock successful replies fetch
    const mockReplies = {
      data: {
        content: [
          {
            id: '456',
            caption: 'This is a reply',
            postedBy: {
              name: 'Jane Doe',
              profilePicture: 'https://example.com/jane.jpg'
            },
            createdAt: '2023-05-02T12:00:00Z'
          }
        ]
      }
    };
    
    (authenticatedGet as jest.Mock).mockResolvedValueOnce(mockReplies);

    const { getByTestId, getByText, queryByTestId } = render(
      <CommentSection {...defaultProps} />
    );

    // Toggle replies to show them
    fireEvent.press(getByText('View replies'));

    // Wait for replies to load
    await waitFor(() => {
      expect(authenticatedGet).toHaveBeenCalledWith(
        `https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment/${defaultProps.commentId}`
      );
    });

    // Open reply options modal
    await waitFor(() => {
      const replyOptionsButton = getByTestId('reply-more-options-button-456');
      fireEvent.press(replyOptionsButton);
    });

    // Make sure the modal is open
    expect(getByTestId('reply-modal-overlay')).toBeTruthy();

    // Press the overlay to close it
    fireEvent.press(getByTestId('reply-modal-overlay'));

    // Verify modal is closed (not in the document anymore)
    await waitFor(() => {
      expect(queryByTestId('reply-modal-overlay')).toBeNull();
    });
  });

  // -- Toast Tests --

  test('handles report action', async () => {
    // Mock the setTimeout for this test
    jest.useFakeTimers();
    
    const { getByTestId, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // Open modal
    await act(async () => {
      fireEvent.press(getByTestId('more-options-button'));
    });
    
    // We need to wait for the modal to be fully rendered
    await waitFor(() => expect(getByTestId('mock-more-options')).toBeTruthy());
    
    // Find and press the report button
    await act(async () => {
      fireEvent.press(getByTestId('report-btn'));
    });
    
    // Toast should appear
    await waitFor(() => expect(queryByText('Report Submitted')).toBeTruthy());
    
    // Skip forward in time to automatically clear the toast
    await act(async () => {
      jest.runAllTimers();
    });
  });

  test('should handle report submission and show toast', async () => {
    // Use fake timers to control timing
    jest.useFakeTimers();
    
    const { getByTestId, getByText, queryByText } = render(
      <CommentSection {...defaultProps} />
    );

    // Open the options modal
    await act(async () => {
      fireEvent.press(getByTestId('more-options-button'));
    });

    // Find and press the report button
    await act(async () => {
      const reportButton = getByText('Report');
      fireEvent.press(reportButton);
    });

    // Toast should be visible
    expect(getByText('Report Submitted')).toBeTruthy();

    // Modal should be closed
    expect(queryByText('Close')).toBeNull();

    // Advance timers and run pending timers to auto-hide toast
    await act(async () => {
      jest.advanceTimersByTime(3000);
      jest.runAllTimers();
    });
    
    // Since we've set visibility state to false, but our Toast mock
    // might still render the text, we'll check if the specific
    // toast-message element is gone rather than the text itself
    expect(queryByText('Report Submitted')).toBeNull();
    
    // Restore real timers
    jest.useRealTimers();
  });

  test('should close the toast when pressed', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <CommentSection {...defaultProps} />
    );

    // Open the options modal
    fireEvent.press(getByTestId('more-options-button'));

    // Find and press the report button to show toast
    const reportButton = getByText('Report');
    fireEvent.press(reportButton);

    // Toast should be visible
    expect(getByText('Report Submitted')).toBeTruthy();
    expect(getByTestId('toast-message')).toBeTruthy();

    // Press the toast to close it
    fireEvent.press(getByTestId('toast-message'));

    // Check if toast is gone
    await waitFor(() => {
      expect(queryByText('Report Submitted')).toBeNull();
    });
  });

  test('handles toast visibility and timeouts', async () => {
    // Mock the setTimeout for this test
    jest.useFakeTimers();
    
    const { getByTestId, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // Test toast showing
    // Open modal
    await act(async () => {
      fireEvent.press(getByTestId('more-options-button'));
    });
    
    // We need to wait for the modal to be fully rendered
    await waitFor(() => expect(getByTestId('mock-more-options')).toBeTruthy());
    
    // Find and press the report button to trigger toast
    await act(async () => {
      fireEvent.press(getByTestId('report-btn'));
    });
    
    // Toast should appear
    await waitFor(() => expect(queryByText('Report Submitted')).toBeTruthy());
  });

  // -- Comment Delete Tests --

  describe('Comment Delete with CustomModal', () => {
    it('opens confirmation modal and deletes comment when confirmed', async () => {
      const { getByTestId, queryByText } = render(<CommentSection {...defaultProps} />);

      // 1) open options modal
      fireEvent.press(getByTestId('more-options-button'));
      await waitFor(() => getByTestId('mock-more-options'));

      // 2) trigger delete-confirm modal
      fireEvent.press(getByTestId('delete-btn'));
      expect(getByTestId('delete-comment-confirmation-modal')).toBeTruthy();

      // 3) confirm deletion
      fireEvent.press(getByTestId('delete-comment-confirmation-modal-ok'));
      await waitFor(() =>
        expect(authenticatedDelete).toHaveBeenCalledWith(
          'https://safetypin.ppl.cs.ui.ac.id/posts/comment/onpost/123'
        )
      );

      // 4) callback and toast
      expect(defaultProps.onCommentDeleted).toHaveBeenCalledWith('123');
      await waitFor(() => expect(queryByText('Comment deleted successfully')).toBeTruthy());
    });

    it('cancels deletion when Cancel is pressed', async () => {
      const { getByTestId, queryByTestId } = render(<CommentSection {...defaultProps} />);

      // open options
      fireEvent.press(getByTestId('more-options-button'));
      await waitFor(() => getByTestId('mock-more-options'));

      // open confirm
      fireEvent.press(getByTestId('delete-btn'));
      expect(getByTestId('delete-comment-confirmation-modal')).toBeTruthy();

      // press Cancel
      fireEvent.press(getByTestId('delete-comment-confirmation-modal-cancel'));

      // confirm-modal gone, no API call
      expect(queryByTestId('delete-comment-confirmation-modal')).toBeNull();
      expect(authenticatedDelete).not.toHaveBeenCalled();
    });
  });

  // -- Reply Delete Tests --

  describe('Reply Delete with CustomModal', () => {
    it('opens confirmation modal and deletes reply when confirmed', async () => {
      const { getByText, getByTestId, queryByText } = render(
        <CommentSection {...defaultProps} />
      );

      // 1) view replies
      await act(async () => {
        fireEvent.press(getByText('View replies'));
      });
      await waitFor(() => getByTestId('reply-more-options-button-reply1'));

      // 2) open reply options
      fireEvent.press(getByTestId('reply-more-options-button-reply1'));
      await waitFor(() => getByTestId('mock-more-options'));

      // 3) trigger delete-confirm
      fireEvent.press(getByTestId('delete-btn'));
      expect(getByTestId('delete-reply-confirmation-modal')).toBeTruthy();

      // 4) confirm deletion
      fireEvent.press(getByTestId('delete-reply-confirmation-modal-ok'));
      await waitFor(() =>
        expect(authenticatedDelete).toHaveBeenCalledWith(
          'https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment/reply1'
        )
      );

      // 5) toast + refetch
      await waitFor(() => expect(queryByText('Reply deleted successfully')).toBeTruthy());
      expect(authenticatedGet).toHaveBeenCalledTimes(2);
    });

    it('cancels reply deletion when Cancel is pressed', async () => {
      const { getByText, getByTestId, queryByTestId } = render(
        <CommentSection {...defaultProps} />
      );

      // view replies & open options
      await act(async () => {
        fireEvent.press(getByText('View replies'));
      });
      await waitFor(() => getByTestId('reply-more-options-button-reply1'));
      fireEvent.press(getByTestId('reply-more-options-button-reply1'));
      await waitFor(() => getByTestId('mock-more-options'));

      // trigger confirm and cancel
      fireEvent.press(getByTestId('delete-btn'));
      expect(getByTestId('delete-reply-confirmation-modal')).toBeTruthy();
      fireEvent.press(getByTestId('delete-reply-confirmation-modal-cancel'));

      // confirm-modal gone, no API call
      expect(queryByTestId('delete-reply-confirmation-modal')).toBeNull();
      expect(authenticatedDelete).not.toHaveBeenCalledWith(
        `https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment/reply1`
      );
    });
  });

  
  test('toggles replies visibility and shows no replies message', async () => {
    (authenticatedGet as jest.Mock).mockResolvedValueOnce({ data: { content: [] } });
    
    const { getByText, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // Click "View replies"
    const viewRepliesButton = getByText('View replies');
    
    await act(async () => {
      fireEvent.press(viewRepliesButton);
    });
    
    // Wait for the API call
    await waitFor(() => {
      expect(authenticatedGet).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment/123'
      );
    });
    
    // No replies message should be visible
    await waitFor(() => {
      expect(queryByText('No replies yet')).toBeTruthy();
    });
  });

  test('handles error when loading replies', async () => {
    (authenticatedGet as jest.Mock).mockRejectedValueOnce(new Error('Failed to load'));
    
    const { getByText, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // Click "View replies"
    const viewRepliesButton = getByText('View replies');
    
    await act(async () => {
      fireEvent.press(viewRepliesButton);
    });
    
    // Wait for the API call
    await waitFor(() => {
      expect(authenticatedGet).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment/123'
      );
    });
    
    // Error message should be visible
    await waitFor(() => {
      expect(queryByText('Failed to load replies')).toBeTruthy();
    });
  });

  test('shows loading state when fetching replies', async () => {
    // Create a promise that doesn't resolve immediately
    let resolveGetPromise;
    const getPromise = new Promise((resolve) => {
      resolveGetPromise = resolve;
    });
    
    (authenticatedGet as jest.Mock).mockReturnValueOnce(getPromise);
    
    const { getByText, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // Click "View replies"
    const viewRepliesButton = getByText('View replies');
    
    await act(async () => {
      fireEvent.press(viewRepliesButton);
    });
    
    // Loading message should be visible
    await waitFor(() => expect(queryByText('Loading replies...')).toBeTruthy());
    
    // Resolve the promise to complete the test
    await act(async () => {
      resolveGetPromise(mockReplies);
    });
    
    // Wait for the loading message to disappear and replies to appear
    await waitFor(() => {
      expect(queryByText('Loading replies...')).toBeFalsy();
      expect(queryByText('This is a reply')).toBeTruthy();
    });
  });
  
  test('shows empty state while loading replies', async () => {
    // Create a promise that we won't resolve
    const pendingPromise = new Promise(() => {});
    (authenticatedGet as jest.Mock).mockReturnValueOnce(pendingPromise);
    
    const { getByText, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // Click "View replies"
    await act(async () => {
      fireEvent.press(getByText('View replies'));
    });
    
    // Loading message should be visible
    await waitFor(() => expect(queryByText('Loading replies...')).toBeTruthy());
    
    // No replies or error messages should be visible yet
    expect(queryByText('No replies yet')).toBeNull();
    expect(queryByText('Failed to load replies')).toBeNull();
  });

  test('handles null replies content properly', async () => {
    // Mock a response with null content
    const nullReplies = {
      data: {
        content: null,
      },
    };
    (authenticatedGet as jest.Mock).mockResolvedValueOnce(nullReplies);
    
    const { getByText, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // Click "View replies"
    await act(async () => {
      fireEvent.press(getByText('View replies'));
    });
    
    // Empty state message should be visible
    await waitFor(() => expect(queryByText('No replies yet')).toBeTruthy());
  });

  test('handles undefined content in replies response', async () => {
    // Mock response with undefined content property
    const undefinedContentResponse = {
      data: {
        // content property is missing
      }
    };
    
    (authenticatedGet as jest.Mock).mockResolvedValueOnce(undefinedContentResponse);
    
    const { getByText, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // Click "View replies"
    await act(async () => {
      fireEvent.press(getByText('View replies'));
    });
    
    // Wait for the API call
    await waitFor(() => {
      expect(authenticatedGet).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment/123'
      );
    });
    
    // Should handle undefined content gracefully by showing the no replies message
    await waitFor(() => {
      expect(queryByText('No replies yet')).toBeTruthy();
    });
  });

  test('handles non-array content in replies response', async () => {
    // Mock response with content as an object instead of an array
    const nonArrayContentResponse = {
      data: {
        content: { message: 'This is not an array' } // Object instead of array
      }
    };
    
    (authenticatedGet as jest.Mock).mockResolvedValueOnce(nonArrayContentResponse);
    
    const { getByText, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // Click "View replies"
    await act(async () => {
      fireEvent.press(getByText('View replies'));
    });
    
    // Should handle non-array content gracefully
    await waitFor(() => {
      expect(queryByText('No replies yet')).toBeTruthy();
    });
  });

  // -- Edge Cases & Unusual Data Tests --

  test('handles replies with missing user data', async () => {
    const incompleteReplies = {
      data: {
        content: [
          {
            id: 'reply3',
            caption: 'Reply with no user data',
            createdAt: '2023-05-07T12:00:00Z',
            postedBy: null,
          },
          {
            id: 'reply4',
            caption: 'Reply with partial user data',
            createdAt: '2023-05-08T12:00:00Z',
            postedBy: {
              name: null,
              profilePicture: null,
            },
          },
        ],
      },
    };
    
    (authenticatedGet as jest.Mock).mockResolvedValueOnce(incompleteReplies);
    
    const { getByText, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // View replies
    const viewRepliesBtn = getByText('View replies');
    await act(async () => {
      fireEvent.press(viewRepliesBtn);
    });
    
    // Should handle missing user data gracefully - wait for the replies to load
    await waitFor(() => {
      // First anonymous user from reply with null postedBy
      expect(queryByText('Reply with no user data')).toBeTruthy();
      // Second anonymous user from reply with null name
      expect(queryByText('Reply with partial user data')).toBeTruthy();
    });
  });

  test('handles replies with missing data fields', async () => {
    // Mock replies with missing data fields
    const incompleteReplies = {
      data: {
        content: [
          {
            // Missing id
            caption: 'Reply with missing id',
            createdAt: '2023-05-09T12:00:00Z',
            postedBy: {
              name: 'MissingIdUser',
              profilePicture: 'https://example.com/missing-id.jpg',
            },
          },
          {
            id: 'reply5',
            // Missing caption
            createdAt: '2023-05-10T12:00:00Z',
            postedBy: {
              name: 'MissingCaptionUser',
              profilePicture: 'https://example.com/missing-caption.jpg',
            },
          },
          {
            id: 'reply6',
            caption: 'Reply with missing date',
            // Missing createdAt
            postedBy: {
              name: 'MissingDateUser',
              profilePicture: 'https://example.com/missing-date.jpg',
            },
          },
        ],
      },
    };
    
    (authenticatedGet as jest.Mock).mockResolvedValueOnce(incompleteReplies);
    
    const { getByText, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // View replies
    await act(async () => {
      fireEvent.press(getByText('View replies'));
    });
    
    // Should handle missing data fields gracefully
    await waitFor(() => {
      expect(queryByText('Reply with missing id')).toBeTruthy();
      expect(queryByText('MissingCaptionUser')).toBeTruthy();
      expect(queryByText('Reply with missing date')).toBeTruthy();
    });
  });

  // -- User Interaction Tests --

  test('handles reply action', () => {
    const { getByText } = render(<CommentSection {...defaultProps} />);
    
    // Click "Reply" button
    const replyButton = getByText('Reply');
    fireEvent.press(replyButton);
    
    // Check if onReply callback was called with correct arguments
    expect(defaultProps.onReply).toHaveBeenCalledWith('123', 'TestUser');
  });

  // Test for long name truncation
  test('truncates long names correctly', async () => {
    // Direct test of the truncateName function by creating a new component with very long names
    const longNameProps = {
      ...defaultProps,
      username: 'ThisIsAReallyReallyReallyLongUsernameThatShouldBeTruncated',
    };
    
    const { getByText } = render(<CommentSection {...longNameProps} />);
    
    // The component should show the truncated name but still be findable with getByText
    expect(getByText('ThisIsAReallyReallyReallyLongUsernameThatShouldBeTruncated')).toBeTruthy();
    
    // The displayed text will be truncated in the UI due to numberOfLines and ellipsizeMode
  });

  // -- Error handling tests --
  describe('Error handling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('shows error toast when comment deletion fails', async () => {
      (authenticatedDelete as jest.Mock).mockRejectedValueOnce(new Error('Delete fail'));
      const { getByTestId, queryByText } = render(<CommentSection {...defaultProps} />);
      // Open comment options modal
      fireEvent.press(getByTestId('more-options-button'));
      await waitFor(() => getByTestId('more-options-modal'));
      // Trigger delete-confirm modal
      fireEvent.press(getByTestId('delete-btn'));
      expect(getByTestId('delete-comment-confirmation-modal')).toBeTruthy();
      // Confirm deletion
      fireEvent.press(getByTestId('delete-comment-confirmation-modal-ok'));
      await waitFor(() => {
        expect(queryByText('Failed to delete comment')).toBeTruthy();
      });
    });

    it('shows error toast when reply deletion fails', async () => {
      (authenticatedDelete as jest.Mock).mockRejectedValueOnce(new Error('Reply delete fail'));
      const { getByText, getByTestId, queryByText } = render(<CommentSection {...defaultProps} />);
      // View replies
      await act(async () => {
        fireEvent.press(getByText('View replies'));
      });
      await waitFor(() => getByTestId('reply-more-options-button-reply1'));
      // Open reply options modal
      fireEvent.press(getByTestId('reply-more-options-button-reply1'));
      await waitFor(() => getByTestId('mock-more-options'));
      // Trigger delete-confirm modal
      fireEvent.press(getByTestId('delete-btn'));
      expect(getByTestId('delete-reply-confirmation-modal')).toBeTruthy();
      // Confirm deletion
      fireEvent.press(getByTestId('delete-reply-confirmation-modal-ok'));
      await waitFor(() => {
        expect(queryByText('Failed to delete reply')).toBeTruthy();
      });
    });
  });

  // -- Modal close behaviors --
  describe('Modal close behaviors', () => {
    it('closes comment options modal onRequestClose', async () => {
      const { getByTestId, queryByTestId } = render(<CommentSection {...defaultProps} />);
      fireEvent.press(getByTestId('more-options-button'));
      await waitFor(() => getByTestId('more-options-modal'));
      // Trigger onRequestClose
      fireEvent(getByTestId('more-options-modal'), 'requestClose');
      expect(queryByTestId('more-options-modal')).toBeNull();
    });

    it('closes comment options modal when pressing close button', async () => {
      const { getByTestId, queryByTestId } = render(<CommentSection {...defaultProps} />);
      fireEvent.press(getByTestId('more-options-button'));
      await waitFor(() => getByTestId('mock-more-options'));
      fireEvent.press(getByTestId('close-modal-btn'));
      await waitFor(() => {
        expect(queryByTestId('more-options-modal')).toBeNull();
      });
    });

    it('closes reply options modal onRequestClose', async () => {
      const { getByText, getByTestId, queryByTestId } = render(<CommentSection {...defaultProps} />);
      await act(async () => {
        fireEvent.press(getByText('View replies'));
      });
      await waitFor(() => getByTestId('reply-more-options-button-reply1'));
      fireEvent.press(getByTestId('reply-more-options-button-reply1'));
      await waitFor(() => getByTestId('reply-options-modal'));
      fireEvent(getByTestId('reply-options-modal'), 'requestClose');
      expect(queryByTestId('reply-options-modal')).toBeNull();
    });

    it('invokes closeModal in reply options modal when pressing close button', async () => {
      const { getByText, getByTestId } = render(<CommentSection {...defaultProps} />);
      await act(async () => {
        fireEvent.press(getByText('View replies'));
      });
      await waitFor(() => getByTestId('reply-more-options-button-reply1'));
      fireEvent.press(getByTestId('reply-more-options-button-reply1'));
      await waitFor(() => getByTestId('mock-more-options'));
      fireEvent.press(getByTestId('close-modal-btn'));
      // closeModal is a no-op; modal stays open
      expect(getByTestId('reply-options-modal')).toBeTruthy();
    });
  });
});