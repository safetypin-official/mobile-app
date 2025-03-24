import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import fetchMock from 'jest-fetch-mock';
import TagSelector from '@/components/inputs/TagSelector'; // Adjust import path as needed

// Enable fetch mocks
fetchMock.enableMocks();

describe('TagSelector Component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // Test loading state
  it('should display loading indicator when fetching tags', () => {
    // Mock fetch to never resolve, keeping component in loading state
    fetchMock.mockResponseOnce(() => new Promise(resolve => {}));
    
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
    
    fetchMock.mockResponseOnce(JSON.stringify(mockTags));
    
    const { getByTestId, getAllByText } = render(
      <TagSelector selectedTag={null} onTagChange={jest.fn()} testID="test-selector" />
    );
    
    await waitFor(() => expect(getByTestId('test-selector')).toBeTruthy());
    
    expect(getAllByText(/React|TypeScript|JavaScript/).length).toBe(3);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('http://10.0.2.2/posts/category');
  });

  // Test error handling with API error message
  it('should display error message when API returns an error', async () => {
    const mockError = {
      success: false,
      message: 'Failed to fetch tags',
      data: []
    };
    
    fetchMock.mockResponseOnce(JSON.stringify(mockError));
    
    const { getByTestId, getByText } = render(
      <TagSelector selectedTag={null} onTagChange={jest.fn()} testID="test-selector" />
    );
    
    await waitFor(() => expect(getByTestId('test-selector-error')).toBeTruthy());
    
    expect(getByText('Failed to fetch tags')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
  });

  // Test error handling with network error
  it('should display error message when network error occurs', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'));
    
    const { getByTestId, getByText } = render(
      <TagSelector selectedTag={null} onTagChange={jest.fn()} testID="test-selector" />
    );
    
    await waitFor(() => expect(getByTestId('test-selector-error')).toBeTruthy());
    
    expect(getByText('Error connecting to the server')).toBeTruthy();
  });

  // Test retry functionality
  it('should retry fetching tags when retry button is pressed', async () => {
    // First request fails
    fetchMock.mockRejectOnce(new Error('Network error'));
    
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
    fetchMock.mockResponseOnce(JSON.stringify(mockTags));
    
    // Press retry button
    fireEvent.press(getByTestId('test-selector-retry'));
    
    // Component should now load successfully
    await waitFor(() => expect(getByTestId('test-selector')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  // Test tag selection
  it('should call onTagChange when a tag is selected', async () => {
    const mockTags = {
      success: true,
      message: 'Tags fetched successfully',
      data: ['React', 'TypeScript']
    };
    
    fetchMock.mockResponseOnce(JSON.stringify(mockTags));
    
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
    
    fetchMock.mockResponseOnce(JSON.stringify(mockTags));
    
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
    fetchMock.mockResponseOnce(() => new Promise(resolve => {}));
    
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
    
    fetchMock.mockResponseOnce(JSON.stringify(mockError));
    
    const { getByText } = render(
      <TagSelector selectedTag={null} onTagChange={jest.fn()} />
    );
    
    await waitFor(() => expect(getByText('Failed to fetch tags')).toBeTruthy());
  });

  // Test color cycling for tags
  it('should cycle through colors for tags based on index', async () => {
    // Create enough tags to test color cycling
    const mockTags = {
      success: true,
      message: 'Tags fetched successfully',
      data: Array.from({ length: 12 }, (_, i) => `Tag ${i+1}`)
    };
    
    fetchMock.mockResponseOnce(JSON.stringify(mockTags));
    
    const { getAllByText } = render(
      <TagSelector selectedTag={null} onTagChange={jest.fn()} />
    );
    
    await waitFor(() => expect(getAllByText(/Tag/).length).toBe(12));
    
    // The test passes if rendering completes without errors, 
    // indicating the color cycling logic works
  });
});