import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Image, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import ProfileCard from '@/components/displays/profile/ProfileCard';
import EditProfileForm from '@/components/forms/EditProfileForm';
import Modal from 'react-native-modal';
import PostsTabs, { TabConfig, FetchResult, Post } from '@/components/displays/PostsTabs';
import UserInfo from '@/components/displays/post/UserInfo';
import ReportContent, { TagKey } from '@/components/displays/post/ReportContent';
import { router } from 'expo-router';


const API_BASE_URL = 'https://safetypin.ppl.cs.ui.ac.id/api';

// --- API functions ---

const followUser = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/follow/${userId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) throw new Error('Failed to follow user');
};

const unfollowUser = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/follow/${userId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) throw new Error('Failed to unfollow user');
};

const fetchFollowers = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/follow/followers/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch followers');
  return await response.json(); // Expect array
};

const fetchFollowing = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/follow/following/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch following');
  return await response.json(); // Expect array
};

const dummyProfile = {
  id: 'user123',
  username: '@mimemamomu',
  role: 'Premium User',
  verified: true,
  profileImage: 'https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true',
  profileBanner: 'https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true',
  followersCount: 1243,
  followingCount: 567,
  isFollowing: false, // Add this
  socialLinks: {
    instagram: 'mimemamomu',
    twitter: 'mimemamomu',
    tiktok: 'mimemamomu',
    line: 'mimemamomu',
    discord: '733588659328122930'
  },
};

type ListType = 'followers' | 'following';

interface User {
  id: string;
  username: string;
  profileImage: string;
  isFollowing?: boolean;
}

const dummyFollowers: User[] = [
  {
    id: 'user1',
    username: '@follower1',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    isFollowing: true
  },
  {
    id: 'user2',
    username: '@follower2',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    isFollowing: false
  }
];

const dummyFollowing: User[] = [
  {
    id: 'user3',
    username: '@following1',
    profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    isFollowing: true
  },
  {
    id: 'user4',
    username: '@following2',
    profileImage: 'https://randomuser.me/api/portraits/men/75.jpg',
    isFollowing: false
  }
];

const PAGE_SIZE = 10;

const ProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(dummyProfile);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [listType, setListType] = useState<ListType>('followers');
  const [currentList, setCurrentList] = useState<User[]>([]);


  const openFollowersModal = async () => {
    try {
      const followers = await fetchFollowers(profileData.id);
      setListType('followers');
      setCurrentList(followers);
      setListModalVisible(true);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const openFollowingModal = async () => {
    try {
      const following = await fetchFollowing(profileData.id);
      setListType('following');
      setCurrentList(following);
      setListModalVisible(true);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const handleFollowPress = async (newFollowingState: boolean) => {
    try {
      if (newFollowingState) {
        await followUser(profileData.id);
      } else {
        await unfollowUser(profileData.id);
      }

      setProfileData(prev => ({
        ...prev,
        isFollowing: newFollowingState,
        followersCount: newFollowingState 
          ? prev.followersCount + 1 
          : prev.followersCount - 1
      }));
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const UserListItem = ({ user }: { user: User }) => {
    const [isFollowing, setIsFollowing] = useState(user.isFollowing ?? false);

    const handleFollowToggle = async () => {
      try {
        if (isFollowing) {
          await unfollowUser(user.id);
        } else {
          await followUser(user.id);
        }
        setIsFollowing(!isFollowing);
      } catch (error) {
        console.error('Error toggling follow:', error);
      }
    };

    return (
      <View style={styles.listItem}>
        <Image 
          source={{ uri: user.profileImage }} 
          style={styles.listItemImage} 
        />
        <Text style={styles.listItemText}>{user.username}</Text>
        <TouchableOpacity style={styles.followButtonSmall} onPress={handleFollowToggle}>
          <Text style={styles.followButtonTextSmall}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Fetch function for user posts
  const fetchUserPosts = async (page: number, refresh: boolean): Promise<FetchResult> => {
    try {
      const response = await fetch(`https://safetypin.ppl.cs.ui.ac.id/post/user/${profileData.id}?page=${page}&size=${PAGE_SIZE}`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const responseData = await response.json();
      const data = responseData.data?.content || [];
      const posts: Post[] = data.map((item: any) => {
        const post = item.post || item;
        return {
          id: post.id,
          title: post.title || 'Untitled',
          caption: post.caption || '',
          createdAt: post.createdAt,
          postedBy: post.postedBy,
          category: post.category || 'general',
          imageUrl: post.imageUrl,
          latitude: post.latitude || 0,
          longitude: post.longitude || 0,
          upvoteCount: post.upvoteCount || 0,
          downvoteCount: post.downvoteCount || 0,
          address: post.address || '',
        };
      });
      const hasMore = responseData.data ? !responseData.data.last : posts.length === PAGE_SIZE;
      return {
        posts,
        currentPage: page,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw new Error('Failed to fetch user posts');
    }
  };

  // Fetch function for liked posts
  const fetchCommentedPosts = async (page: number, refresh: boolean): Promise<FetchResult> => {
    try {
      // Change this part later
      const response = await fetch(`https://safetypin.ppl.cs.ui.ac.id/post/comment/${profileData.id}?page=${page}&size=${PAGE_SIZE}`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const responseData = await response.json();
      const data = responseData.data?.content || [];
      const posts: Post[] = data.map((item: any) => {
        const post = item.post || item;
        return {
          id: post.id,
          title: post.title || 'Untitled',
          caption: post.caption || '',
          createdAt: post.createdAt,
          postedBy: post.postedBy,
          category: post.category || 'general',
          imageUrl: post.imageUrl,
          latitude: post.latitude || 0,
          longitude: post.longitude || 0,
          upvoteCount: post.upvoteCount || 0,
          downvoteCount: post.downvoteCount || 0,
          address: post.address || '',
        };
      });
      const hasMore = responseData.data ? !responseData.data.last : posts.length === PAGE_SIZE;
      return {
        posts,
        currentPage: page,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching commented posts:', error);
      throw new Error('Failed to fetch commented posts');
    }
  };

  // Render function for each post item
  const renderPostItem = ({ item }: { item: Post }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    const getUsername = (postedBy: string | null) => (postedBy ?? 'Anonymous');
    const getHandle = (postedBy: string | null) =>
      `@${getUsername(postedBy).toLowerCase().replace(/\s/g, '')}`;
    const getCategoryTags = (category: string): TagKey[] => [category as TagKey];

    return (
      <View style={styles.postCard}>
        <UserInfo
          avatarUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true"
          username={getUsername(item.postedBy)}
          handle={getHandle(item.postedBy)}
          date={formatDate(item.createdAt)}
          location={item.address || "Nearby"}
          moreOptionsIconUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/43f6a47c22e1c702925915e6626ae6f483d1e56e047a9647d4ff9e5de9751425?placeholderIfAbsent=true"
          longitude={item.longitude}
          latitude={item.latitude}
          categoryType={item.category}
        />

        <ReportContent
          title={item.title}
          content={item.caption}
          likeCount={item.upvoteCount}
          dislikeCount={item.downvoteCount}
          selectedTags={getCategoryTags(item.category)}
          imageUrl={item.imageUrl ?? 'https://i.imgur.com/Ha3UkA3.jpg'}
          postId={item.id}
        />

        <View style={styles.divider} />
      </View>
    );
  };

  const tabsConfig: TabConfig[] = [
    { key: 'posts', label: 'Posts', fetchPosts: fetchUserPosts },
    { key: 'comments', label: 'Comments', fetchPosts: fetchCommentedPosts },
  ];

  const handleSettingsPress = () => {
    // router.push('/settings/')
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = (updatedSocialLinks: any) => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        ...updatedSocialLinks
      }
    }));
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
      <View style={styles.profileCardShadow}>
      <ProfileCard
            id={profileData.id}
            username={profileData.username}
            role={profileData.role}
            verified={profileData.verified}
            profileImage={profileData.profileImage}
            profileBanner={profileData.profileBanner}
            socialLinks={profileData.socialLinks}
            onEditPress={handleEditPress}
            onSettingsPress={handleSettingsPress}
            onFollowPress={handleFollowPress}
            isFollowing={profileData.isFollowing}
            followersCount={profileData.followersCount}
            followingCount={profileData.followingCount}
            onFollowersCountChange={(newCount) => {
              setProfileData(prev => ({
                ...prev,
                followersCount: newCount
              }));
            }}
            onFollowersPress={openFollowersModal}  // Add this
            onFollowingPress={openFollowingModal}  // Add this
            isOwnProfile={false}
          />
      </View>
        
        <PostsTabs
          tabs={tabsConfig}
          renderItem={renderPostItem}
          contentContainerStyle={styles.postsContent}
        />
      </ScrollView>

      {/* Followers/Following Modal */}
      <Modal
        isVisible={listModalVisible}
        onBackdropPress={() => setListModalVisible(false)}
        style={styles.listModal}
      >
        <View style={styles.listModalContent}>
          <Text style={styles.listModalTitle}>
            {listType === 'followers' ? 'Followers' : 'Following'}
          </Text>
          
          <ScrollView style={styles.listContainer}>
            {currentList.map(user => (
              <UserListItem key={user.id} user={user} />
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        isVisible={isEditing}
        onBackdropPress={() => setIsEditing(false)}
        onSwipeComplete={() => setIsEditing(false)}
        swipeDirection="down"
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <EditProfileForm
            initialData={{
              ...profileData,
              ...profileData.socialLinks,
              profilePic: profileData.profileImage,
              profileBanner: profileData.profileBanner
            }}
            onSave={handleSaveProfile}
            onClose={() => setIsEditing(false)}
            onProfilePicChange={() => console.log('Change profile picture')}
            onProfileBannerChange={() => console.log('Change profile banner')}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  postsContent: {
    padding: 4,
    paddingBottom: 60,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: '#2A2A2A',
    marginBottom: 8,
    paddingVertical: 12,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 10,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '95%',
    paddingBottom: 0,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#CCC',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 0,
  },

  profileCardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 10,
    borderRadius: 20,
  },

  listModal: {
    justifyContent: 'center',
    margin: 20,
  },
  listModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  listModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  listContainer: {
    maxHeight: '80%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
  },
  followButtonSmall: {
    backgroundColor: '#9F3F3D',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
  },
  followButtonTextSmall: {
    color: '#fff',
    fontSize: 12,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },

});

export default ProfileScreen;