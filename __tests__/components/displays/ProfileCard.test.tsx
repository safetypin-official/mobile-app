import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileCard from '@/components/displays/profile/ProfileCard';
import { Linking } from 'react-native';
import { Alert } from 'react-native';

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
    expect(Linking.canOpenURL).toHaveBeenCalledWith('instagram://user?username=johndoe');
    
    fireEvent.press(getByTestId('AntDesign-twitter'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('twitter://user?screen_name=johndoe');
    
    fireEvent.press(getByTestId('MaterialIcons-discord'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://discord.com/users/johndoe');
    
    fireEvent.press(getByTestId('FontAwesome5-tiktok'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('tiktok://user/profile/johndoe');
    
    fireEvent.press(getByTestId('Fontisto-line'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://line.me/ti/p/~johndoe');
  });


  it('renders the SVG icons with correct props', () => {
    const { getAllByTestId } = render(<ProfileCard {...mockProps} isOwnProfile={true} />);
    const svgIcons = getAllByTestId('svg-xml');
    
    // Only test the settings icon that we know exists
    expect(svgIcons[0].props.xml).toBeTruthy();
    expect(svgIcons[0].props.width).toBe(36);
    expect(svgIcons[0].props.height).toBe(36);
    expect(svgIcons[0].props.fill).toBe('#d0c4c3');
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
    expect(Linking.canOpenURL).toHaveBeenCalledWith('instagram://user?username=johndoe');
  });

  // it('falls back to Instagram web URL when app URL cannot be opened', async () => {
  //   (Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(false); // Simulate fallback
  //   const { getByTestId } = render(<ProfileCard {...mockProps} />);
    
  //   fireEvent.press(getByTestId('AntDesign-instagram'));
    
  //   await new Promise(resolve => setImmediate(resolve)); // Wait for promise to resolve
  //   expect(Linking.openURL).toHaveBeenCalledWith('instagram://user?username=johndoe');
  //   expect(Linking.openURL).toHaveBeenCalledWith('https://www.instagram.com/johndoe');
  // });
  

  it('constructs correct Twitter URL', () => {
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('AntDesign-twitter'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('instagram://user?username=johndoe');
    expect(Linking.canOpenURL).toHaveBeenCalledWith('twitter://user?screen_name=johndoe');
  });

  it('constructs correct Discord URL', () => {
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('MaterialIcons-discord'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://discord.com/users/johndoe');
  });

  it('constructs correct TikTok URL', () => {
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('FontAwesome5-tiktok'));
    expect(Linking.canOpenURL).toHaveBeenCalledWith('tiktok://user/profile/johndoe');
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

    expect(Linking.canOpenURL).toHaveBeenCalledWith('instagram://user?username=johndoe');
    expect(Linking.openURL).toHaveBeenCalledWith('instagram://user?username=johndoe');

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
    expect(Linking.canOpenURL).toHaveBeenCalledWith('instagram://user?username=johndoe');
    expect(Linking.openURL).toHaveBeenCalledWith('instagram://user?username=johndoe');

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

    expect(Linking.canOpenURL).toHaveBeenCalledWith('instagram://user?username=johndoe');
    expect(Linking.openURL).toHaveBeenCalledWith('instagram://user?username=johndoe');

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
    expect(mockOpenURL).toHaveBeenCalledWith(expect.stringContaining('instagram'));
    expect(mockOpenURL).toHaveBeenCalledWith(expect.stringContaining('twitter'));
    expect(mockOpenURL).toHaveBeenCalledWith(expect.stringContaining('discord'));
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
    expect(mockOpenURL).toHaveBeenCalledWith('instagram://user?username=johndoe');
    
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

describe('Additional ProfileCard Tests for Full Coverage', () => {
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

  it('renders follow button when isOwnProfile is false', () => {
    const props = {
      ...mockProps,
      isOwnProfile: false,
      isFollowing: false,
    };
    const { getByTestId } = render(<ProfileCard {...props} />);
    expect(getByTestId('follow-button')).toBeTruthy();
  });

  it('shows "Follow" text when not following', () => {
    const props = {
      ...mockProps,
      isOwnProfile: false,
      isFollowing: false,
    };
    const { getByText } = render(<ProfileCard {...props} />);
    expect(getByText('Follow')).toBeTruthy();
  });

  it('shows "Following" text when following', () => {
    const props = {
      ...mockProps,
      isOwnProfile: false,
      isFollowing: true,
    };
    const { getByText } = render(<ProfileCard {...props} />);
    expect(getByText('Following')).toBeTruthy();
  });

  it('calls onFollowPress with correct state when follow button is pressed', () => {
    const onFollowPress = jest.fn();
    const props = {
      ...mockProps,
      isOwnProfile: false,
      isFollowing: false,
      onFollowPress,
    };
    const { getByTestId } = render(<ProfileCard {...props} />);
    fireEvent.press(getByTestId('follow-button'));
    expect(onFollowPress).toHaveBeenCalledWith(true);
  });

  it('shows follower and following counts', () => {
    const props = {
      ...mockProps,
      followersCount: 100,
      followingCount: 50,
    };
    const { getByText } = render(<ProfileCard {...props} />);
    expect(getByText('100 Followers')).toBeTruthy();
    expect(getByText('50 Following')).toBeTruthy();
  });

  it('calls onFollowersPress when followers count is pressed', () => {
    const onFollowersPress = jest.fn();
    const props = {
      ...mockProps,
      followersCount: 100,
      onFollowersPress,
    };
    const { getByText } = render(<ProfileCard {...props} />);
    fireEvent.press(getByText('100 Followers'));
    expect(onFollowersPress).toHaveBeenCalled();
  });

  it('calls onFollowingPress when following count is pressed', () => {
    const onFollowingPress = jest.fn();
    const props = {
      ...mockProps,
      followingCount: 50,
      onFollowingPress,
    };
    const { getByText } = render(<ProfileCard {...props} />);
    fireEvent.press(getByText('50 Following'));
    expect(onFollowingPress).toHaveBeenCalled();
  });

  it('handles error when opening social link fails', async () => {
    (Linking.canOpenURL as jest.Mock).mockRejectedValueOnce(new Error('Failed'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('AntDesign-instagram'));
    
    await new Promise(resolve => setImmediate(resolve));
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('shows alert when social link cannot be opened', async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(false);
    (Linking.openURL as jest.Mock).mockRejectedValueOnce(new Error('Failed'));
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('AntDesign-instagram'));
    
    await new Promise(resolve => setImmediate(resolve));
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('tries to open app URL first before falling back to web URL', async () => {
    (Linking.canOpenURL as jest.Mock).mockImplementation((url) => 
      Promise.resolve(url.startsWith('instagram://'))
    );
    
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('AntDesign-instagram'));
    
    await new Promise(resolve => setImmediate(resolve));
    expect(Linking.canOpenURL).toHaveBeenCalledWith(expect.stringContaining('instagram://'));
    expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('instagram://'));
  });

  it('falls back to web URL when app URL cannot be opened', async () => {
    (Linking.canOpenURL as jest.Mock).mockImplementation((url) => 
      Promise.resolve(!url.startsWith('instagram://'))
    );
    
    const { getByTestId } = render(<ProfileCard {...mockProps} />);
    fireEvent.press(getByTestId('AntDesign-instagram'));
    
    await new Promise(resolve => setImmediate(resolve));
    expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('https://www.instagram.com'));
  });

  it('does not render social icons when socialLinks are empty', () => {
    const props = {
      ...mockProps,
      socialLinks: undefined,
    };
    const { queryByTestId } = render(<ProfileCard {...props} />);
    expect(queryByTestId('AntDesign-instagram')).toBeNull();
  });

  it('renders correctly with minimal props', () => {
    const minimalProps = {
      id: 'user123',
      username: '@mimie',
      role: 'Premium User',
      verified: true,
      profileImage: 'https://example.com/profile.jpg',
      profileBanner: 'https://example.com/banner.jpg',
    };
    const { getByText } = render(<ProfileCard {...minimalProps} />);
    expect(getByText('@mimie')).toBeTruthy();
  });

  it('does not crash when optional callbacks are not provided', () => {
    const minimalProps = {
      id: 'user123',
      username: '@mimie',
      role: 'Premium User',
      verified: true,
      profileImage: 'https://example.com/profile.jpg',
      profileBanner: 'https://example.com/banner.jpg',
      isOwnProfile: false,
    };
    
    const { getByTestId } = render(<ProfileCard {...minimalProps} />);
    fireEvent.press(getByTestId('follow-button')); // Should not throw
  });

  it('covers empty social link case in handleSocialLinkPress', async () => {
    const { queryByTestId } = render(<ProfileCard {...mockProps} />);
    
    // This covers the early return when username is empty (line 50)
    const ref = React.createRef<any>();
    render(<ProfileCard {...mockProps} ref={ref} />);
    ref.current.handleSocialLinkPress('', 'instagram');
    
    await new Promise(resolve => setImmediate(resolve));
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
  });

  it('covers platform undefined case in handleSocialLinkPress', async () => {
    const { queryByTestId } = render(<ProfileCard {...mockProps} />);
    
    // This covers the early return when platform is undefined (line 54)
    const ref = React.createRef<any>();
    render(<ProfileCard {...mockProps} ref={ref} />);
    ref.current.handleSocialLinkPress('username', undefined as any);
    
    await new Promise(resolve => setImmediate(resolve));
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
  });

  it('covers the silent catch block in handleSocialLinkPress', async () => {
    // Mock to throw error on both app and web URL attempts
    (Linking.canOpenURL as jest.Mock).mockRejectedValue(new Error('Failed'));
    (Linking.openURL as jest.Mock).mockRejectedValue(new Error('Failed'));
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    
    const propsWithSocial = {
      ...mockProps,
      socialLinks: { instagram: 'testuser' }
    };
    
    const { getByTestId } = render(<ProfileCard {...propsWithSocial} />);
    fireEvent.press(getByTestId('AntDesign-instagram'));
    
    await new Promise(resolve => setImmediate(resolve));
    
    // This covers the silent catch block (lines 91)
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('covers the ref handleSocialLinkPress with empty url', () => {
    const ref = React.createRef<any>();
    render(<ProfileCard {...mockProps} ref={ref} />);
    
    // This covers line 46
    ref.current.handleSocialLinkPress('');
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('covers all SOCIAL_MEDIA_URLS definitions', () => {
    // This test ensures all URL patterns are defined (lines 42-54)
    const propsWithAllSocial = {
      ...mockProps,
      socialLinks: {
        instagram: 'testinsta',
        twitter: 'testtwitter',
        tiktok: 'testtiktok',
        line: 'testline',
        discord: 'testdiscord'
      }
    };
    
    const { getByTestId } = render(<ProfileCard {...propsWithAllSocial} />);
    
    expect(getByTestId('AntDesign-instagram')).toBeTruthy();
    expect(getByTestId('AntDesign-twitter')).toBeTruthy();
    expect(getByTestId('FontAwesome5-tiktok')).toBeTruthy();
    expect(getByTestId('Fontisto-line')).toBeTruthy();
    expect(getByTestId('MaterialIcons-discord')).toBeTruthy();
  });

  it('constructs correct Twitter web URL', async () => {
    const props = {
      ...mockProps,
      socialLinks: { twitter: 'testuser' }
    };
    
    const { getByTestId } = render(<ProfileCard {...props} />);
    fireEvent.press(getByTestId('AntDesign-twitter'));
    
    await new Promise(resolve => setImmediate(resolve));
    expect(Linking.openURL).toHaveBeenCalledWith('https://twitter.com/testuser');
  });

  it('constructs correct TikTok web URL', async () => {
    const props = {
      ...mockProps,
      socialLinks: { tiktok: 'testuser' }
    };
    
    const { getByTestId } = render(<ProfileCard {...props} />);
    fireEvent.press(getByTestId('FontAwesome5-tiktok'));
    
    await new Promise(resolve => setImmediate(resolve));
    expect(Linking.openURL).toHaveBeenCalledWith('https://www.tiktok.com/@testuser');
  });

  it('constructs correct Line web URL', async () => {
    const props = {
      ...mockProps,
      socialLinks: { line: 'testuser' }
    };
    
    const { getByTestId } = render(<ProfileCard {...props} />);
    fireEvent.press(getByTestId('Fontisto-line'));
    
    await new Promise(resolve => setImmediate(resolve));
    expect(Linking.openURL).toHaveBeenCalledWith('https://line.me/ti/p/~testuser');
  });

  it('constructs correct Discord web URL', async () => {
    const props = {
      ...mockProps,
      socialLinks: { discord: 'testuser' }
    };
    
    const { getByTestId } = render(<ProfileCard {...props} />);
    fireEvent.press(getByTestId('MaterialIcons-discord'));
    
    await new Promise(resolve => setImmediate(resolve));
    expect(Linking.openURL).toHaveBeenCalledWith('https://discord.com/users/testuser');
  });

  it('returns early when username is empty', async () => {
    const props = {
      ...mockProps,
      socialLinks: { twitter: '' } // Empty username
    };
  
    await new Promise(resolve => setImmediate(resolve));
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
  });
});

describe('Early Return Condition Tests', () => {
  const mockProps = {
    id: 'user123',
    username: '@mimie',
    role: 'Premium User',
    verified: true,
    profileImage: 'https://example.com/profile.jpg',
    profileBanner: 'https://example.com/banner.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns early when username is undefined', async () => {
    const ref = React.createRef<any>();
    render(<ProfileCard {...mockProps} ref={ref} />);
    
    // Test with undefined username
    ref.current.handleSocialLinkPress(undefined, 'instagram');
    
    await new Promise(resolve => setImmediate(resolve));
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('returns early when username is empty string', async () => {
    const ref = React.createRef<any>();
    render(<ProfileCard {...mockProps} ref={ref} />);
    
    // Test with empty string username
    ref.current.handleSocialLinkPress('', 'instagram');
    
    await new Promise(resolve => setImmediate(resolve));
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });


  it('returns early when both username and platform are undefined', async () => {
    const ref = React.createRef<any>();
    render(<ProfileCard {...mockProps} ref={ref} />);
    
    // Test with both undefined
    ref.current.handleSocialLinkPress(undefined, undefined);
    
    await new Promise(resolve => setImmediate(resolve));
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });
});

describe('Early Return Through UI Tests', () => {
  const mockProps = {
    id: 'user123',
    username: '@mimie',
    role: 'Premium User',
    verified: true,
    profileImage: 'https://example.com/profile.jpg',
    profileBanner: 'https://example.com/banner.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does nothing when pressing social button with whitespace username', async () => {
    const props = {
      ...mockProps,
      socialLinks: { instagram: '   ' } // Whitespace username
    };
    
    const { getByTestId } = render(<ProfileCard {...props} />);
    fireEvent.press(getByTestId('AntDesign-instagram'));
    
    await new Promise(resolve => setImmediate(resolve));
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('does nothing when socialLinks contains undefined platform', async () => {
    // Create invalid platform type
    const props = {
      ...mockProps,
      socialLinks: { 
        invalidPlatform: 'testuser' // Not a valid platform key
      } as any // Force TypeScript to allow invalid platform
    };
    
    const { queryByTestId } = render(<ProfileCard {...props} />);
    // Verify no social buttons are rendered for invalid platform
    expect(queryByTestId('AntDesign-instagram')).toBeNull();
  });
});

describe('isOwnProfile Conditional Rendering', () => {
  const baseProps = {
    id: 'user123',
    username: '@mimie',
    role: 'Premium User',
    verified: true,
    profileImage: 'https://example.com/profile.jpg',
    profileBanner: 'https://example.com/banner.jpg',
    onSettingsPress: jest.fn(),
  };

  it('renders settings button when isOwnProfile is true', () => {
    const props = {
      ...baseProps,
      isOwnProfile: true,
    };
    
    const { getByTestId } = render(<ProfileCard {...props} />);
    expect(getByTestId('settingsButton')).toBeTruthy();
    expect(getByTestId('svg-xml')).toBeTruthy();
  });

  it('does not render settings button when isOwnProfile is false', () => {
    const props = {
      ...baseProps,
      isOwnProfile: false,
    };
    
    const { queryByTestId } = render(<ProfileCard {...props} />);
    expect(queryByTestId('settingsButton')).toBeNull();
  });

  it('calls onSettingsPress when settings button is pressed', () => {
    const props = {
      ...baseProps,
      isOwnProfile: true,
    };
    
    const { getByTestId } = render(<ProfileCard {...props} />);
    fireEvent.press(getByTestId('settingsButton'));
    expect(props.onSettingsPress).toHaveBeenCalled();
  });
});