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
      tiktok: 'johndoe',
      line: 'johndoe',
      discord: 'johndoe',
      twitter: 'johndoe',
      instagram: 'johndoe',
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

  it('opens correct social media URLs when icons are pressed', async () => {
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    
    fireEvent.press(getByTestId('AntDesign-instagram'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://www.instagram.com/johndoe');
    
    fireEvent.press(getByTestId('AntDesign-twitter'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://twitter.com/johndoe');
    
    fireEvent.press(getByTestId('MaterialIcons-discord'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://discord.com/users/johndoe');
    
    fireEvent.press(getByTestId('FontAwesome5-tiktok'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://www.tiktok.com/@johndoe');
    
    fireEvent.press(getByTestId('Fontisto-line'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://line.me/ti/p/~johndoe');
  });

  it('handles errors when opening URLs fails', async () => {
    (Linking.canOpenURL as jest.Mock).mockImplementationOnce(() => Promise.resolve(false));
    const consoleSpy = jest.spyOn(console, 'log');
    
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('AntDesign-instagram'));
    
    await Promise.resolve();
    
    expect(consoleSpy).toHaveBeenCalledWith("Don't know how to open URI: https://www.instagram.com/johndoe");
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

describe('Social Link Construction', () => {
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
      tiktok: 'johndoe',
      line: 'johndoe',
      discord: 'johndoe',
      twitter: 'johndoe',
      instagram: 'johndoe',
    },
  };

  it('constructs correct Instagram URL', () => {
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('AntDesign-instagram'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://www.instagram.com/johndoe');
  });

  it('constructs correct Twitter URL', () => {
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('AntDesign-twitter'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://twitter.com/johndoe');
  });

  it('constructs correct Discord URL', () => {
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('MaterialIcons-discord'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://discord.com/users/johndoe');
  });

  it('constructs correct TikTok URL', () => {
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('FontAwesome5-tiktok'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://www.tiktok.com/@johndoe');
  });

  it('constructs correct Line URL', () => {
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('Fontisto-line'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://line.me/ti/p/~johndoe');
  });

  it('calls Linking.openURL when URL can be opened', async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(true);
    
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('AntDesign-instagram'));
    
    await Promise.resolve(); // Wait for the promise to resolve
    
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://www.instagram.com/johndoe');
    expect(Linking.openURL).toHaveBeenCalledWith('https://www.instagram.com/johndoe');
  });

  it('successfully opens URL when canOpenURL returns true', async () => {
    // Mock canOpenURL to return true
    (Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(true);
    
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    
    // Trigger the social link press
    fireEvent.press(getByTestId('AntDesign-instagram'));
    
    // Wait for promises to resolve
    await new Promise(resolve => setImmediate(resolve));
    
    // Verify both canOpenURL and openURL were called
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://www.instagram.com/johndoe');
    expect(Linking.openURL).toHaveBeenCalledWith('https://www.instagram.com/johndoe');
  });

  it('should call Linking.openURL when URL is supported', async () => {
    // Mock the Promise resolution chain properly
    (Linking.canOpenURL as jest.Mock).mockImplementationOnce(() => Promise.resolve(true));
    (Linking.openURL as jest.Mock).mockImplementationOnce(() => Promise.resolve());
  
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    
    fireEvent.press(getByTestId('AntDesign-instagram'));
  
    // Wait for all promises to resolve
    await new Promise(process.nextTick);
  
    // Verify the flow
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://www.instagram.com/johndoe');
    expect(Linking.openURL).toHaveBeenCalledWith('https://www.instagram.com/johndoe');
  });

  it('should cover the Linking.openURL call (line 73)', async () => {
    // Setup mocks
    const mockCanOpenURL = Linking.canOpenURL as jest.Mock;
    const mockOpenURL = Linking.openURL as jest.Mock;
    
    mockCanOpenURL.mockResolvedValue(true);
    mockOpenURL.mockResolvedValue(undefined);
  
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    
    // Trigger the press
    fireEvent.press(getByTestId('AntDesign-instagram'));
  
    // Wait for next event loop iteration
    await new Promise(resolve => setImmediate(resolve));
  
    // Verify
    expect(mockCanOpenURL).toHaveBeenCalled();
    expect(mockOpenURL).toHaveBeenCalledWith(expect.stringContaining('instagram.com'));
  });

  it('should directly test the Linking.openURL call on line 73', async () => {
    // Clear all mock calls before starting this test
    jest.clearAllMocks();
    
    // Setup fresh mocks for this test
    const mockCanOpenURL = Linking.canOpenURL as jest.Mock;
    const mockOpenURL = Linking.openURL as jest.Mock;
    
    // Mock canOpenURL to resolve to true
    mockCanOpenURL.mockResolvedValue(true);
    
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    
    // Trigger the Instagram button press
    fireEvent.press(getByTestId('AntDesign-instagram'));
    
    // Wait for all promises to resolve
    await new Promise(resolve => setImmediate(resolve));
    
    // Verify the exact call we want to cover
    expect(mockOpenURL).toHaveBeenCalledWith('https://www.instagram.com/johndoe');
    
    // Verify call counts - these should now be accurate
    expect(mockCanOpenURL).toHaveBeenCalledTimes(1);
    expect(mockOpenURL).toHaveBeenCalledTimes(1);
  });

  describe('Imperative Handle', () => {
    it('should call Linking.openURL when handleSocialLinkPress is called via ref with a URL', async () => {
      const mockOpenURL = jest.spyOn(Linking, 'openURL');
      const ref = React.createRef<{handleSocialLinkPress: (url?: string) => void}>();
      
      render(<ProfileCard {...mockProps} ref={ref} />);
      
      const testUrl = 'https://test.com';
      ref.current?.handleSocialLinkPress(testUrl);
      
      await new Promise(resolve => setImmediate(resolve)); // Wait for promise
      
      expect(mockOpenURL).toHaveBeenCalledWith(testUrl);
      mockOpenURL.mockRestore();
    });
  
    it('should do nothing when handleSocialLinkPress is called via ref without URL', () => {
      const mockOpenURL = jest.spyOn(Linking, 'openURL');
      const ref = React.createRef<{handleSocialLinkPress: (url?: string) => void}>();
      
      render(<ProfileCard {...mockProps} ref={ref} />);
      
      ref.current?.handleSocialLinkPress();
      
      expect(mockOpenURL).not.toHaveBeenCalled();
      mockOpenURL.mockRestore();
    });
  });
});

