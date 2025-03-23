import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CommentSection from '@/components/displays/post/CommentSection';

// Mock the Timer functions
jest.useFakeTimers();

// Mock the MoreOptionsButton component
jest.mock('@/components/buttons/post/MoreOptionsButton', () => {
  return jest.fn(({ closeModal, onSendMessage, onReport }) => (
    <>
      <button testID="send-message-button" onPress={onSendMessage}>Send Message</button>
      <button testID="report-button" onPress={onReport}>Report</button>
      <button testID="close-modal-button" onPress={closeModal}>Close</button>
    </>
  ));
});

// Mock the Toast component
jest.mock('@/components/toasts/Toast', () => {
  return jest.fn(({ text }) => <div testID="toast">{text}</div>);
});

describe('CommentSection Component', () => {
  const defaultProps = {
    avatarUrl: 'https://example.com/avatar.jpg',
    username: 'John Doe',
    handle: '@johndoe',
    date: '2h',
    content: 'This is a test comment',
    likeCount: 42,
    likeIconUrl: 'https://example.com/like.png',
    moreOptionsIconUrl: 'https://example.com/more.png',
  };

  test('renders correctly with all props', () => {
    const { getByText, getByTestId } = render(<CommentSection {...defaultProps} />);
    
    // Check if all text elements are rendered
    expect(getByText(defaultProps.username)).toBeTruthy();
    expect(getByText(`${defaultProps.handle} • ${defaultProps.date}`)).toBeTruthy();
    expect(getByText(defaultProps.content)).toBeTruthy();
    expect(getByText(defaultProps.likeCount.toString())).toBeTruthy();
    
    // Check if the more options button is present
    expect(getByTestId('more-options-button')).toBeTruthy();
  });

  test('opens modal when more options button is pressed', () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...defaultProps} />);
    
    // Initially modal should not be visible
    expect(queryByTestId('more-options-modal')).toBeFalsy();
    
    // Press more options button
    fireEvent.press(getByTestId('more-options-button'));
    
    // Modal should be visible now
    expect(getByTestId('more-options-modal')).toBeTruthy();
  });

  test('closes modal when overlay is pressed', () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...defaultProps} />);
    
    // Open modal first
    fireEvent.press(getByTestId('more-options-button'));
    expect(getByTestId('more-options-modal')).toBeTruthy();
    
    // Press overlay to close
    fireEvent.press(getByTestId('modal-overlay'));
    
    // Modal should be closed
    expect(queryByTestId('more-options-modal')).toBeFalsy();
  });

  test('closes modal when close button is pressed', () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...defaultProps} />);
    
    // Open modal first
    fireEvent.press(getByTestId('more-options-button'));
    
    // Press close button
    fireEvent.press(getByTestId('close-modal-button'));
    
    // Modal should be closed
    expect(queryByTestId('more-options-modal')).toBeFalsy();
  });

  test('shows toast when report is submitted', async () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...defaultProps} />);
    
    // Open modal first
    fireEvent.press(getByTestId('more-options-button'));
    
    // Press report button
    fireEvent.press(getByTestId('report-button'));
    
    // Toast should be visible
    expect(getByTestId('toast')).toBeTruthy();
    expect(getByTestId('report-submitted')).toBeTruthy();
    
    // Modal should be closed
    expect(queryByTestId('more-options-modal')).toBeFalsy();
    
    // Fast-forward timers
    jest.advanceTimersByTime(3000);
    
    // Toast should disappear after timeout
    await waitFor(() => {
      expect(queryByTestId('report-submitted')).toBeFalsy();
    });
  });

  test('handles send message action', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const { getByTestId } = render(<CommentSection {...defaultProps} />);
    
    // Open modal first
    fireEvent.press(getByTestId('more-options-button'));
    
    // Press send message button
    fireEvent.press(getByTestId('send-message-button'));
    
    // Check if console.log was called
    expect(consoleSpy).toHaveBeenCalledWith('Send Message');
    
    // Clean up
    consoleSpy.mockRestore();
  });

  test('closes toast when clicked', () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...defaultProps} />);
    
    // Open modal first
    fireEvent.press(getByTestId('more-options-button'));
    
    // Press report button to show toast
    fireEvent.press(getByTestId('report-button'));
    
    // Toast should be visible
    expect(getByTestId('report-submitted')).toBeTruthy();
    
    // Press toast to close it
    fireEvent.press(getByTestId('report-submitted'));
    
    // Toast should be closed
    expect(queryByTestId('report-submitted')).toBeFalsy();
  });

  test('closes modal via onRequestClose', () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...defaultProps} />);
    
    // Open modal first
    fireEvent.press(getByTestId('more-options-button'));
    expect(getByTestId('more-options-modal')).toBeTruthy();
    
    // Simulate back button press (onRequestClose)
    const modal = getByTestId('more-options-modal');
    fireEvent(modal, 'requestClose');
    
    // Modal should be closed
    expect(queryByTestId('more-options-modal')).toBeFalsy();
  });

  test('likes a comment when like button is pressed', () => {
    const { getByText } = render(<CommentSection {...defaultProps} />);
    
    // Find the like button by its containing text
    const likeButton = getByText(defaultProps.likeCount.toString()).parent;
    
    // Press like button
    fireEvent.press(likeButton);
    
    // In the current implementation, pressing like doesn't change the count
    // This test is to ensure the button is clickable and doesn't crash
    expect(getByText(defaultProps.likeCount.toString())).toBeTruthy();
  });
});