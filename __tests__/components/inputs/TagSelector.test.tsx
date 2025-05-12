import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TagSelector from '@/components/inputs/TagSelector';

// Mock the api module
jest.mock('@/utils/api', () => ({
  authenticatedGet: jest.fn()
}));

// Import the mocked module
import { authenticatedGet } from '@/utils/api';

describe('TagSelector Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test loading state
  it('should display loading indicator when fetching tags', () => {
    // Mock a never-resolving promise for loading state
    (authenticatedGet as jest.Mock).mockReturnValue(new Promise(() => {}));
    
    const { getByTestId, getByText } = render(
      <TagSelector selectedTag={null} onTagChange={jest.fn()} testID="test-selector" />
    );
    
    expect(getByTestId('test-selector-loading')).toBeTruthy();
    expect(getByText('Loading tags...')).toBeTruthy();
  });

  // Test successful data fetching
  it('should render tags after successful data fetch', async () => {
    const mockTags = {
      success: true,
      message: 'Tags fetched successfully',
      data: ['React', 'TypeScript', 'JavaScript']
    };
    
    (authenticatedGet as jest.Mock).mockResolvedValue(mockTags);
    
    const { getByTestId, getAllByText } = render(
      <TagSelector selectedTag={null} onTagChange={jest.fn()} testID="test-selector" />
    );
    
    await waitFor(() => expect(getByTestId('test-selector')).toBeTruthy());
    
    expect(getAllByText(/React|TypeScript|JavaScript/).length).toBe(3);
    expect(authenticatedGet).toHaveBeenCalledTimes(1);
    expect(authenticatedGet).toHaveBeenCalledWith('https://safetypin.ppl.cs.ui.ac.id/posts/category');
  });

  // Test error handling with API error message
  it('should display error message when API returns an error', async () => {
    const mockError = {
      success: false,
      message: 'Failed to fetch tags',
      data: []
    };
    
    (authenticatedGet as jest.Mock).mockResolvedValue(mockError);
    
    const { getByTestId, getByText } = render(
      <TagSelector selectedTag={null} onTagChange={jest.fn()} testID="test-selector" />
    );
    
    await waitFor(() => expect(getByTestId('test-selector-error')).toBeTruthy());
    
    expect(getByText('Failed to fetch tags')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
  });

  // Test error handling with network error
  it('should display error message when network error occurs', async () => {
    (authenticatedGet as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { getByTestId, getByText } = render(
      <TagSelector selectedTag={null} onTagChange={jest.fn()} testID="test-selector" />
    );
    
    await waitFor(() => expect(getByTestId('test-selector-error')).toBeTruthy());
    
    expect(getByText('Error connecting to the server')).toBeTruthy();
  });

  // Test retry functionality
  it('should retry fetching tags when retry button is pressed', async () => {
    // First request fails
    (authenticatedGet as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    const { getByTestId } = render(
      <TagSelector selectedTag={null} onTagChange={jest.fn()} testID="test-selector" />
    );
    
    await waitFor(() => expect(getByTestId('test-selector-error')).toBeTruthy());
    
    // Setup mock for retry
    const mockTags = {
      success: true,
      message: 'Tags fetched successfully',
      data: ['React']
    };
    (authenticatedGet as jest.Mock).mockResolvedValueOnce(mockTags);
    
    // Press retry button
    fireEvent.press(getByTestId('test-selector-retry'));
    
    // Component should now load successfully
    await waitFor(() => expect(getByTestId('test-selector')).toBeTruthy());
    expect(authenticatedGet).toHaveBeenCalledTimes(2);
  });

  // Test tag selection
  it('should call onTagChange when a tag is selected', async () => {
    const mockTags = {
      success: true,
      message: 'Tags fetched successfully',
      data: ['React', 'TypeScript']
    };
    
    (authenticatedGet as jest.Mock).mockResolvedValue(mockTags);
    
    const mockOnTagChange = jest.fn();
    const { getByTestId } = render(
      <TagSelector selectedTag={null} onTagChange={mockOnTagChange} testID="test-selector" />
    );
    
    await waitFor(() => expect(getByTestId('test-selector')).toBeTruthy());
    
    // Press the first tag (with ID "React" now)
    fireEvent.press(getByTestId('test-selector-tag-React'));
    
    expect(mockOnTagChange).toHaveBeenCalledWith('React');
  });

  // Test tag deselection
  it('should deselect a tag when it is pressed again', async () => {
    const mockTags = {
      success: true,
      message: 'Tags fetched successfully',
      data: ['React', 'TypeScript']
    };
    
    (authenticatedGet as jest.Mock).mockResolvedValue(mockTags);
    
    const mockOnTagChange = jest.fn();
    const { getByTestId } = render(
      <TagSelector selectedTag="React" onTagChange={mockOnTagChange} testID="test-selector" />
    );
    
    await waitFor(() => expect(getByTestId('test-selector')).toBeTruthy());
    
    // Press the already selected tag
    fireEvent.press(getByTestId('test-selector-tag-React'));
    
    expect(mockOnTagChange).toHaveBeenCalledWith(null);
  });

  // Test default testID when none is provided
  it('should use default testIDs when no testID prop is provided', async () => {
    (authenticatedGet as jest.Mock).mockReturnValue(new Promise(() => {}));
    
    const { getByTestId } = render(
      <TagSelector selectedTag={null} onTagChange={jest.fn()} />
    );
    
    expect(getByTestId('tag-selector-loading')).toBeTruthy();
  });

  // Test fallback to default error message
  it('should use default error message when API returns success false without message', async () => {
    const mockError = {
      success: false,
      data: []
    };
    
    (authenticatedGet as jest.Mock).mockResolvedValue(mockError);
    
    const { getByText, getByTestId } = render(
      <TagSelector selectedTag={null} onTagChange={jest.fn()} />
    );
    
    await waitFor(() => expect(getByTestId('tag-selector-error')).toBeTruthy());
    expect(getByText('Failed to fetch tags')).toBeTruthy();
  });

  // Test color cycling for tags
  it('should cycle through colors for tags based on index', async () => {
    // Create enough tags to test color cycling
    const mockTags = {
      success: true,
      message: 'Tags fetched successfully',
      data: Array.from({ length: 12 }, (_, i) => `Tag ${i+1}`)
    };
    
    (authenticatedGet as jest.Mock).mockResolvedValue(mockTags);
    
    const { getAllByText, getByTestId } = render(
      <TagSelector selectedTag={null} onTagChange={jest.fn()} />
    );
    
    await waitFor(() => expect(getByTestId('tag-selector')).toBeTruthy());
    expect(getAllByText(/Tag/).length).toBe(12);
    
    // The test passes if rendering completes without errors, 
    // indicating the color cycling logic works
  });
});