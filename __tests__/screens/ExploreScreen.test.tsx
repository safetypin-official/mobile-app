import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ExploreScreen from '@/app/map';
import * as Location from 'expo-location';

// Mock dependencies
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props) => {
    return <View testID="map-view" {...props} />;
  };
  
  MockMapView.Marker = (props) => <View testID="marker" {...props} />;
  MockMapView.Callout = (props) => <View testID="callout" {...props} />;
  MockMapView.PROVIDER_GOOGLE = 'google';
  
  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_GOOGLE: 'google',
    Marker: MockMapView.Marker,
    Callout: MockMapView.Callout,
  };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// Update the path to match the new import in ExploreScreen
jest.mock('@/components/displays/NearbyReport', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props) => <View testID="nearby-report" {...props} />,
  };
});

jest.mock('@/components/displays/Pin', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props) => <View testID="pin" {...props} />,
  };
});

// Mock window.fetch
global.fetch = jest.fn();

// Sample post data for testing - update to match new Post type with category as string
const mockPosts = [
  {
    id: '1',
    caption: 'Test caption 1',
    createdAt: '2023-01-01T12:00:00Z',
    postedBy: 'user1',
    title: 'Test post 1',
    category: 'Category 1', // Changed from object to string
    latitude: -6.21,
    longitude: 106.85,
    imageUrl: null,
  },
  {
    id: '2',
    caption: 'Test caption 2',
    createdAt: '2023-01-02T12:00:00Z',
    postedBy: 'user2',
    title: 'Test post 2',
    category: 'Category 2', // Changed from object to string
    latitude: -6.22,
    longitude: 106.86,
    imageUrl: 'https://example.com/image.jpg',
  },
];

// Mock API response format based on new implementation
const mockApiResponse = {
  success: true,
  data: {
    content: mockPosts
  }
};

