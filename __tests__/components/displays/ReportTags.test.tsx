import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ReportTags, { TAG_KEYS } from '@/components/displays/post/ReportTags';
import { View, Text, ScrollView } from 'react-native';
import { SvgXml } from 'react-native-svg';

// Mock the react-native-svg SvgXml component
jest.mock('react-native-svg', () => ({
  SvgXml: jest.fn(() => null)
}));

// Mock all the tag icons
jest.mock('@/assets/tags', () => ({
  assaultTag: '<svg></svg>',
  earthquakeTag: '<svg></svg>',
  fireTag: '<svg></svg>',
  floodTag: '<svg></svg>',
  foundItemTag: '<svg></svg>',
  harassmentTag: '<svg></svg>',
  lostItemTag: '<svg></svg>',
  otherDisasterTag: '<svg></svg>',
  otherCrimeTag: '<svg></svg>',
  theftTag: '<svg></svg>'
}));

describe('ReportTags', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing with no tags', () => {
    render(<ReportTags />);
    
    // Check if ScrollView is rendered
    const tagsContainer = screen.getByTestId('tags-container');
    expect(tagsContainer).toBeTruthy();
    
    // No tag buttons should be rendered
    expect(screen.queryByText(TAG_KEYS[0])).toBeNull();
  });

  it('renders all selected tags correctly', () => {
    // Sample set of tags to test
    const testTags = ['Lost Item', 'Found Item', 'Fire'];
    
    render(<ReportTags selectedTags={testTags} />);
    
    // Verify each tag is rendered
    testTags.forEach(tag => {
      expect(screen.getByText(tag)).toBeTruthy();
    });
    
    // Check that SvgXml was called the correct number of times
    expect(SvgXml).toHaveBeenCalledTimes(testTags.length);
  });

  it('applies the correct styles and colors to each tag', () => {
    const testTags = ['Lost Item', 'Found Item', 'Fire'] as const;
    
    const { UNSAFE_getAllByType } = render(<ReportTags selectedTags={testTags} />);
    
    // Get all View components that are tag buttons
    const tagButtons = UNSAFE_getAllByType(View).filter(view => 
      view.props.style && 
      Array.isArray(view.props.style) && 
      view.props.style[0].borderRadius === 10
    );
    
    // Verify correct number of tag buttons
    expect(tagButtons.length).toBe(testTags.length);
    
    // Check each tag has correct color
    expect(tagButtons[0].props.style[1].backgroundColor).toBe('#9F3F3D'); // Lost Item
    expect(tagButtons[1].props.style[1].backgroundColor).toBe('#5E9F3D'); // Found Item
    expect(tagButtons[2].props.style[1].backgroundColor).toBe('#BA1A1A'); // Fire
  });

  it('renders text with correct styles', () => {
    const { UNSAFE_getAllByType } = render(<ReportTags selectedTags={['Theft']} />);
    
    const textElements = UNSAFE_getAllByType(Text);
    
    // Check if at least one text element exists
    expect(textElements.length).toBeGreaterThan(0);
    
    // Verify text style properties
    const tagText = textElements.find(text => text.props.children === 'Theft');
    expect(tagText).toBeTruthy();
    expect(tagText.props.style.color).toBe('#FFF');
    expect(tagText.props.style.fontSize).toBe(14);
    expect(tagText.props.style.fontWeight).toBe('500');
  });

  it('renders ScrollView with correct properties', () => {
    const { UNSAFE_getAllByType } = render(<ReportTags selectedTags={['Theft']} />);
    
    const scrollView = UNSAFE_getAllByType(ScrollView)[0];
    
    // Check ScrollView properties
    expect(scrollView.props.horizontal).toBe(true);
    expect(scrollView.props.showsHorizontalScrollIndicator).toBe(false);
    expect(scrollView.props.contentContainerStyle).toEqual({
      flexDirection: 'row',
      paddingHorizontal: 0,
    });
  });

  it('renders all possible tag types', () => {
    // Test with all possible tags
    render(<ReportTags selectedTags={TAG_KEYS} />);
    
    // Verify each tag from TAG_KEYS is rendered
    TAG_KEYS.forEach(tag => {
      expect(screen.getByText(tag)).toBeTruthy();
    });
    
    // SvgXml should be called for each tag
    expect(SvgXml).toHaveBeenCalledTimes(TAG_KEYS.length);
  });

  it('renders icon with correct size', () => {
    render(<ReportTags selectedTags={['Theft']} />);
    
    // Check if SvgXml was called with correct style
    expect(SvgXml).toHaveBeenCalledWith(
      expect.objectContaining({
        style: expect.objectContaining({
          width: 12,
          height: 12,
        })
      }),
      expect.anything()
    );
  });
});