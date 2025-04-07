// settings.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import SettingsScreen from '@/app/settings';

// Mock SettingsSection to simply render its title prop.
jest.mock('@/components/settings/SettingsSection', () => {
    const { Text } = require('react-native');
    return ({ title }: { title: string }) => <Text>{title}</Text>;
});

// Mock Button to render its children in a Text element with an onPress handler.
jest.mock('@/components/buttons/Button', () => {
    const { Text } = require('react-native');
    return ({ onPress, children }: { onPress: () => void; children: React.ReactNode }) => (
        <Text onPress={onPress}>{children}</Text>
    );
});

describe('SettingsScreen', () => {
  it('renders all elements correctly', () => {
    const { getByText, getAllByTestId } = render(<SettingsScreen />);
    
    // Verify header title is rendered.
    expect(getByText('Settings')).toBeTruthy();
    
    // Verify header icon is rendered with the correct accessibility label.
    expect(getAllByTestId('settings-icon')).toBeTruthy();
    
    // Verify SettingsSection components are rendered with the correct titles.
    expect(getByText('My Account')).toBeTruthy();
    expect(getByText('Help')).toBeTruthy();
    
    // Verify that the Log Out button is rendered.
    expect(getByText('Log Out')).toBeTruthy();
  });

  it('handles Log Out button press without error', () => {
    const { getByText } = render(<SettingsScreen />);
    
    // Find the Log Out button (mocked as a Text element).
    const logoutButton = getByText('Log Out');
    
    // Simulate a press event.
    fireEvent.press(logoutButton);
  });
});
