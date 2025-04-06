import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileCard from '@/components/displays/profile/ProfileCard';
import { Linking } from 'react-native';

jest.mock('react-native-vector-icons/AntDesign', () => 'AntDesign');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('react-native-vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('@expo/vector-icons/Fontisto', () => 'Fontisto');

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  openURL: jest.fn(() => Promise.resolve()),
}));

describe('ProfileCard Component', () => {
  const mockProps = {
    id: 'user123',
    username: '@mimie',
    role: 'Premium User',
    verified: true,
    profileImage: 'https://example.com/profile.jpg',
    profileBanner: 'https://example.com/banner.jpg',
    onEditPress: jest.fn(),
    onSettingsPress: jest.fn(),
    socialLinks: {
      tiktok: 'https://tiktok.com/@johndoe',
      line: 'https://line.me/ti/p/~johndoe',
      discord: 'https://discord.gg/johndoe',
      twitter: 'https://twitter.com/johndoe',
      instagram: 'https://instagram.com/johndoe',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does nothing when handleSocialLinkPress is called with undefined url', () => {
    const ref = React.createRef<any>();
    const { getByTestId } = render(
      <ProfileCard {...mockProps} ref={ref} />
    );
    
    ref.current.handleSocialLinkPress(undefined);
    
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('renders correctly with all props', () => {
    const { getByText, getByTestId } = render(<ProfileCard {...mockProps} />);
    
    expect(getByText('@mimie')).toBeTruthy();
    expect(getByText('Premium User')).toBeTruthy();
    expect(getByText('Edit Profile')).toBeTruthy();
    
    const profileImage = getByTestId('profileImage');
    expect(profileImage.props.source.uri).toBe('https://example.com/profile.jpg');
    
    const backgroundImage = getByTestId('backgroundImage');
    expect(backgroundImage.props.source.uri).toBe('https://example.com/banner.jpg');
    
    expect(getByTestId('MaterialIcons-verified')).toBeTruthy();
  });

  it('renders without verified badge when not verified', () => {
    const propsWithoutVerified = { ...mockProps, verified: false };
    const { queryByTestId } = render(<ProfileCard {...propsWithoutVerified} />);
    
    expect(queryByTestId('MaterialIcons-verified')).toBeNull();
  });

  it('calls onEditPress when edit button is pressed', () => {
    const { getByText } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByText('Edit Profile'));
    expect(mockProps.onEditPress).toHaveBeenCalled();
  });

  it('calls onSettingsPress when settings button is pressed', () => {
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('settingsButton'));
    expect(mockProps.onSettingsPress).toHaveBeenCalled();
  });

  it('renders all social media icons when links are provided', () => {
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    
    expect(getByTestId('AntDesign-instagram')).toBeTruthy();
    expect(getByTestId('AntDesign-twitter')).toBeTruthy();
    expect(getByTestId('MaterialIcons-discord')).toBeTruthy();
    expect(getByTestId('FontAwesome5-tiktok')).toBeTruthy();
    expect(getByTestId('Fontisto-line')).toBeTruthy();
  });

  it('does not render social media container when no links are provided', () => {
    const propsWithoutSocialLinks = { ...mockProps, socialLinks: undefined };
    const { queryByTestId } = render(<ProfileCard {...propsWithoutSocialLinks} />);
    
    expect(queryByTestId('socialIconsOuterContainer')).toBeNull();
  });

  it('opens social media links when icons are pressed', async () => {
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    
    fireEvent.press(getByTestId('AntDesign-instagram'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://instagram.com/johndoe');
    
    fireEvent.press(getByTestId('AntDesign-twitter'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://twitter.com/johndoe');
    
    fireEvent.press(getByTestId('MaterialIcons-discord'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://discord.gg/johndoe');
    
    fireEvent.press(getByTestId('FontAwesome5-tiktok'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://tiktok.com/@johndoe');
    
    fireEvent.press(getByTestId('Fontisto-line'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://line.me/ti/p/~johndoe');
  });

  it('handles errors when opening URLs fails', async () => {
    (Linking.canOpenURL as jest.Mock).mockImplementationOnce(() => Promise.resolve(false));
    const consoleSpy = jest.spyOn(console, 'log');
    
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('AntDesign-instagram'));
    
    await Promise.resolve();
    
    expect(consoleSpy).toHaveBeenCalledWith("Don't know how to open URI: https://instagram.com/johndoe");
    consoleSpy.mockRestore();
  });

  it('renders the SVG icons with correct props', () => {
    const { getAllByTestId } = render(<ProfileCard {...mockProps} />);
    const svgIcons = getAllByTestId('svg-xml');
    
    // Settings icon
    expect(svgIcons[0].props.width).toBe(36);
    expect(svgIcons[0].props.height).toBe(36);
    expect(svgIcons[0].props.fill).toBe('#d0c4c3');
    
    // Pencil icon
    expect(svgIcons[1].props.width).toBe(17);
    expect(svgIcons[1].props.height).toBe(17);
  });

  it('applies correct styles to elements', () => {
    const { getByText } = render(<ProfileCard {...mockProps} />);
    
    const idText = getByText('@mimie');
    expect(idText.props.style).toEqual(expect.objectContaining({
      color: '#fff',
      fontSize: 20,
      fontWeight: '800',
    }));
    
    const roleText = getByText('Premium User');
    expect(roleText.props.style).toEqual(expect.objectContaining({
      color: '#D0C4C3',
      fontSize: 16,
    }));
  });

  it('renders the white background shape', () => {
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    const backgroundShape = getByTestId('backgroundShape');
    expect(backgroundShape.props.style).toEqual(expect.objectContaining({
      backgroundColor: '#fff',
    }));
  });
});