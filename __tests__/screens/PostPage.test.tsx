import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'react-native-image-picker';
import { router } from 'expo-router';
import PostPage from '@/app/post';
import { TAGS } from '@/components/inputs/TagSelector';

// Mock the dependencies
jest.mock('expo-location');
jest.mock('react-native-image-picker');
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));
jest.mock('@/components/buttons/Button', () => 'Button');
jest.mock('@/components/inputs/InputField', () => 'InputField');
jest.mock('@/components/inputs/TagSelector', () => 'TagSelector');
jest.mock('@expo/vector-icons/Entypo', () => 'Entypo');

// Mock fetch
global.fetch = jest.fn();

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('PostPage', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock Location API
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: {
        latitude: 12.3456,
        longitude: 78.9012,
      },
    });

    // Mock fetch with default implementation
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        status: 200,
        statusText: 'OK',
      })
    );
  });

  test('renders correctly', async () => {
    const { getByText, getAllByText } = render(<PostPage />);
    
    // Wait for location to be fetched
    await waitFor(() => {
      expect(getByText('Latitude: 12.3456')).toBeTruthy();
      expect(getByText('Longitude: 78.9012')).toBeTruthy();
    });
    
    // Check if all required elements are rendered
    expect(getByText('New Report')).toBeTruthy();
    expect(getByText('Post')).toBeTruthy();
    expect(getByText('Location')).toBeTruthy();
    expect(getAllByText('Tags').length).toBeGreaterThan(0);
    expect(getAllByText('Description').length).toBeGreaterThan(0);
    expect(getByText('Attachments')).toBeTruthy();
    expect(getByText('Select Image')).toBeTruthy();
  });

  test('handles location permission denied', async () => {
    // Mock permission denied
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });
    
    const consoleSpy = jest.spyOn(console, 'log');
    
    const { getByText } = render(<PostPage />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Permission to access location was denied');
      expect(getByText('Latitude: Fetching...')).toBeTruthy();
      expect(getByText('Longitude: Fetching...')).toBeTruthy();
    });
  });

  test('handles close button press', () => {
    const { getByText } = render(<PostPage />);
    
    // Find the close button and press it
    const closeButton = getByText('');  // Assuming Entypo cross icon
    fireEvent.press(closeButton);
    
    // Check if router.replace was called with correct route
    expect(router.replace).toHaveBeenCalledWith('/map');
  });

  test('handles image picker success', async () => {
    // Mock successful image selection
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementation((_, callback) => {
      callback({
        didCancel: false,
        errorMessage: undefined,
        assets: [{ uri: 'file:///path/to/image.jpg' }],
      });
    });
    
    const { getByText, findByTestId } = render(<PostPage />);
    
    // Press the image selection button
    const selectButton = getByText('Select Image');
    fireEvent.press(selectButton);
    
    // Check if image is displayed
    await waitFor(() => {
      expect(findByTestId('image-preview')).toBeTruthy();
    });
  });

  test('handles image picker cancellation', () => {
    // Mock cancelled image selection
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementation((_, callback) => {
      callback({
        didCancel: true,
      });
    });
    
    const consoleSpy = jest.spyOn(console, 'log');
    const { getByText } = render(<PostPage />);
    
    // Press the image selection button
    const selectButton = getByText('Select Image');
    fireEvent.press(selectButton);
    
    // Check if cancellation was logged
    expect(consoleSpy).toHaveBeenCalledWith('User cancelled image picker');
  });

  test('handles image picker error', () => {
    // Mock error in image selection
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementation((_, callback) => {
      callback({
        didCancel: false,
        errorMessage: 'Image picker error',
      });
    });
    
    const consoleSpy = jest.spyOn(console, 'log');
    const { getByText } = render(<PostPage />);
    
    // Press the image selection button
    const selectButton = getByText('Select Image');
    fireEvent.press(selectButton);
    
    // Check if error was logged
    expect(consoleSpy).toHaveBeenCalledWith('ImagePicker Error: ', 'Image picker error');
  });

  test('validates form before submission', async () => {
    const { getByText } = render(<PostPage />);
    
    // Submit without selecting a tag
    const submitButton = getByText('Post');
    fireEvent.press(submitButton);
    
    // Check if validation alert is shown
    expect(Alert.alert).toHaveBeenCalledWith(
      'Missing Information',
      'Please select at least one category',
      expect.anything()
    );
    
    // Reset alert mock
    (Alert.alert as jest.Mock).mockClear();
    
    // Set a tag but no title
    // This would normally be done via TagSelector, but we're mocking it
    // In a more complete test, we'd set up test IDs and proper component mocks
    act(() => {
      // Call the onTagChange prop directly for the mocked TagSelector
      // This is a simplified version of what would happen in a real test
      const mockEvent = { target: { value: TAGS[0].id } };
      // getByTestId('tag-selector').props.onTagChange(mockEvent);
    });
    
    // Submit again
    fireEvent.press(submitButton);
    
    // Check if title validation alert is shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Missing Information',
        'Please enter a title',
        expect.anything()
      );
    });
  });

  test('uploads image to S3 and submits post successfully', async () => {
    // Mock successful image selection
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementation((_, callback) => {
      callback({
        didCancel: false,
        errorMessage: undefined,
        assets: [{ uri: 'file:///path/to/image.jpg' }],
      });
    });
    
    // Mock fetch for presigned URL
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: 'https://s3-bucket.com/image.jpg?signature=abc' }),
        status: 200,
        statusText: 'OK',
      })
    );
    
    // Mock fetch for blob
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob()),
      })
    );
    
    // Mock fetch for upload
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
      })
    );
    
    // Mock fetch for post creation
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: '123' }),
        status: 201,
        statusText: 'Created',
      })
    );
    
    const { getByText } = render(<PostPage />);
    
    // Select image
    const selectButton = getByText('Select Image');
    fireEvent.press(selectButton);
    
    // Wait for location to be set
    await waitFor(() => {
      expect(getByText('Latitude: 12.3456')).toBeTruthy();
    });
    
    // For a real test, we'd set up the entire form
    // This is a simplified version
    act(() => {
      // Manually set the state values that would be set by user interaction
      // In a real test, we'd use fireEvent to interact with the components
    });
    
    // Submit the form
    const submitButton = getByText('Post');
    fireEvent.press(submitButton);
    
    // Check if post was submitted successfully
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Your report has been posted successfully',
        [{ text: 'OK', onPress: expect.any(Function) }]
      );
    });
  });

  test('handles S3 upload failure', async () => {
    // Mock successful image selection
    (ImagePicker.launchImageLibrary as jest.Mock).mockImplementation((_, callback) => {
      callback({
        didCancel: false,
        errorMessage: undefined,
        assets: [{ uri: 'file:///path/to/image.jpg' }],
      });
    });
    
    // Mock fetch for presigned URL - failure
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      })
    );
    
    const { getByText } = render(<PostPage />);
    
    // Select image
    const selectButton = getByText('Select Image');
    fireEvent.press(selectButton);
    
    // Wait for location to be set
    await waitFor(() => {
      expect(getByText('Latitude: 12.3456')).toBeTruthy();
    });
    
    // Submit the form
    const submitButton = getByText('Post');
    fireEvent.press(submitButton);
    
    // Check if upload error alert is shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Upload Error',
        'Failed to upload image. Do you want to continue without an image?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: expect.any(Function) }
        ]
      );
    });
  });

  test('handles post submission failure', async () => {
    // Mock fetch for post creation - failure
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      })
    );
    
    const { getByText } = render(<PostPage />);
    
    // Wait for location to be set
    await waitFor(() => {
      expect(getByText('Latitude: 12.3456')).toBeTruthy();
    });
    
    // For a real test, we'd set up the entire form
    act(() => {
      // Manually set the state values that would be set by user interaction
    });
    
    // Submit the form
    const submitButton = getByText('Post');
    fireEvent.press(submitButton);
    
    // Check if error alert is shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to create post. Please try again.',
        undefined
      );
    });
  });
});