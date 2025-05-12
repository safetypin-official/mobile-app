import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ListRenderItemInfo } from 'react-native';
import DataTabs, { TabConfig, FetchResult } from '@/components/displays/DataTabs';
import { CommentNotification, FollowNotification } from '@/components/displays/Types';
import * as Location from 'expo-location';
import { authenticatedGet } from '@/utils/api';
import { NotificationCard } from '@/components/displays/NotificationCard';
import { router } from 'expo-router';


const NotificationsPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchRefresh, setSearchRefresh] = useState<boolean>(false);

  const getUserLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    } catch (error) {
      console.error('Error fetching user location:', error);
      setLocationError('Unable to fetch location. Please enable location services.');
    }
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  const fetchCommentNotifications = async (page: number, refresh: boolean): Promise<FetchResult<CommentNotification>> => {
    const url = `https://safetypin.ppl.cs.ui.ac.id/posts/comment-notifications`;
    console.log(`Fetching: ${url}`);

    try {
        const response = await authenticatedGet(url);
        const raw = response.data ?? [];
        const notifications: CommentNotification[] = raw.map((item: any) => ({
            type: item.type,
            actorUserId: item.actorUserId,
            actorName: item.actorName,
            actorProfilePictureUrl: item.actorProfilePictureUrl,
            timeAgo: item.timeAgo,
            postId: item.postId,
            commentId: item.commentId,
            replyId: item.replyId,
            createdAt: item.createdAt,
            commentContent: item.commentContent,
        }));
        
        return { items: notifications, currentPage: page, hasMore: false };
      } catch (error) {
        console.error('Error fetching comment notifications:', error);
        throw error;
      }
  };

  const fetchFollowNotifications = async (page: number, refresh: boolean): Promise<FetchResult<FollowNotification>> => {
    const url = `https://safetypin.ppl.cs.ui.ac.id/api/follow/notifications/recent-followers`;
    console.log(`Fetching: ${url}`);

    try {
      const response = await authenticatedGet(url);
      console.log("Follow API response:", response.data);
      const raw = response ?? [];
      const notifications: FollowNotification[] = raw.map((item: any) => ({
        userId: item.userId,
        name: item.name,
        profilePicture: item.profilePicture,
        followedAt: item.followedAt,
        daysAgo: item.daysAgo,
      }));
      
      console.log("Mapped notifications:", notifications);
      return { items: notifications, currentPage: page, hasMore: false };
    } catch (error) {
      console.error('Error fetching follow notifications:', error);
      throw error;
    }
  };

  const tabsConfig: TabConfig<CommentNotification | FollowNotification>[] = [
    { 
      key: 'comments', 
      label: 'Comments', 
      fetchData: fetchCommentNotifications, 
      refreshTrigger: searchRefresh,
      renderItem: ({ item }: ListRenderItemInfo<CommentNotification | FollowNotification>) => {
        const commentNotif = item as CommentNotification; // Type assertion to CommentNotification
        let message = "";
        
        switch (commentNotif.type) {
          case "NEW_COMMENT_ON_POST":
            message = `${commentNotif.actorName} commented on your post`;
            break;
          case "NEW_REPLY_TO_COMMENT":
            message = `${commentNotif.actorName} replied to your comment`;
            break;
          case "NEW_SIBLING_REPLY":
            message = `${commentNotif.actorName} replied to the same comment thread you are in`;
            break;
          default:
            message = `${commentNotif.actorName} commented on your post`;
            break;
        }
        
        return (
          <NotificationCard
            avatarUri={commentNotif.actorProfilePictureUrl ?? 'https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true'}
            username={commentNotif.actorName}
            type='comment'
            message={message}
            description={commentNotif.commentContent}
            timestamp={commentNotif.createdAt}
            unread={true}
            referenceId={commentNotif.postId}
            onPress={() => {
              router.push(`/post/${commentNotif.postId}`);
            }}
          />
        );
      },
      keyExtractor: (item) => (item as CommentNotification).replyId ?? `comment-${(item as CommentNotification).commentId || (item as CommentNotification).postId}`
    },
    { 
      key: 'follows', 
      label: 'Follows', 
      fetchData: fetchFollowNotifications, 
      refreshTrigger: searchRefresh,
      renderItem: ({ item }: ListRenderItemInfo<FollowNotification | CommentNotification>) => {
        const followNotif = item as FollowNotification; // Type assertion to FollowNotification
        const message = `${followNotif.name} followed you`;
        
        return (
          <NotificationCard
            avatarUri={followNotif.profilePicture ?? 'https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true'}
            username={followNotif.name}
            type='follow'
            message={message}
            description=""
            timestamp={followNotif.followedAt}
            unread={true}
            referenceId={followNotif.userId}
            onPress={() => {
              router.push(`/profile?userId=${followNotif.userId}`);
            }}
          />
        );
      },
      keyExtractor: (item) => (item as FollowNotification).userId
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Notifications</Text>
      <DataTabs
        tabs={tabsConfig}
        contentContainerStyle={{ ...styles.feedContainer, paddingBottom: 60 }}
      />
      <View style={styles.endMargin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
    paddingHorizontal: 16,
  },
  feedContainer: {
    padding: 4,
  },
  postCard: {
    backgroundColor: '#FEFEFE',
    marginBottom: 8,
    paddingVertical: 12,
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#551022',
    marginVertical: 8,
    fontFamily: 'Inter',
  },
  endMargin: {
    minHeight: 60, 
  },
});

export default NotificationsPage;