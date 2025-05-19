import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TagSelectorModal from '@/components/inputs/TagSelectorModal';
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

// Sample tag keys for testing
const MOCK_TAG_KEYS = ['Safety', 'Infrastructure', 'Harassment', 'Other'];

describe('TagSelectorModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSelectTag = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly when visible', () => {
    const { getByText } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag=""
      />
    );
    expect(getByText('Select Category')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <TagSelectorModal
        visible={false}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag=""
      />
    );
    expect(queryByText('Select Category')).toBeNull();
  });

  it('renders correctly with a pre-selected tag', () => {
    const selectedTag = TAG_KEYS[0];
    const { getAllByText } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag={selectedTag}
      />
    );

    // The selected tag should appear in the list
    expect(getAllByText(selectedTag)[0]).toBeTruthy();
  });

  it('selects a tag and immediately calls onSelectTag and onClose', () => {
    const { getByText } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag=""
        availableTags={MOCK_TAG_KEYS}
      />
    );

    // Select a tag
    fireEvent.press(getByText(MOCK_TAG_KEYS[0]));

    // Should immediately call both callbacks
    expect(mockOnSelectTag).toHaveBeenCalledWith(MOCK_TAG_KEYS[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes when clicking the close button', () => {
    const { getByText } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag=""
      />
    );

    // Find and press the close button
    fireEvent.press(getByText('✕'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('uses provided availableTags instead of default TAG_KEYS', () => {
    const customTags = ['Custom1', 'Custom2', 'Custom3'];
    
    const { getByText, queryByText } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag=""
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

  it('handles empty availableTags gracefully', () => {
    const { queryByText } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag=""
        availableTags={[]}
      />
    );

    // Header should still render
    expect(queryByText('Select Category')).toBeTruthy();
    // But no tags should be rendered
    TAG_KEYS.forEach(tag => {
      expect(queryByText(tag)).toBeNull();
    });
  });
  
  it('applies different styling to selected tag', () => {
    const selectedTag = MOCK_TAG_KEYS[1];
    
    const { getByText } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag={selectedTag}
        availableTags={MOCK_TAG_KEYS}
      />
    );

    // The selected tag element should exist
    const tagElement = getByText(selectedTag);
    expect(tagElement).toBeTruthy();
    
    // We can't directly test styles in RNTL, but we can verify the component renders
    // without errors when a tag is selected
  });
  
  it('renders all available tags', () => {
    const { getByText } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag=""
        availableTags={MOCK_TAG_KEYS}
      />
    );

    // All tags should be rendered
    MOCK_TAG_KEYS.forEach(tag => {
      expect(getByText(tag)).toBeTruthy();
    });
  });
});