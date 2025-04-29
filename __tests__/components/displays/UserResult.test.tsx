import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import UserResult from '@/components/displays/UserResult';

describe('UserResult', () => {
  const mockProps = {
    id: 'user-1',
    avatarUri: 'https://example.com/avatar.png',
    username: 'John Doe',
    handle: '@johndoe',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and matches snapshot', () => {
    const { toJSON } = render(<UserResult {...mockProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays username and handle', () => {
    const { getByText } = render(<UserResult {...mockProps} />);
    expect(getByText(mockProps.username)).toBeTruthy();
    expect(getByText(mockProps.handle)).toBeTruthy();
  });

  it('displays avatar image with correct source and style', () => {
    const { getByTestId } = render(<UserResult {...mockProps} />);
    const image = getByTestId('user-avatar');
    expect(image.props.source.uri).toBe(mockProps.avatarUri);
    expect(image.props.style).toEqual(
      expect.objectContaining({ width: 24, height: 24, borderRadius: 22 })
    );
  });

  it('renders horizontal line view with correct props', () => {
    const { getByTestId } = render(<UserResult {...mockProps} />);
    const horizontalLine = getByTestId("horizontal-line");
    const lineStyle = StyleSheet.flatten(horizontalLine.props.style);
    expect(lineStyle.borderBottomWidth).toBe(StyleSheet.hairlineWidth);
    expect(lineStyle.borderBottomColor).toBe('#d3d3d3');
    expect(horizontalLine.type).toBe("View");
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(<UserResult {...mockProps} />);
    const touchable = getByTestId('user-result');
    fireEvent.press(touchable);
    expect(mockProps.onPress).toHaveBeenCalledTimes(1);
  });
});
