import React from 'react';
import { render } from '@testing-library/react-native';
import PostScreen from '@/app/post/[id]'; // Update with correct path
import * as ExpoRouter from 'expo-router';
import NearbyReport from '@/components/displays/NearbyReport';

// Mock the expo-router module
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  Stack: {
    Screen: jest.fn().mockReturnValue(null),
  },
}));

// Mock the NearbyReport component
jest.mock('@/components/displays/NearbyReport', () => jest.fn().mockReturnValue(null));

describe('PostScreen', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementation for useLocalSearchParams
    jest.mocked(ExpoRouter.useLocalSearchParams).mockReturnValue({ id: 'test-post-id' });
  });

  it('renders the Stack.Screen with correct options', () => {
    render(<PostScreen />);
    
    // Check that Stack.Screen was called with the correct props
    expect(jest.mocked(ExpoRouter.Stack.Screen)).toHaveBeenCalledWith(
      expect.objectContaining({
        options: {
          title: 'Post Details',
          headerTitleAlign: 'center'
        }
      }),
      {}
    );
  });

  it('passes the correct postId to NearbyReport component', () => {
    const mockPostId = 'mock-post-id-123';
    jest.mocked(ExpoRouter.useLocalSearchParams).mockReturnValue({ id: mockPostId });
    
    render(<PostScreen />);
    
    // Check that NearbyReport was called with the correct props
    expect(NearbyReport).toHaveBeenCalledWith(
      { postId: mockPostId },
      expect.anything()
    );
  });

  it('handles case when id is not provided', () => {
    // Mock the router params to return empty object
    jest.mocked(ExpoRouter.useLocalSearchParams).mockReturnValue({});
    
    render(<PostScreen />);
    
    // Should still render but with undefined postId
    expect(NearbyReport).toHaveBeenCalledWith(
      { postId: undefined },
      expect.anything()
    );
  });

  it('renders the NearbyReport component', () => {
    render(<PostScreen />);
    
    // Check that NearbyReport is called
    expect(NearbyReport).toHaveBeenCalled();
  });
});