import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import MapScreen from '@/app/map/index';
import * as Location from 'expo-location';

// Mock Location API
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true, // Required for default exports in Jest
    default: (props: React.JSX.IntrinsicAttributes) => <View {...props} testID="map-view" />, // Returns a valid React component
  };
});

describe('MapScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when location is granted', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    });

    const { getByTestId } = render(<MapScreen />);

    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
  });

  it('handles denied location permission', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { queryByTestId } = render(<MapScreen />);

    await waitFor(() => {
      expect(queryByTestId('map-view')).toBeNull();
    });
  });

  it('renders the map when location is available', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 40.7128, longitude: -74.006 },
    });

    const { getByTestId } = render(<MapScreen />);

    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
  });
});
