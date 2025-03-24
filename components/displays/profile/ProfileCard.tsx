import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { SvgXml } from "react-native-svg";
import { settings, pencil } from '@/assets/icons';

interface ProfileCardProps {
  name: string;
  username: string;
  profileImage: string;
  profileBanner: string;
  onEditPress: () => void;
  onSettingsPress: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  username,
  profileImage,
  profileBanner,
  onEditPress,
  onSettingsPress,
}) => {
  return (
    <ImageBackground
      source={{ uri: profileBanner }}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      testID="backgroundImage"
    >
      <View style={styles.overlay} />

      <View style={styles.content}>
        <TouchableOpacity onPress={onSettingsPress} style={styles.settingsIcon} testID='settingsButton'>
          <SvgXml xml={settings} width={36} height={36} fill='#d0c4c3' />
        </TouchableOpacity>

        <Image
          style={styles.profileImage}
          source={{ uri: profileImage }} 
          testID="profileImage"
        />

        <View style={styles.infoRow}>
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.username}>@{username}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <SvgXml xml={pencil} width={17} height={17} style={styles.iconGap} />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 250,
    justifyContent: 'center',
  },
  backgroundImage: {
    borderRadius: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.63)',
    borderRadius: 30,
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
  username: {
    fontSize: 16,
    color: '#D0C4C3',
    fontFamily: 'Inter',
    marginTop: 4,
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
});

export default ProfileCard;