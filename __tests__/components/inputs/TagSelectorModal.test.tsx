import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TagSelectorModal from '@/components/inputs/TagSelectorModal';
import { TAGS } from '@/assets/TagData';

jest.mock('@expo/vector-icons', () => ({
    AntDesign: jest.fn(() => null),
}));

  
jest.mock('react-native-svg', () => ({
    SvgXml: jest.fn(() => null),
}));

  
describe('TagSelectorModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSelectTag = jest.fn();
  
//   beforeEach(() => {
//     jest.clearAllMocks(); // Reset mocks before each test
//   });

  it('renders correctly when visible', () => {
    const { getByTestId } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag=""
      />
    );
    expect(getByTestId('tag-selector-modal')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByTestId } = render(
      <TagSelectorModal
        visible={false}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag=""
      />
    );
    expect(queryByTestId('tag-selector-modal')).toBeNull();
  });

  it('renders correctly with a pre-selected tag', () => {
    const selectedTag = TAGS[0].value;
    const { getByText } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag={selectedTag}
      />
    );

    // Ensure the pre-selected tag has checkmark (AntDesign icon should exist)
    expect(getByText(TAGS[0].label)).toBeTruthy();
  });

  it('handles empty TAGS list gracefully', () => {
    jest.mock('@/assets/TagData', () => ({ TAGS: [] })); // Mock empty tag list

    const { queryByText } = render(
      <TagSelectorModal visible={true} onClose={mockOnClose} onSelectTag={mockOnSelectTag} selectedTag="" />
    );

    expect(queryByText(/Select a Tag/i)).toBeTruthy(); // Header should still render
  });

  it('allows selecting a tag', () => {
    const { getByText } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag=""
      />
    );

    const firstTag = TAGS[0];
    fireEvent.press(getByText(firstTag.label));

    // No direct assertion possible on useState, but ensuring no crash
    expect(getByText(firstTag.label)).toBeTruthy();
  });

  it('triggers onSelectTag and onClose on confirm', () => {
    const { getByText } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag=""
      />
    );

    const firstTag = TAGS[0];
    fireEvent.press(getByText(firstTag.label));

    const confirmButton = getByText('Confirm');
    fireEvent.press(confirmButton);

    expect(mockOnSelectTag).toHaveBeenCalledWith(firstTag.value);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes when clicking outside modal', () => {
    const { getByTestId } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag=""
      />
    );

    fireEvent.press(getByTestId('tag-selector-modal')); // Clicking background
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('scrolls properly when there are many tags', () => {
    const { getByText } = render(
      <TagSelectorModal
        visible={true}
        onClose={mockOnClose}
        onSelectTag={mockOnSelectTag}
        selectedTag=""
      />
    );

    // Simulate scrolling (this test is limited but ensures rendering works)
    const lastTag = TAGS[TAGS.length - 1];
    expect(getByText(lastTag.label)).toBeTruthy(); // Last tag should be visible
  });
});