import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  followNotifIcon,
  reportNotifIcon,
  commentNotifIcon,
} from '@/assets/icons';

const iconMap = {
  report: reportNotifIcon,
  comment: commentNotifIcon,
  follow: followNotifIcon,
};
export interface NotificationCardProps {
    avatarUri: string;
    username: string;
    type: 'comment' | 'follow' | 'report'; // extend this if more types are expected
    message: string;
    description?: string;
    timestamp: string; // ISO string or a formatted date string
    unread: boolean;
    referenceId: string;
    onPress: (referenceId: string) => void;
}
  
export const NotificationCard: React.FC<NotificationCardProps> = ({
    avatarUri,
    username,
    type,
    message,
    description,
    timestamp,
    unread,
    referenceId,
    onPress,
}) => {
  if (!unread) return null;

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={() => onPress(referenceId)}>
      <View style={styles.row}>
        <SvgXml xml={iconMap[type]} width={24} height={24} stroke={"#904A47"} strokeWidth={2}/>
        <View style={styles.content}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.messageText}>{message}</Text>
            <Text style={styles.descriptionText}>{description}</Text>
            <Text style={styles.timestampText}>
              {new Date(timestamp).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 12,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 22,
  },
  content: {
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 240,
    marginHorizontal: 12,
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 8,
    width: '100%',
  },
  messageText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    lineHeight: 20,
    color: '#57534e',
  },
  descriptionText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.25,
    lineHeight: 16,
    color: '#78716c',
  },
  timestampText: {
    marginTop: 6,
    fontSize: 10,
    color: '#a8a29e',
    fontStyle: 'italic',
  },
});
