// SettingsItem.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsItem, { SettingsItemProps } from '@/components/settings/SettingsItem';

describe('SettingsItem', () => {
  const onPressMock = jest.fn();
  const props: SettingsItemProps = {
    title: 'Test Title',
    onPress: onPressMock,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with provided title', () => {
    const { getByText } = render(<SettingsItem {...props} />);
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('calls onPress when button is pressed', () => {
    const { getByRole } = render(<SettingsItem {...props} />);
    const button = getByRole('button');
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders Image with correct source uri and accessibilityLabel', () => {
    const { getByLabelText } = render(<SettingsItem {...props} />);
    const image = getByLabelText('Arrow icon');
    expect(image.props.source.uri).toBe(
      'https://cdn.builder.io/api/v1/image/assets/TEMP/4e94a9cc5bc0a464551df601c9f55f59461fe597?apiKey=3d252c2866cb40ed8f1b49e6bfb91bab&'
    );
  });
});
