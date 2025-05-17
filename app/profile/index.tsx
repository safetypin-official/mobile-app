import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Image, 
  Text, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import ProfileCard from '@/components/displays/profile/ProfileCard';
import EditProfileForm from '@/components/forms/EditProfileForm';
import Modal from 'react-native-modal';
import PostsTabs, { TabConfig, FetchResult, Post } from '@/components/displays/PostsTabs';
import DataTabs, { TabConfig as DataTabConfig, FetchResult as DataFetchResult } from '@/components/displays/DataTabs';
import UserInfo from '@/components/displays/post/UserInfo';
import ReportContent, { TagKey } from '@/components/displays/post/ReportContent';
import CommentSection from '@/components/displays/post/CommentSection';
import { router, useLocalSearchParams } from 'expo-router';
import { authenticatedGet, authenticatedPost, authenticatedDelete, authenticatedPut } from '@/utils/api';
import { clearAuthData } from '@/utils/auth';

const API_BASE_URL = 'https://safetypin.ppl.cs.ui.ac.id/api';

// --- API functions with authentication ---

const followUser = async (userId: string) => {
  const response = await authenticatedPost(`${API_BASE_URL}/follow/${userId}`, {});
  if (!response.success) throw new Error('Failed to follow user');
};

const unfollowUser = async (userId: string) => {
  const response = await authenticatedDelete(`${API_BASE_URL}/follow/${userId}`);
  if (!response.success) throw new Error('Failed to unfollow user');
};

const fetchFollowers = async (userId: string) => {
  const response = await authenticatedGet(`${API_BASE_URL}/follow/followers/${userId}`);
  return response.data; // Expect array
};

const fetchFollowing = async (userId: string) => {
  const response = await authenticatedGet(`${API_BASE_URL}/follow/following/${userId}`);
  return response.data; // Expect array
};

export const getFileExtension = (uri: string): string => {
  const fileName = uri.split('/');
  const endpoint = fileName.pop();
  const parts = endpoint!.split('.');

  if (parts.length > 1) {
    return parts[parts.length - 1];
  }

  return 'jpeg';
};

const dummyProfile = {
  id: 'user123',
  username: '@mimemamomu',
  role: 'Premium User',
  verified: true,
  profileImage: 'https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true',
  profileBanner: 'https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true',
  followersCount: 0,
  followingCount: 0,
  isFollowing: false,
  socialLinks: {
    instagram: 'mimemamomu',
    twitter: 'mimemamomu',
    tiktok: 'mimemamomu',
    line: 'mimemamomu',
    discord: '733588659328122930'
  },
};

type ListType = 'followers' | 'following';

// Update the User interface definition to match the API response
interface User {
  userId: string;  // Changed from id
  name: string;    // Changed from username
  profilePicture: string | null;  // Changed from profileImage
  profileBanner?: string | null;
  following?: boolean;
}

// Comment type based on your new API response
type CommentUser = {
  userId: string;
  name: string;
  profilePicture?: string;
};

type Comment = {
  id: string;
  caption: string;
  postedBy: CommentUser;
  postedById: string;
  createdAt: string;
  commentCount?: number;
  postId?: string;
};

const PAGE_SIZE = 10;

