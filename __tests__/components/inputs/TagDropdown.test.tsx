import React from 'react';
import { render, fireEvent, waitFor, cleanup, act } from '@testing-library/react-native';
import TagDropdown from '@/components/inputs/TagDropdown';
import TagSelectorModal from '@/components/inputs/TagSelectorModal';
import { authenticatedGet } from '@/utils/api';
import { TAG_KEYS } from '@/components/displays/post/ReportTags';

// Mock the API call
jest.mock('@/utils/api', () => ({
  authenticatedGet: jest.fn()
}));

// Store the `onClose` function for testing
let capturedOnClose = () => {};
let capturedOnSelectTag = () => {};
let capturedSelectedTag = '';
let capturedAvailableTags: string[] = [];

// Mock the TagSelectorModal component
jest.mock('@/components/inputs/TagSelectorModal', () =>
  jest.fn(({ visible, onClose, onSelectTag, selectedTag, availableTags }) => {
    if (visible) {
      const React = require('react'); // Keep requiring React inside the mock
      capturedOnClose = onClose; // Store onClose for testing
      capturedOnSelectTag = onSelectTag; // Store onSelectTag for testing
      capturedSelectedTag = selectedTag; // Store selectedTag for testing
      capturedAvailableTags = availableTags || []; // Store availableTags for testing
    }

    const React = require('react');
    return visible ? React.createElement(
      'View',
      { testID: 'mock-modal' },
      React.createElement('TouchableOpacity', { testID: 'close-modal', onPress: onClose }, 'Close Modal'),
      React.createElement('TouchableOpacity', { testID: 'select-tag', onPress: () => onSelectTag('Test Tag') }, 'Select Tag')
    ) : null;
  })
);

// Mock SVG component
jest.mock('react-native-svg', () => ({
  SvgXml: 'SvgXml'
}));

