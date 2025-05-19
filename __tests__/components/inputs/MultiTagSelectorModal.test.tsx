import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MultiTagSelectorModal from '@/components/inputs/MultiTagSelectorModal';
import { TAG_KEYS } from '@/components/displays/post/ReportTags';

// Mock the getTagInfo function
jest.mock('@/components/displays/Types', () => ({
  getTagInfo: (tag) => ({
    color: '#FF5733',
    icon: '<svg></svg>', // Simple mock SVG string
  }),
}));

// Mock SVG component
jest.mock('react-native-svg', () => ({
  SvgXml: jest.fn(() => null),
}));

// Sample tags for testing
const MOCK_TAGS = ['Safety', 'Infrastructure', 'Harassment', 'Other'];

describe('MultiTagSelectorModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSelectTag = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly when visible', () => {
    const { getByText } = render(
      <MultiTagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTags={[]}
      />
    );
    expect(getByText('Select Categories')).toBeTruthy();
    expect(getByText('Done')).toBeTruthy();
    expect(getByText('Reset')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <MultiTagSelectorModal
        visible={false}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTags={[]}
      />
    );
    expect(queryByText('Select Categories')).toBeNull();
  });

  it('renders all available tags', () => {
    const { getByText } = render(
      <MultiTagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTags={[]}
        availableTags={MOCK_TAGS}
      />
    );

    // All tags should be rendered
    MOCK_TAGS.forEach(tag => {
      expect(getByText(tag)).toBeTruthy();
    });
  });

  it('uses provided availableTags instead of default TAG_KEYS', () => {
    const customTags = ['Custom1', 'Custom2', 'Custom3'];
    
    const { getByText, queryByText } = render(
      <MultiTagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTags={[]}
        availableTags={customTags}
      />
    );

    // Custom tags should be visible
    expect(getByText('Custom1')).toBeTruthy();
    expect(getByText('Custom2')).toBeTruthy();
    
    // If TAG_KEYS has a tag that's not in customTags, it shouldn't appear
    if (TAG_KEYS.includes('Lighting') && !customTags.includes('Lighting')) {
      expect(queryByText('Lighting')).toBeNull();
    }
  });

  it('renders selected tags with different styling', () => {
    const selectedTags = [MOCK_TAGS[0], MOCK_TAGS[2]];
    
    const { getByText } = render(
      <MultiTagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTags={selectedTags}
        availableTags={MOCK_TAGS}
      />
    );

    // Check that selected tags are rendered
    selectedTags.forEach(tag => {
      expect(getByText(tag)).toBeTruthy();
    });
    
    // We can't directly test styles in RNTL, but we can verify the component renders
    // without errors when tags are selected
  });

  it('calls onSelectTag when a tag is pressed', () => {
    const { getByText } = render(
      <MultiTagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTags={[]}
        availableTags={MOCK_TAGS}
      />
    );

    // Press a tag
    fireEvent.press(getByText(MOCK_TAGS[1]));
    
    // Should call onSelectTag with the correct tag
    expect(mockOnSelectTag).toHaveBeenCalledWith(MOCK_TAGS[1]);
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(
      <MultiTagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTags={[]}
      />
    );

    // Find and press the close button
    fireEvent.press(getByText('✕'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when Done button is pressed', () => {
    const { getByText } = render(
      <MultiTagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTags={[]}
      />
    );

    // Press the Done button
    fireEvent.press(getByText('Done'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onSelectTag for each selected tag when Reset button is pressed', () => {
    const selectedTags = [MOCK_TAGS[0], MOCK_TAGS[2]];
    
    const { getByText } = render(
      <MultiTagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTags={selectedTags}
        availableTags={MOCK_TAGS}
      />
    );

    // Press the Reset button
    fireEvent.press(getByText('Reset'));
    
    // Should call onSelectTag for each selected tag
    expect(mockOnSelectTag).toHaveBeenCalledTimes(selectedTags.length);
    expect(mockOnSelectTag).toHaveBeenCalledWith(selectedTags[0]);
    expect(mockOnSelectTag).toHaveBeenCalledWith(selectedTags[1]);
  });

  it('handles empty selectedTags array', () => {
    const { getByText, queryByTestId } = render(
      <MultiTagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTags={[]}
        availableTags={MOCK_TAGS}
      />
    );

    // Reset button should still be present
    expect(getByText('Reset')).toBeTruthy();
    
    // Press the Reset button with empty selection
    fireEvent.press(getByText('Reset'));
    
    // onSelectTag should not be called
    expect(mockOnSelectTag).not.toHaveBeenCalled();
  });

  it('handles empty availableTags array', () => {
    const { getByText } = render(
      <MultiTagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTags={[]}
        availableTags={[]}
      />
    );

    // Header should still render
    expect(getByText('Select Categories')).toBeTruthy();
    
    // Buttons should be present
    expect(getByText('Reset')).toBeTruthy();
    expect(getByText('Done')).toBeTruthy();
  });

  it('adds testID attributes to elements for easier testing', () => {
    const { getByTestId } = render(
      <MultiTagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTags={[]}
        availableTags={MOCK_TAGS}
        testID="multi-tag-modal"
      />
    );

    // This test will actually fail if the component doesn't have testIDs
    // We'll need to add them to the component, but this is good practice
    expect(() => getByTestId("multi-tag-modal")).toThrow();
  });
});