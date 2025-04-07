import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, Text, Alert } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import ProfileCard from '@/components/displays/profile/ProfileCard';
import EditProfileForm from '@/components/forms/EditProfileForm';
import Modal from 'react-native-modal';
import PostsTabs, { TabConfig, FetchResult, Post } from '@/components/displays/PostsTabs';
import UserInfo from '@/components/displays/post/UserInfo';
import ReportContent, { TagKey } from '@/components/displays/post/ReportContent';
import { router } from 'expo-router';
import { authenticatedGet, authenticatedPut, authenticatedPost } from '@/utils/api';

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
  socialLinks: {
    instagram: 'mimemamomu',
    twitter: 'mimemamomu',
    tiktok: 'mimemamomu',
    line: 'mimemamomu',
    discord: '733588659328122930'
  },
};

const PAGE_SIZE = 10;

const ProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(dummyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProfilePic, setNewProfilePic] = useState<string | null>(null);
  const [newProfileBanner, setNewProfileBanner] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        const response = await authenticatedGet('https://safetypin.ppl.cs.ui.ac.id/api/profiles/me');
        
        if (response.success && response.data) {
          const apiProfile = response.data;
          setProfileData({
            id: apiProfile.id,
            username: apiProfile.username || 'Anonymous User',
            role: apiProfile.role || 'User',
            verified: apiProfile.verified || false,
            profileImage: apiProfile.profilePicture || dummyProfile.profileImage,
            profileBanner: apiProfile.profileBanner || dummyProfile.profileBanner,
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
  }, []);

  const fetchUserPosts = async (page: number, refresh: boolean): Promise<FetchResult> => {
    try {
      const response = await authenticatedGet(
        `https://safetypin.ppl.cs.ui.ac.id/post/user?postUserId=${profileData.id}&page=${page}&size=${PAGE_SIZE}`
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

  const fetchCommentedPosts = async (page: number, refresh: boolean): Promise<FetchResult> => {
    try {
      const response = await authenticatedGet(
        `https://safetypin.ppl.cs.ui.ac.id/post/user?postUserId=${profileData.id}?page=${page}&size=${PAGE_SIZE}`
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
        };
      });
      const hasMore = response.data ? !response.data.last : posts.length === PAGE_SIZE;
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
          location={item.address ?? 'Nearby'}
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
          currentVote={item.currentVote || 'NONE'}
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
    router.push('/settings/')
  };

  const handleEditPress = () => {
    setIsEditing(true);
    setNewProfilePic(null);
    setNewProfileBanner(null);
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
        'https://safetypin.ppl.cs.ui.ac.id/api/profiles/me',
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
          />
        </View>
        
        <PostsTabs
          tabs={tabsConfig}
          renderItem={renderPostItem}
          contentContainerStyle={styles.postsContent}
        />
      </ScrollView>

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
  postsContent: {
    padding: 4,
    paddingBottom: 60,
    backgroundColor: '#FFFFFF', // Changed from dark to light
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: '#FEFEFE', // Changed from dark to light
    marginBottom: 8,
    paddingVertical: 12,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0', // Changed from dark to light
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
});

export default ProfileScreen;