// Silence console errors during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('TagDropdown Component', () => {
  afterEach(cleanup);

  const mockOnTagChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks(); // Reset mock functions before each test
    // Reset captured values
    capturedOnClose = () => {};
    capturedOnSelectTag = () => {};
    capturedSelectedTag = '';
    capturedAvailableTags = [];
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
    
    await act(async () => {
      fireEvent.press(getByTestId('tag-dropdown-button')); // Simulate dropdown click
    });

    expect(TagSelectorModal).toHaveBeenCalledWith(
      expect.objectContaining({ visible: true }),
      {}
    );
  });

  it('closes the modal when onClose is triggered', async () => {
    const { getByTestId, rerender } = render(
      <TagDropdown selectedTag="" onTagChange={mockOnTagChange} />
    );
  
    await act(async () => {
      fireEvent.press(getByTestId('tag-dropdown-button'));
      // We need to wait for the state to update
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  
    await act(async () => {
      capturedOnClose();
      // We need to wait for the state to update
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  
    rerender(<TagDropdown selectedTag="" onTagChange={mockOnTagChange} />);
  
    expect(TagSelectorModal).toHaveBeenLastCalledWith(
      expect.objectContaining({ visible: false }),
      expect.anything()
    );
  });
  
  it('calls onTagChange when a tag is selected', async () => {
    const { getByTestId } = render(
      <TagDropdown selectedTag="" onTagChange={mockOnTagChange} />
    );
    
    await act(async () => {
      fireEvent.press(getByTestId('tag-dropdown-button'));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    await act(async () => {
      capturedOnSelectTag('Selected Tag');
    });
    
    expect(mockOnTagChange).toHaveBeenCalledWith('Selected Tag');
  });

  it('does not crash when testID is provided', () => {
    const { getByTestId } = render(<TagDropdown selectedTag="" onTagChange={mockOnTagChange} testID="custom-test-id" />);
    expect(getByTestId('custom-test-id')).toBeTruthy(); // Component renders with custom testID
  });

  it('uses provided availableTags', async () => {
    const providedTags = ['Tag1', 'Tag2', 'Tag3'];
    
    const { getByTestId } = render(
      <TagDropdown 
        selectedTag="" 
        onTagChange={mockOnTagChange} 
        availableTags={providedTags} 
      />
    );
    
    // We need to open the modal to capture availableTags
    await act(async () => {
      fireEvent.press(getByTestId('tag-dropdown-button'));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // No API call should be made when tags are provided
    expect(authenticatedGet).not.toHaveBeenCalled();
    
    // Check that the correct tags were passed to the modal
    expect(capturedAvailableTags).toEqual(providedTags);
  });

  it('fetches tags when no availableTags are provided', async () => {
    // Mock successful API response
    const mockTags = ['API Tag 1', 'API Tag 2'];
    (authenticatedGet as jest.Mock).mockResolvedValue({
      success: true,
      data: mockTags
    });
    
    const { getByTestId } = render(
      <TagDropdown selectedTag="" onTagChange={mockOnTagChange} />
    );
    
    // API should be called to fetch tags
    expect(authenticatedGet).toHaveBeenCalledWith('https://safetypin.ppl.cs.ui.ac.id/posts/category');
    
    // Open modal after API response resolves
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Give time for API call to resolve
      fireEvent.press(getByTestId('tag-dropdown-button'));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(capturedAvailableTags).toEqual(mockTags);
  });

  it('falls back to TAG_KEYS when API call fails', async () => {
    // Mock failed API response
    (authenticatedGet as jest.Mock).mockRejectedValue(new Error('API error'));
    
    const { getByTestId } = render(
      <TagDropdown selectedTag="" onTagChange={mockOnTagChange} />
    );
    
    // API should be called to fetch tags
    expect(authenticatedGet).toHaveBeenCalledWith('https://safetypin.ppl.cs.ui.ac.id/posts/category');
    
    // Open modal after error
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Give time for API call to resolve
      fireEvent.press(getByTestId('tag-dropdown-button'));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(capturedAvailableTags).toEqual(TAG_KEYS);
  });

  it('falls back to TAG_KEYS when API success is false', async () => {
    // Mock API response with success: false
    (authenticatedGet as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Error fetching categories'
    });
    
    const { getByTestId } = render(
      <TagDropdown selectedTag="" onTagChange={mockOnTagChange} />
    );
    
    // API should be called to fetch tags
    expect(authenticatedGet).toHaveBeenCalledWith('https://safetypin.ppl.cs.ui.ac.id/posts/category');
    
    // Open modal after API response resolves
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Give time for API call to resolve
      fireEvent.press(getByTestId('tag-dropdown-button'));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Even though API returned success:false, the component should use TAG_KEYS as fallback
    expect(capturedAvailableTags).toEqual(TAG_KEYS);
  });

  it('updates availableTags when propAvailableTags changes', async () => {
    const initialTags = ['Tag1', 'Tag2'];
    const updatedTags = ['Tag3', 'Tag4', 'Tag5'];
    
    const { getByTestId, rerender } = render(
      <TagDropdown 
        selectedTag="" 
        onTagChange={mockOnTagChange} 
        availableTags={initialTags} 
      />
    );
    
    // Open modal to capture initial tags
    await act(async () => {
      fireEvent.press(getByTestId('tag-dropdown-button'));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Check initial tags
    expect(capturedAvailableTags).toEqual(initialTags);
    
    // Close modal
    await act(async () => {
      capturedOnClose();
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Update props
    rerender(
      <TagDropdown 
        selectedTag="" 
        onTagChange={mockOnTagChange} 
        availableTags={updatedTags} 
      />
    );
    
    // Open modal again to capture updated tags
    await act(async () => {
      fireEvent.press(getByTestId('tag-dropdown-button'));
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Check that tags were updated
    expect(capturedAvailableTags).toEqual(updatedTags);
  });
});
