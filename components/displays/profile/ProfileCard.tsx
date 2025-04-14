import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, Linking } from 'react-native';
import { SvgXml } from "react-native-svg";
import { settings, pencil } from '@/assets/icons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';

interface ProfileCardProps {
  id: string;
  username: string;
  role: string;
  verified: boolean;
  profileImage: string;
  profileBanner: string;
  onEditPress: () => void;
  onSettingsPress: () => void;
  socialLinks?: {
    tiktok?: string;
    line?: string;
    discord?: string;
    twitter?: string;
    instagram?: string;
  };
}

const SOCIAL_MEDIA_BASE_URLS = {
  instagram: 'https://www.instagram.com/',
  twitter: 'https://twitter.com/',
  discord: 'https://discord.com/users/',
  tiktok: 'https://www.tiktok.com/@',
  line: 'https://line.me/ti/p/~'
};

const ProfileCard = React.forwardRef<{handleSocialLinkPress: (url?: string) => void}, ProfileCardProps>(
  (props, ref) => {
    const { 
      username,
      role,
      verified,
      profileImage,
      profileBanner,
      onEditPress,
      onSettingsPress,
      socialLinks = {},
    } = props;

    const constructSocialLink = (platform: keyof typeof SOCIAL_MEDIA_BASE_URLS, username: string): string => {
      const baseUrl = SOCIAL_MEDIA_BASE_URLS[platform];
      return `${baseUrl}${username}`;
    };

    const handleSocialLinkPress = async (username?: string, platform?: keyof typeof SOCIAL_MEDIA_BASE_URLS) => {
      if (!username?.trim() || !platform) {
        return;
      }
    
      try {
        const url = constructSocialLink(platform, username.trim());
        
        if (!isValidUrl(url)) {
          console.warn(`Invalid URL constructed: ${url}`);
          return;
        }
    
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          console.warn(`Cannot open URL: ${url}`);
        }
      } catch (error) {
        console.error('Error handling social link:', error);
      }
    };

    const isValidUrl = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    React.useImperativeHandle(ref, () => ({
      handleSocialLinkPress: (url?: string) => {
        if (url) {
          Linking.openURL(url);
        }
      }
    }));

    const hasSocialLinks = Object.values(socialLinks).some(link => link);

    return (
      <View style={styles.outerContainer}>
        <View style={styles.backgroundShape} testID="backgroundShape" />
        <ImageBackground
          source={{ uri: profileBanner }}
          style={styles.container}
          imageStyle={styles.backgroundImage}
          testID="backgroundImage"
        >
          <View style={styles.overlay} />
          <View style={styles.content}>
            <TouchableOpacity onPress={onSettingsPress} style={styles.settingsIcon} testID='settingsButton'>
              <SvgXml xml={settings} width={36} height={36} fill='#d0c4c3' testID='svg-xml' />
            </TouchableOpacity>

            <Image
              style={styles.profileImage}
              source={{ uri: profileImage }} 
              testID="profileImage"
            />

            <View style={styles.infoRow}>
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{username}</Text>
                <View style={styles.roleContainer}>
                  <Text style={styles.role}>{role}</Text>
                  {verified && (
                    <MaterialIcons name="verified" size={16} color="#4285F4" style={styles.verifiedIcon} testID='MaterialIcons-verified'/>
                  )}
                </View>
              </View>
              <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
                <SvgXml xml={pencil} width={17} height={17} style={styles.iconGap} testID='svg-xml'/>
                <Text style={styles.editText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {hasSocialLinks && (
          <View style={styles.socialIconsOuterContainer}>
            <View style={styles.socialIconsContainer}>
              {socialLinks.instagram && (
                <TouchableOpacity 
                  onPress={() => handleSocialLinkPress(socialLinks.instagram, 'instagram')}
                  style={styles.socialIcon}
                  testID="instagram-button"
                >
                  <AntDesign name="instagram" size={20} color="#4d4544" testID='AntDesign-instagram'/>
                </TouchableOpacity>
              )}

              {socialLinks.twitter && (
                <TouchableOpacity 
                  onPress={() => handleSocialLinkPress(socialLinks.twitter, 'twitter')}
                  style={styles.socialIcon}
                  testID="twitter-button"
                >
                  <AntDesign name="twitter" size={20} color="#4d4544" testID='AntDesign-twitter'/>
                </TouchableOpacity>
              )}

              {socialLinks.discord && (
                <TouchableOpacity 
                  onPress={() => handleSocialLinkPress(socialLinks.discord, 'discord')}
                  style={styles.socialIcon}
                  testID="discord-button"
                >
                  <MaterialIcons name="discord" size={20} color="#4d4544" testID='MaterialIcons-discord'/>
                </TouchableOpacity>
              )}

              {socialLinks.tiktok && (
                <TouchableOpacity 
                  onPress={() => handleSocialLinkPress(socialLinks.tiktok, 'tiktok')}
                  style={styles.socialIcon}
                  testID="tiktok-button"
                >
                  <FontAwesome5 name="tiktok" size={20} color="#4d4544" testID='FontAwesome5-tiktok'/>
                </TouchableOpacity>
              )}

              {socialLinks.line && (
                <TouchableOpacity 
                  onPress={() => handleSocialLinkPress(socialLinks.line, 'line')}
                  style={styles.socialIcon}
                  testID="line-button"
                >
                  <Fontisto name="line" size={20} color="#4d4544" testID='Fontisto-line'/>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
  },
  container: {
    width: '100%',
    minHeight: 250,
    justifyContent: 'center',
    borderRadius: 0,
    overflow: 'hidden',
  },
  backgroundShape: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 270,
    backgroundColor: '#fff',
    zIndex: -1,
  },
  backgroundImage: {
    borderRadius: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.63)',
    borderRadius: 0,
  },
  content: {
    padding: 15,
    marginBottom: 12
  },
  settingsIcon: {
    alignSelf: 'flex-end',
    marginVertical: 12,
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    resizeMode: 'cover',
    alignSelf: 'flex-start',
    marginVertical: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  infoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    fontFamily: 'Inter',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  role: {
    fontSize: 16,
    color: '#D0C4C3',
    fontFamily: 'Inter',
    marginTop: 4,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f7',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editText: {
    fontSize: 12,
    color: '#4d4544',
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  iconGap: {
    marginRight: 8,
  },
  socialIconsOuterContainer: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 8,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  socialIcon: {
    padding: 8,
  },
});

export default ProfileCard;