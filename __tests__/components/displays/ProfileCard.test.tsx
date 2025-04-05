import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileCard from '@/components/displays/profile/ProfileCard';

const mockEditPress = jest.fn();
const mockSettingsPress = jest.fn();

const defaultProps = {
  name: 'John Doe',
  username: 'johndoe',
  profileImage: 'https://example.com/profile.jpg',
  profileBanner: 'https://example.com/banner.jpg',
  onEditPress: mockEditPress,
  onSettingsPress: mockSettingsPress,
};

describe('ProfileCard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /** ------------------ Happy Path Tests ------------------ **/

  it('renders correctly with given props', () => {
    const { getByText, getByTestId } = render(
      <ProfileCard {...defaultProps} />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('@johndoe')).toBeTruthy();
    expect(getByText('Edit Profile')).toBeTruthy();

    expect(getByTestId('profileImage')).toBeTruthy();
    expect(getByTestId('backgroundImage')).toBeTruthy();
  });

  it('calls onEditPress when Edit Profile button is pressed', () => {
    const { getByText } = render(<ProfileCard {...defaultProps} />);
    fireEvent.press(getByText('Edit Profile'));
    expect(mockEditPress).toHaveBeenCalledTimes(1);
  });

  it('calls onSettingsPress when settings icon is pressed', () => {
    const { getByTestId } = render(<ProfileCard {...defaultProps} />);
    fireEvent.press(getByTestId('settingsButton'));
    expect(mockSettingsPress).toHaveBeenCalledTimes(1);
  });

  /** ------------------ Unhappy Path Tests ------------------ **/

  it('renders without crashing even if profileImage or banner URLs are empty', () => {
    const { getByTestId } = render(
      <ProfileCard
        {...defaultProps}
        profileImage=""
        profileBanner=""
      />
    );

    expect(getByTestId('profileImage')).toBeTruthy();
    expect(getByTestId('backgroundImage')).toBeTruthy();
  });

  it('does not crash if onEditPress or onSettingsPress is not passed', () => {
    const { getByText, getByTestId } = render(
      <ProfileCard
        {...defaultProps}
        onEditPress={undefined as unknown as () => void}
        onSettingsPress={undefined as unknown as () => void}
      />
    );

    fireEvent.press(getByText('Edit Profile'));
    fireEvent.press(getByTestId('settingsButton'));

    expect(true).toBeTruthy();
  });

  it('renders with empty name and username gracefully', () => {
    const { getByText } = render(
      <ProfileCard
        {...defaultProps}
        name=""
        username=""
      />
    );

    expect(getByText('@')).toBeTruthy();
  });
});
