import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import TagDropdown from '@/components/inputs/TagDropdown';
import TagSelectorModal from '@/components/inputs/TagSelectorModal';

let capturedOnClose = () => {}; // Store the `onClose` function for testing

jest.mock('@/components/inputs/TagSelectorModal', () =>
  jest.fn(({ visible, onClose }) => {
    if (!visible) return null;

    const React = require('react'); // Keep requiring React inside the mock
    capturedOnClose = onClose; // Store onClose for testing

    return React.createElement(
      'View',
      { testID: 'mock-modal' },
      React.createElement('TouchableOpacity', { testID: 'close-modal', onPress: onClose }, 'Close Modal')
    );
  })
);
  
describe('TagDropdown Component', () => {
  afterEach(cleanup);

  const mockOnTagChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks(); // Reset mock functions before each test
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(<TagDropdown selectedTag="" onTagChange={mockOnTagChange} />);

    expect(getByText('Select a Tag')).toBeTruthy(); // Default text when no tag is selected
  });

  it('displays the correct selected tag', () => {
    const { getByText } = render(<TagDropdown selectedTag="Sample Tag" onTagChange={mockOnTagChange} />);

    expect(getByText('Sample Tag')).toBeTruthy(); // Correct tag displayed
  });

  it('opens the modal when dropdown is clicked', async () => {
    const { getByTestId } = render(<TagDropdown selectedTag="" onTagChange={mockOnTagChange} />);

    fireEvent.press(getByTestId('tag-dropdown-button')); // Simulate dropdown click

    await waitFor(() => {
        expect(TagSelectorModal).toHaveBeenCalledWith(
          expect.objectContaining({ visible: true }),
          {}
        );
      });
  });

  it('closes the modal when onClose is triggered', async () => {
    const { getByTestId, queryByTestId } = render(
      <TagDropdown selectedTag="" onTagChange={mockOnTagChange} />
    );
  
    // Open the modal
    fireEvent.press(getByTestId('tag-dropdown-button'));
  
    await waitFor(() => {
      expect(TagSelectorModal).toHaveBeenCalledWith(
        expect.objectContaining({ visible: true }),
        {}
      );
    });
  
    capturedOnClose(); // Calls the stored `onClose` function
      await waitFor(() => {
      expect(queryByTestId('mock-modal')).toBeNull(); // Modal should not exist anymore
    });
  });
  

  it('does not crash when testID is provided', () => {
    const { getByTestId } = render(<TagDropdown selectedTag="" onTagChange={mockOnTagChange} testID="custom-test-id" />);

    expect(getByTestId('custom-test-id')).toBeTruthy(); // Component renders with custom testID
  });
});
