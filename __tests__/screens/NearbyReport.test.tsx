import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NearbyReport from '@/app/nearbyReport';
import { Alert } from 'react-native';

// Mock expo-font to avoid the error
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn().mockReturnValue(true),
  isLoading: jest.fn().mockReturnValue(false),
}));

jest.spyOn(Alert, 'alert');

describe('NearbyReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<NearbyReport />);
    expect(getByTestId('nearby-report')).toBeTruthy();
  });

  it('displays an alert when a report is clicked', () => {
    const { getByTestId } = render(<NearbyReport />);
    fireEvent.press(getByTestId('report-item-1'));
    expect(Alert.alert).toHaveBeenCalledWith('Report clicked', 'You clicked report 1');
  });

  it('filters reports based on search input', () => {
    const { getByPlaceholderText, getByTestId } = render(<NearbyReport />);
    fireEvent.changeText(getByPlaceholderText('Search reports'), 'test');
    expect(getByTestId('report-item-1')).toHaveTextContent('test');
  });

  // Add more tests to cover all functionalities and edge cases
});
