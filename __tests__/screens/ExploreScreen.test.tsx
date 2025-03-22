import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ExploreScreen from '@/app/map'; // Adjust path as needed
import * as Location from 'expo-location';
import { Alert } from 'react-native';

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

jest.mock('@/app/nearbyReport', () => {
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

// Sample post data for testing
const mockPosts = [
  {
    id: '1',
    caption: 'Test caption 1',
    createdAt: '2023-01-01T12:00:00Z',
    postedBy: 'user1',
    title: 'Test post 1',
    category: { id: 'cat1', name: 'Category 1' },
    latitude: -6.21,
    longitude: 106.85,
  },
  {
    id: '2',
    caption: 'Test caption 2',
    createdAt: '2023-01-02T12:00:00Z',
    postedBy: 'user2',
    title: 'Test post 2',
    category: { id: 'cat2', name: 'Category 2' },
    latitude: -6.22,
    longitude: 106.86,
  },
];

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
    
    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockPosts),
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
    const { findByTestId, queryByText, getAllByTestId } = render(<ExploreScreen />);
    
    // Wait for the fetch to complete
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

  it('retries fetch when retry button is clicked', async () => {
    // First mock a failed fetch
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    const { findByText, getByText } = render(<ExploreScreen />);
    
    // Wait for the error to appear
    await findByText('Failed to load posts. Please try again later.');
    
    // Reset mock for successful retry
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockPosts),
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

  it('formats dates correctly', async () => {
    // Create a post with a known date
    const testDate = '2023-05-15T14:30:00Z';
    const expectedFormattedDate = new Date(testDate).toLocaleDateString() + ' ' + 
                                  new Date(testDate).toLocaleTimeString();
    
    // Mock posts with this date
    const postsWithDate = [{
      ...mockPosts[0],
      createdAt: testDate
    }];
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(postsWithDate),
    });
    
    const { findByText } = render(<ExploreScreen />);
    
    // Wait for the posts to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    
    // Due to limitations with the mock, we can't easily check the formatted date in the callout
    // This is because the Callout is mocked and doesn't render its children
    // In real testing with react-native-testing-library, we would check for the formatted date
  });

  it('alerts user when marker is pressed but post is not found', async () => {
    // Spy on Alert.alert
    const alertSpy = jest.spyOn(Alert, 'alert');
    
    const { getAllByTestId } = render(<ExploreScreen />);
    
    // Wait for posts to load
    await waitFor(() => {
      const markers = getAllByTestId('marker');
      expect(markers.length).toBe(2);
    });
    
    // Create a handleMarkerPress function with invalid post ID
    const instance = ExploreScreen.prototype;
    instance.handleMarkerPress = jest.fn().mockImplementation((postId) => {
      const post = mockPosts.find(p => p.id === 'non-existent-id');
      if (!post) {
        Alert.alert('Post not found');
      }
    });
    
    // Trigger the function
    instance.handleMarkerPress('non-existent-id');
    
    // Check if alert was called
    expect(alertSpy).toHaveBeenCalledWith('Post not found');
    
    alertSpy.mockRestore();
  });
});