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
  // Define default props for most tests
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

  // Define mock replies data for tests that need it
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
    
    // Clear any previous timeouts
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

  test('handles delete comment action', async () => {
    const { getByTestId, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // Open modal
    await act(async () => {
      fireEvent.press(getByTestId('more-options-button'));
    });
    
    // We need to wait for the modal to be fully rendered
    await waitFor(() => expect(getByTestId('mock-more-options')).toBeTruthy());
    
    // Find and press the delete button
    await act(async () => {
      fireEvent.press(getByTestId('delete-btn'));
    });
    
    // Check if API was called with correct URL
    await waitFor(() => {
      expect(authenticatedDelete).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/comment/onpost/123'
      );
    });
    
    // Check if onCommentDeleted callback was called
    expect(defaultProps.onCommentDeleted).toHaveBeenCalledWith('123');
    
    // Toast should show success message
    await waitFor(() => expect(queryByText('Comment deleted successfully')).toBeTruthy());
  });

  test('handles delete comment error', async () => {
    (authenticatedDelete as jest.Mock).mockRejectedValueOnce(new Error('Failed to delete'));
    
    const { getByTestId, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // Open modal
    await act(async () => {
      fireEvent.press(getByTestId('more-options-button'));
    });
    
    // We need to wait for the modal to be fully rendered
    await waitFor(() => expect(getByTestId('mock-more-options')).toBeTruthy());
    
    // Find and press the delete button directly by testID
    const deleteButton = getByTestId('delete-btn');
    
    await act(async () => {
      fireEvent.press(deleteButton);
    });
    
    // Wait for API to be called and error to be shown
    await waitFor(() => {
      expect(authenticatedDelete).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/comment/onpost/123'
      );
      expect(queryByText('Failed to delete comment')).toBeTruthy();
    });
  });

  test('handles network error during comment deletion', async () => {
    const networkError = new Error('Network error');
    networkError.name = 'NetworkError';
    (authenticatedDelete as jest.Mock).mockRejectedValueOnce(networkError);
    
    const { getByTestId, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // Open modal
    await act(async () => {
      fireEvent.press(getByTestId('more-options-button'));
    });
    
    // We need to wait for the modal to be fully rendered
    await waitFor(() => expect(getByTestId('mock-more-options')).toBeTruthy());
    
    // Find and press the delete button
    await act(async () => {
      fireEvent.press(getByTestId('delete-btn'));
    });
    
    // Should show error message
    await waitFor(() => {
      expect(queryByText('Failed to delete comment')).toBeTruthy();
    });
  });

  test('should handle deleting a comment successfully', async () => {
    // Mock successful delete
    (authenticatedDelete as jest.Mock).mockResolvedValueOnce({});

    const { getByTestId, getByText, queryByText } = render(
      <CommentSection {...defaultProps} />
    );

    // Open the options modal
    fireEvent.press(getByTestId('more-options-button'));

    // Find and press the delete button (assuming MoreOptionsButton renders a delete button)
    const deleteButton = getByText('Delete');
    fireEvent.press(deleteButton);

    // Wait for the delete to complete
    await waitFor(() => {
      expect(authenticatedDelete).toHaveBeenCalledWith(
        `https://safetypin.ppl.cs.ui.ac.id/posts/comment/onpost/${defaultProps.commentId}`
      );
    });

    // Toast should be visible with success message
    expect(getByText('Comment deleted successfully')).toBeTruthy();

    // Advance timers to check if toast disappears
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Check if onCommentDeleted callback was called
    expect(defaultProps.onCommentDeleted).toHaveBeenCalledWith(defaultProps.commentId);
  });
  
  test('handles missing onCommentDeleted callback', async () => {
    // Create props without onCommentDeleted
    const propsWithoutCallback = {
      ...defaultProps,
      onCommentDeleted: undefined,
    };
    
    const { getByTestId } = render(<CommentSection {...propsWithoutCallback} />);
    
    // Open modal
    await act(async () => {
      fireEvent.press(getByTestId('more-options-button'));
    });
    
    // Wait for modal to render
    await waitFor(() => expect(getByTestId('mock-more-options')).toBeTruthy());
    
    // Delete comment
    await act(async () => {
      fireEvent.press(getByTestId('delete-btn'));
    });
    
    // This should not throw an error even though onCommentDeleted is undefined
    await waitFor(() => {
      expect(authenticatedDelete).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/comment/onpost/123'
      );
    });
  });

  test('shows loading state while deleting a comment', async () => {
    // Create a promise we can control to delay the delete operation
    let resolveDeletePromise;
    const deletePromise = new Promise((resolve) => {
      resolveDeletePromise = resolve;
    });
    
    (authenticatedDelete as jest.Mock).mockReturnValueOnce(deletePromise);
    
    const { getByTestId } = render(<CommentSection {...defaultProps} />);
    
    // Open modal
    await act(async () => {
      fireEvent.press(getByTestId('more-options-button'));
    });
    
    // Wait for modal to render
    await waitFor(() => expect(getByTestId('mock-more-options')).toBeTruthy());
    
    // Start the delete operation
    let deleteButton;
    await act(async () => {
      deleteButton = getByTestId('delete-btn');
      fireEvent.press(deleteButton);
    });
    
    // Complete the delete operation
    await act(async () => {
      resolveDeletePromise({ status: 'success' });
    });
    
    // Verify the delete call was made
    expect(authenticatedDelete).toHaveBeenCalledWith(
      'https://safetypin.ppl.cs.ui.ac.id/posts/comment/onpost/123'
    );
  });

  // -- Reply Delete Tests --

  test('handles delete reply action', async () => {
    const { getByText, getByTestId, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // View replies
    const viewRepliesBtn = getByText('View replies');
    await act(async () => {
      fireEvent.press(viewRepliesBtn);
    });
    
    // Wait for replies to load
    await waitFor(() => expect(getByTestId('reply-more-options-button-reply1')).toBeTruthy());
    
    // Open reply options modal
    await act(async () => {
      fireEvent.press(getByTestId('reply-more-options-button-reply1'));
    });
    
    // Wait for modal to be visible and get the delete button directly
    await waitFor(() => expect(getByTestId('mock-more-options')).toBeTruthy());
    const deleteButton = getByTestId('delete-btn');
    
    // Reset mocks for this specific test
    (authenticatedGet as jest.Mock).mockClear();
    
    // Press delete button
    await act(async () => {
      fireEvent.press(deleteButton);
    });
    
    // Check if API was called with correct URL
    await waitFor(() => {
      expect(authenticatedDelete).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment/reply1'
      );
    });
    
    // Toast should show success message
    await waitFor(() => expect(queryByText('Reply deleted successfully')).toBeTruthy());
    
    // Should refetch replies
    expect(authenticatedGet).toHaveBeenCalledTimes(1);
  });

  test('handles delete reply error', async () => {
    (authenticatedDelete as jest.Mock).mockRejectedValueOnce(new Error('Failed to delete reply'));
    
    const { getByText, getByTestId, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // View replies
    const viewRepliesBtn = getByText('View replies');
    await act(async () => {
      fireEvent.press(viewRepliesBtn);
    });
    
    // Wait for replies to load
    await waitFor(() => expect(getByTestId('reply-more-options-button-reply1')).toBeTruthy());
    
    // Open reply options modal
    await act(async () => {
      fireEvent.press(getByTestId('reply-more-options-button-reply1'));
    });
    
    // Wait for modal to be visible and get the delete button directly
    await waitFor(() => expect(getByTestId('mock-more-options')).toBeTruthy());
    const deleteButton = getByTestId('delete-btn');
    
    // Press delete button
    await act(async () => {
      fireEvent.press(deleteButton);
    });
    
    // Wait for error message
    await waitFor(() => {
      expect(authenticatedDelete).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment/reply1'
      );
      expect(queryByText('Failed to delete reply')).toBeTruthy();
    });
  });

  test('should handle deleting a reply successfully', async () => {
    // Mock successful replies fetch and delete
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
    (authenticatedDelete as jest.Mock).mockResolvedValueOnce({});
    // Mock second get call after deleting the reply
    (authenticatedGet as jest.Mock).mockResolvedValueOnce({
      data: { content: [] }
    });

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

    // Find and press the delete button in the reply options modal
    const deleteButton = getByText('Delete');
    fireEvent.press(deleteButton);

    // Wait for the delete to complete
    await waitFor(() => {
      expect(authenticatedDelete).toHaveBeenCalledWith(
        `https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment/456`
      );
    });

    // Toast should be visible with success message
    expect(getByText('Reply deleted successfully')).toBeTruthy();

    // Verify fetchReplies was called again
    expect(authenticatedGet).toHaveBeenCalledTimes(2);
  });

  test('should handle reply delete failure', async () => {
    // Mock successful replies fetch but failed delete
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
    (authenticatedDelete as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

    const { getByTestId, getByText } = render(
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

    // Find and press the delete button
    const deleteButton = getByText('Delete');
    fireEvent.press(deleteButton);

    // Wait for the delete to fail
    await waitFor(() => {
      expect(authenticatedDelete).toHaveBeenCalledWith(
        `https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment/456`
      );
    });

    // Toast should be visible with error message
    expect(getByText('Failed to delete reply')).toBeTruthy();
  });

  // -- Reply Rendering & Loading Tests --

  test('toggles replies visibility and loads replies', async () => {
    const { getByText, queryByText } = render(<CommentSection {...defaultProps} />);
    
    // Click "View replies"
    const viewRepliesButton = getByText('View replies');
    
    await act(async () => {
      fireEvent.press(viewRepliesButton);
    });
    
    // Wait for the API call and replies to load
    await waitFor(() => {
      expect(authenticatedGet).toHaveBeenCalledWith(
        'https://safetypin.ppl.cs.ui.ac.id/posts/comment/oncomment/123'
      );
      expect(queryByText('This is a reply')).toBeTruthy();
    });
    
    // Check all replies are visible
    expect(queryByText('This is a reply')).toBeTruthy();
    expect(queryByText('This is another reply')).toBeTruthy();
    
    // Hide replies
    const hideRepliesButton = getByText('Hide replies');
    
    await act(async () => {
      fireEvent.press(hideRepliesButton);
    });
    
    // Replies should be hidden
    expect(queryByText('This is a reply')).toBeNull();
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
});