const ProfileScreen = () => {
  const params = useLocalSearchParams();
  const userId = params.userId as string | undefined;
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(dummyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState<string | null>(null);
  const [newProfileBanner, setNewProfileBanner] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchRefresh, setSearchRefresh] = useState<boolean>(false);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [listType, setListType] = useState<ListType>('followers');
  const [currentList, setCurrentList] = useState<User[]>([]);

  const getPresignedUrl = async (fileType: string): Promise<string | null> => {
    try {
      const response = await authenticatedPost('https://safetypin.ppl.cs.ui.ac.id/post/s3/presigned-url', {
        fileType: fileType
      });
      
      return response.url;
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      return null;
    }
  };

  const uploadImageToS3 = async (imageUri: string): Promise<string | null> => {
    try {
      const fileExt = getFileExtension(imageUri);
      const fileType = fileExt === 'jpg' ? 'jpeg' : fileExt;
      
      const presignedUrl = await getPresignedUrl(fileType);
      if (!presignedUrl) {
        throw new Error('Failed to get presigned URL');
      }
      
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': `image/${fileType}`
        }
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }
      
      const s3Url = presignedUrl.split('?')[0];
      console.log('Upload successful:', s3Url);
      
      return s3Url;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
      return null;
    }
  };

  const handleImagePick = async (isProfilePic: boolean) => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorMessage) {
        console.log("ImagePicker Error: ", response.errorMessage);
      } else {
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          if (isProfilePic) {
            setNewProfilePic(uri);
          } else {
            setNewProfileBanner(uri);
          }
        }
      }
    });
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        let response;
        
        // Determine if viewing own profile or someone else's
        if (!userId) {
          response = await authenticatedGet(`${API_BASE_URL}/profiles/me`);
          setIsOwnProfile(true);
        } else {
          response = await authenticatedGet(`${API_BASE_URL}/profiles/${userId}`);
          
          // Check if the viewed profile is actually the user's own
          const myProfileResponse = await authenticatedGet(`${API_BASE_URL}/profiles/me`);
          if (myProfileResponse.success && myProfileResponse.data?.id === userId) {
            setIsOwnProfile(true);
          } else {
            setIsOwnProfile(false);
          }
        }
        
        if (response.success && response.data) {
          const apiProfile = response.data;
          
          // Use the followers and following counts directly from the API response
          setProfileData({
            id: apiProfile.id,
            username: apiProfile.name || 'Anonymous User',
            role: apiProfile.role || 'User',
            verified: apiProfile.verified || false,
            profileImage: apiProfile.profilePicture || dummyProfile.profileImage,
            profileBanner: apiProfile.profileBanner || dummyProfile.profileBanner,
            followersCount: apiProfile.followersCount || 0,
            followingCount: apiProfile.followingCount || 0,
            isFollowing: apiProfile.following || false,
            socialLinks: {
              instagram: apiProfile.instagram || '',
              twitter: apiProfile.twitter || '',
              tiktok: apiProfile.tiktok || '',
              line: apiProfile.line || '',
              discord: apiProfile.discord || '',
            }
          });
          setError(null);
        } else {
          setError('Failed to load profile data');
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const openFollowersModal = async () => {
    try {
      const followers = await fetchFollowers(profileData.id);
      setListType('followers');
      // Keep isFollowing as provided by the API
      setCurrentList(followers);
      setListModalVisible(true);
    } catch (error) {
      console.error('Error fetching followers:', error);
      Alert.alert('Error', 'Failed to load followers');
    }
  };

  const openFollowingModal = async () => {
    try {
      const following = await fetchFollowing(profileData.id);
      setListType('following');
      // For following list, all users should have isFollowing=true
      setCurrentList(following);
      setListModalVisible(true);
    } catch (error) {
      console.error('Error fetching following:', error);
      Alert.alert('Error', 'Failed to load following');
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
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const fetchUserPosts = async (page: number, refresh: boolean): Promise<FetchResult> => {
    if (isLoading || !profileData.id || profileData.id === 'user123') {
      return { posts: [], currentPage: page, hasMore: false };
    }
    
    try {
      const response = await authenticatedGet(
        `https://safetypin.ppl.cs.ui.ac.id/posts/user?postUserId=${profileData.id}&page=${page}&size=${PAGE_SIZE}`
      );
      
      const data = response.data?.content || [];
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
          currentVote: post.currentVote || 'NONE',
          commentCount: post.commentCount || 0,
        };
      });
      const hasMore = response.data ? response.data.hasNext : false;
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

  const fetchUserComments = async (page: number, refresh: boolean): Promise<DataFetchResult<Comment>> => {
    try {
      const response = await authenticatedGet(
        `https://safetypin.ppl.cs.ui.ac.id/posts/comment/postedby/${profileData.id}?page=${page}&size=${PAGE_SIZE}`
      );
      // Map the new API response to Comment[]
      const data = response.data?.content || [];
      const comments: Comment[] = data.map((item: any) => ({
        ...item.comment,
        postId: item.postId,
      }));
      return {
        items: comments,
        currentPage: response.data?.currentPage ?? page,
        hasMore: response.data?.hasNext ?? false,
      };
    } catch (error) {
      console.error('Error fetching user comments:', error);
      throw new Error('Failed to fetch user comments');
    }
  };

  const UserListItem = ({ user }: { user: User }) => {
    const [isFollowing, setIsFollowing] = useState(user.following ?? false);

    const handleFollowToggle = async () => {
      try {
        if (isFollowing) {
          await unfollowUser(user.userId); // Changed from user.id
        } else {
          await followUser(user.userId); // Changed from user.id
        }
        setIsFollowing(!isFollowing);
      } catch (error) {
        console.error('Error toggling follow:', error);
        Alert.alert('Error', 'Failed to update follow status');
      }
    };

    // Use a fallback image if profilePicture is null
    const profileImage = user.profilePicture || 
      "https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true";

    return (
      <View style={styles.listItem}>
        <TouchableOpacity
          style={styles.userInfoSection}
          onPress={() => {
            setListModalVisible(false);
            router.push(`/profile?userId=${user.userId}`);
          }}
        >
          <Image 
            source={{ uri: profileImage }} 
            style={styles.listItemImage} 
          />
          <Text style={styles.listItemText}>{user.name}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.followButtonSmall} 
          onPress={handleFollowToggle}
        >
          <Text style={styles.followButtonTextSmall}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    const getCategoryTags = (category: string): TagKey[] => [category as TagKey];

    return (
      <View style={styles.postCard}>
        <UserInfo
          postedBy={item.postedBy}
          date={formatDate(item.createdAt)}
          location={item.address ?? 'Nearby'}
          moreOptionsIconUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/43f6a47c22e1c702925915e6626ae6f483d1e56e047a9647d4ff9e5de9751425?placeholderIfAbsent=true"
          longitude={item.longitude}
          latitude={item.latitude}
          categoryType={item.category}
          postId={item.id}
          onPostDeleted={() => setSearchRefresh(prev => !prev)}
        />

        <ReportContent
          title={item.title}
          content={item.caption}
          likeCount={item.upvoteCount ?? 0}
          dislikeCount={item.downvoteCount ?? 0}
          selectedTags={getCategoryTags(item.category)}
          imageUrl={item.imageUrl ?? 'https://i.imgur.com/Ha3UkA3.jpg'}
          postId={item.id}
          currentVote={item.currentVote || 'NONE'}
          commentCount={item.commentCount ?? 0}
        />

        <View style={styles.divider} />
      </View>
    );
  };

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        // Navigate to the appropriate post
        if (item.postId) {
          router.push(`/post/${item.postId}`);
        }
      }}
    >
      <CommentSection
        commentId={item.id}
        avatarUrl={item.postedBy?.profilePicture ?? "https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true"}
        username={item.postedBy?.name ?? "Anonymous"}
        handle={`@${(item.postedBy?.name ?? "anonymous").toLowerCase().replace(/\s/g, "")}`}
        date={new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        content={item.caption}
        onCommentDeleted={() => setSearchRefresh(prev => !prev)}
      />
    </TouchableOpacity>
  );

  const tabsConfig: TabConfig[] = [
    { key: 'posts', label: 'Posts', fetchPosts: fetchUserPosts, refreshTrigger: searchRefresh },
    { key: 'comments', label: 'Comments', fetchPosts: fetchUserComments, refreshTrigger: searchRefresh },
  ];

  const dataTabsConfig: DataTabConfig<any>[] = [
    {
      key: 'posts',
      label: 'Posts',
      fetchData: async (page, refresh) => {
        const result = await fetchUserPosts(page, refresh);
        return {
          items: result.posts,
          currentPage: result.currentPage,
          hasMore: result.hasMore,
        };
      },
      renderItem: renderPostItem,
      keyExtractor: (item: Post) => item.id,
      refreshTrigger: searchRefresh,
    },
    {
      key: 'comments',
      label: 'Comments',
      fetchData: fetchUserComments,
      renderItem: renderCommentItem,
      keyExtractor: (item: Comment) => item.id,
      refreshTrigger: searchRefresh,
    },
  ];

  const handleSettingsPress = () => {
    if (isOwnProfile) {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              try {
                await clearAuthData();
                router.replace('/');
              } catch (error) {
                console.error("Error logging out:", error);
                Alert.alert("Error", "Failed to logout. Please try again.");
              }
            }
          }
        ]
      );
    } else {
      // Only navigate to settings if it's the user's own profile
      Alert.alert("Note", "You can only access settings on your own profile");
    }
  };

  const handleEditPress = () => {
    if (isOwnProfile) {
      setIsEditing(true);
      setNewProfilePic(null);
      setNewProfileBanner(null);
    } else {
      Alert.alert("Note", "You can only edit your own profile");
    }
  };

  const handleSaveProfile = async (updatedSocialLinks: any) => {
    try {
      setIsLoading(true);
      setIsUploading(true);

      let profilePictureUrl = profileData.profileImage;
      let profileBannerUrl = profileData.profileBanner;

      if (newProfilePic) {
        const uploadedProfilePic = await uploadImageToS3(newProfilePic);
        if (uploadedProfilePic) {
          profilePictureUrl = uploadedProfilePic;
        }
      }

      if (newProfileBanner) {
        const uploadedProfileBanner = await uploadImageToS3(newProfileBanner);
        if (uploadedProfileBanner) {
          profileBannerUrl = uploadedProfileBanner;
        }
      }

      const updatedProfileData = {
        instagram: updatedSocialLinks.instagram || null,
        twitter: updatedSocialLinks.twitter || null,
        line: updatedSocialLinks.line || null,
        tiktok: updatedSocialLinks.tiktok || null,
        discord: updatedSocialLinks.discord || null,
        profilePicture: profilePictureUrl,
        profileBanner: profileBannerUrl
      };

      const response = await authenticatedPut(
        `${API_BASE_URL}/profiles/me`,
        updatedProfileData
      );

      if (response.success) {
        setProfileData(prev => ({
          ...prev,
          profileImage: profilePictureUrl,
          profileBanner: profileBannerUrl,
          socialLinks: {
            instagram: updatedSocialLinks.instagram || '',
            twitter: updatedSocialLinks.twitter || '',
            tiktok: updatedSocialLinks.tiktok || '',
            line: updatedSocialLinks.line || '',
            discord: updatedSocialLinks.discord || '',
          }
        }));
        
        Alert.alert("Success", "Profile updated successfully");
      } else {
        throw new Error(response.message ?? 'Failed to update profile');
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  if (isLoading && !profileData.id) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error && !profileData.id) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <ActivityIndicator 
          size="small" 
          color="#0000ff" 
          style={styles.loadingOverlay} 
        />
      )}
      
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
            onFollowersPress={openFollowersModal}
            onFollowingPress={openFollowingModal}
            isOwnProfile={isOwnProfile}
          />
        </View>
        
        <View style={styles.tabsContainer}>
          <DataTabs
            tabs={dataTabsConfig}
            contentContainerStyle={styles.postsContent}
          />
          <View style={{ height: 45 }} />
        </View>
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
            {currentList.length > 0 ? (
              currentList.map(user => (
                <UserListItem key={user.userId} user={user} />
              ))
            ) : (
              <Text style={styles.emptyListText}>
                {listType === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </Text>
            )}
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setListModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
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
              profilePic: newProfilePic ?? profileData.profileImage,
              profileBanner: newProfileBanner ?? profileData.profileBanner
            }}
            onSave={handleSaveProfile}
            onClose={() => setIsEditing(false)}
            onProfilePicChange={() => handleImagePick(true)}
            onProfileBannerChange={() => handleImagePick(false)}
            isUploading={isUploading}
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
  tabsContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  postsContent: {
    padding: 4,
    paddingBottom: 60,
    backgroundColor: '#FFFFFF',
  },
  postCard: {
    backgroundColor: '#FEFEFE',
    marginBottom: 8,
    paddingVertical: 12,
    width: '100%',
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
    width: '100%',
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 100,
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
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});

export default ProfileScreen;