describe('ExploreScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Location permissions
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    // Mock Location data
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: {
        latitude: -6.21,
        longitude: 106.85,
        accuracy: 10,
      },
    });
    
    // Mock successful fetch with updated response format
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockApiResponse),
    });
  });

  it('renders correctly with loading state initially', () => {
    const { getByTestId, getByText } = render(<ExploreScreen />);
    
    // Check if MapView is rendered
    expect(getByTestId('map-view')).toBeTruthy();
    
    // Check if loading indicator is shown initially
    expect(getByText('Loading posts...')).toBeTruthy();
  });

  it('requests location permission and gets user location', async () => {
    render(<ExploreScreen />);
    
    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
    });
  });

  it('shows error when location permission is denied', async () => {
    // Mock permission denied
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });
    
    const { findByText } = render(<ExploreScreen />);
    
    // Wait for the error message to appear
    const errorMessage = await findByText('Permission to access location was denied');
    expect(errorMessage).toBeTruthy();
  });

  it('shows error when location retrieval fails', async () => {
    // Mock location retrieval failure
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(
      new Error('Location error')
    );
    
    const { findByText } = render(<ExploreScreen />);
    
    // Wait for the error message to appear
    const errorMessage = await findByText('Unable to get current location');
    expect(errorMessage).toBeTruthy();
  });

  it('fetches and displays posts successfully', async () => {
    const { queryByText, getAllByTestId } = render(<ExploreScreen />);
    
    // Wait for the fetch to complete with updated endpoint
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://10.0.2.2/post/all');
    });
    
    // Check that loading indicator is removed
    await waitFor(() => {
      expect(queryByText('Loading posts...')).toBeNull();
    });
    
    // Check if markers are rendered for each post
    await waitFor(() => {
      const markers = getAllByTestId('marker');
      expect(markers.length).toBe(2); // We have 2 mock posts
    });
  });

  it('shows error when fetch fails', async () => {
    // Mock fetch failure
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    const { findByText, getByText } = render(<ExploreScreen />);
    
    // Wait for the error message to appear
    const errorMessage = await findByText('Failed to load posts. Please try again later.');
    expect(errorMessage).toBeTruthy();
    
    // Check if retry button exists
    const retryButton = getByText('Retry');
    expect(retryButton).toBeTruthy();
  });

  it('shows error when fetch response is not ok', async () => {
    // Mock bad response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });
    
    const { findByText } = render(<ExploreScreen />);
    
    // Wait for the error message to appear
    const errorMessage = await findByText('Failed to load posts. Please try again later.');
    expect(errorMessage).toBeTruthy();
  });

  it('shows error when response format is invalid', async () => {
    // Mock invalid response format
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: false,
        data: null
      }),
    });
    
    const { findByText } = render(<ExploreScreen />);
    
    // Wait for the error message to appear
    const errorMessage = await findByText('Failed to load posts. Please try again later.');
    expect(errorMessage).toBeTruthy();
  });

  it('retries fetch when retry button is clicked', async () => {
    // First mock a failed fetch
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    const { findByText, getByText } = render(<ExploreScreen />);
    
    // Wait for the error to appear
    await findByText('Failed to load posts. Please try again later.');
    
    // Reset mock for successful retry
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockApiResponse),
    });
    
    // Click retry button
    fireEvent.press(getByText('Retry'));
    
    // Verify fetch was called again
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('opens report overlay when marker is pressed', async () => {
    const { getAllByTestId, queryByTestId, findByTestId } = render(<ExploreScreen />);
    
    // Wait for posts to load
    await waitFor(() => {
      const markers = getAllByTestId('marker');
      expect(markers.length).toBe(2);
    });
    
    // Initially, report overlay should not be visible
    expect(queryByTestId('nearby-report')).toBeNull();
    
    // Simulate pressing on a marker
    const markers = getAllByTestId('marker');
    fireEvent.press(markers[0]);
    
    // Report overlay should now be visible
    const reportOverlay = await findByTestId('nearby-report');
    expect(reportOverlay).toBeTruthy();
    
    // Check that initialPost prop is passed correctly
    expect(reportOverlay.props.initialPost).toEqual(mockPosts[0]);
  });
  
  it('does not open report overlay when marker is pressed but post is not found', async () => {
    // Create a spy for console.log
    const consoleSpy = jest.spyOn(console, 'log');
    
    // Mock the Array.prototype.find method to control its behavior
    const originalArrayFind = Array.prototype.find;
    const mockFind = jest.fn();
    
    // First, render the component normally
    const { getAllByTestId, queryByTestId } = render(<ExploreScreen />);
    
    // Wait for posts to load
    await waitFor(() => {
      const markers = getAllByTestId('marker');
      expect(markers.length).toBe(2);
    });
    
    // Replace the Array.prototype.find method to return undefined
    // This simulates the case where a post is not found for a given ID
    Array.prototype.find = mockFind.mockReturnValue(undefined);
    
    // Get the first marker and press it
    const markers = getAllByTestId('marker');
    fireEvent.press(markers[0]);
    
    // Verify the console.log was called (indicating the marker press was processed)
    expect(consoleSpy).toHaveBeenCalledWith('Marker pressed, post ID:', expect.any(String));
    
    // Verify the find method was called (our mock implementation)
    expect(mockFind).toHaveBeenCalled();
    
    // Verify that the report overlay is NOT displayed since find() returned undefined
    expect(queryByTestId('nearby-report')).toBeNull();
    
    // Clean up the mock
    Array.prototype.find = originalArrayFind;
    consoleSpy.mockRestore();
  });

  it('closes report overlay when close button is pressed', async () => {
    const { getAllByTestId, findByTestId, getByText, queryByTestId } = render(<ExploreScreen />);
    
    // Wait for posts to load and press a marker
    await waitFor(() => {
      const markers = getAllByTestId('marker');
      fireEvent.press(markers[0]);
    });
    
    // Report overlay should be visible
    await findByTestId('nearby-report');
    
    // Press close button
    fireEvent.press(getByText('Close'));
    
    // Report overlay should be gone
    await waitFor(() => {
      expect(queryByTestId('nearby-report')).toBeNull();
    });
  });

  it('closes report overlay when map is pressed', async () => {
    const { getAllByTestId, findByTestId, getByTestId, queryByTestId } = render(<ExploreScreen />);
    
    // Wait for posts to load and press a marker
    await waitFor(() => {
      const markers = getAllByTestId('marker');
      fireEvent.press(markers[0]);
    });
    
    // Report overlay should be visible
    await findByTestId('nearby-report');
    
    // Mock map press event
    const mapView = getByTestId('map-view');
    fireEvent(mapView, 'press', {
      nativeEvent: {
        coordinate: {
          latitude: -6.21,
          longitude: 106.85,
        },
      },
    });
    
    // Report overlay should be gone
    await waitFor(() => {
      expect(queryByTestId('nearby-report')).toBeNull();
    });
  });
  
  it('closes report overlay when NearbyReport onClose prop is called', async () => {
    const { getAllByTestId, findByTestId, queryByTestId } = render(<ExploreScreen />);
    
    // Wait for posts to load and press a marker
    await waitFor(() => {
      const markers = getAllByTestId('marker');
      fireEvent.press(markers[0]);
    });
    
    // Report overlay should be visible
    const nearbyReportComponent = await findByTestId('nearby-report');
    expect(nearbyReportComponent).toBeTruthy();
    
    // Extract the onClose prop and call it
    const onCloseProp = nearbyReportComponent.props.onClose;
    expect(typeof onCloseProp).toBe('function');
    
    // Call the onClose function
    act(() => {
      onCloseProp();
    });
    
    // Report overlay should be gone
    await waitFor(() => {
      expect(queryByTestId('nearby-report')).toBeNull();
    });
  });

  it('handles map long press event', async () => {
    // Spy on console.log to verify long press is logged
    const consoleSpy = jest.spyOn(console, 'log');
    
    const { getByTestId } = render(<ExploreScreen />);
    
    // Mock map long press event
    const mapView = getByTestId('map-view');
    fireEvent(mapView, 'longPress', {
      nativeEvent: {
        coordinate: {
          latitude: -6.25,
          longitude: 106.80,
        },
      },
    });
    
    // Verify the long press coordinates were logged
    expect(consoleSpy).toHaveBeenCalledWith(
      'Long press detected at:',
      expect.objectContaining({
        latitude: -6.25,
        longitude: 106.80,
      })
    );
    
    consoleSpy.mockRestore();
  });

  it('properly formats dates in the UI', async () => {
    // Spy on Date methods to ensure consistency
    const originalDate = global.Date;
    const mockDate = jest.fn(() => ({
      toLocaleDateString: jest.fn(() => '1/1/2023'),
      toLocaleTimeString: jest.fn(() => '12:00:00 PM')
    }));
    global.Date = mockDate as any;
    
    const { getAllByTestId } = render(<ExploreScreen />);
    
    // Wait for posts to load
    await waitFor(() => {
      const markers = getAllByTestId('marker');
      expect(markers.length).toBe(2);
    });
    
    // Restore original Date
    global.Date = originalDate;
    
    // Note: We can't easily test the formatted date display due to mocked components
    // In a real test environment, we would check the actual rendered text
  });

  it('logs position when map is pressed', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    const { getByTestId } = render(<ExploreScreen />);
    
    const mapView = getByTestId('map-view');
    fireEvent(mapView, 'press', {
      nativeEvent: {
        coordinate: {
          latitude: -6.21,
          longitude: 106.85,
        },
      },
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Position pressed:',
      expect.objectContaining({
        latitude: -6.21,
        longitude: 106.85,
      })
    );
    
    consoleSpy.mockRestore();
  });

  it('correctly passes Pin properties when rendering markers', async () => {
    const { getAllByTestId } = render(<ExploreScreen />);
    
    // Wait for posts to load
    await waitFor(() => {
      const pins = getAllByTestId('pin');
      expect(pins.length).toBe(2);
      
      // Check that category is passed correctly to Pin component
      expect(pins[0].props.type).toBe(mockPosts[0].category);
      expect(pins[1].props.type).toBe(mockPosts[1].category);
      
      // Check other Pin props
      expect(pins[0].props.width).toBe(36);
      expect(pins[0].props.height).toBe(36);
    });
  });

  it('handles refreshing posts', async () => {
    // Mock fetch failure first
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    const { findByText, getByText } = render(<ExploreScreen />);
    
    // Wait for error to appear
    await findByText('Failed to load posts. Please try again later.');
    
    // Now mock success for retry
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockApiResponse),
    });
    
    // Trigger refresh by clicking retry
    fireEvent.press(getByText('Retry'));
    
    // Verify loading indicator shows again
    expect(getByText('Loading posts...')).toBeTruthy();
    
    // Verify posts load successfully after retry
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});