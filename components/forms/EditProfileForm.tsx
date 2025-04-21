import React, { useState, forwardRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import InputField from "@/components/inputs/InputField";

interface SocialMediaLink {
  instagram?: string;
  twitter?: string;
  line?: string;
  tiktok?: string;
  discord?: string;
}

interface EditProfileFormProps {
  initialData: {
    id: string;
    role: string;
    verified: boolean;
    profilePic?: string;
    profileBanner?: string;
  } & SocialMediaLink;
  onSave: (data: SocialMediaLink) => void;
  onClose: () => void;
  onProfilePicChange: () => void;
  onProfileBannerChange: () => void;
  testID?: string;
}

const EditProfileForm = forwardRef(({
  initialData,
  onSave,
  onClose,
  onProfilePicChange,
  onProfileBannerChange,
  testID,
}: EditProfileFormProps, ref) => {
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink>({
    instagram: initialData.instagram || "",
    twitter: initialData.twitter || "",
    line: initialData.line || "",
    tiktok: initialData.tiktok || "",
    discord: initialData.discord || "",
  });

  const handleInputChange = (field: keyof SocialMediaLink, value: string) => {
    setSocialLinks((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const dataToSave = Object.fromEntries(
      Object.entries(socialLinks)
        .filter(([_, value]) => value.trim() !== '')
        .map(([key, value]) => {
          // Clean the input by removing any URL parts
          const cleanValue = value
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/^instagram\.com\//, '')
            .replace(/^twitter\.com\//, '')
            .replace(/^tiktok\.com\/@?/, '')
            .replace(/^discord\.com\/users\//, '')
            .replace(/^line\.me\/ti\/p\/~/, '')
            .replace(/^@/, '')
            .trim();
          
          return [key, cleanValue];
        })
    ) as SocialMediaLink;
    
    onSave(dataToSave);
  };

  return (
    <SafeAreaView style={styles.safeContainer} testID={testID}>
      {/* Header with Close and Save buttons */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onClose}
        >
          <Text style={styles.headerButtonText}>Close</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Profile</Text>
        
        <TouchableOpacity
          style={[styles.headerButton, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={[styles.headerButtonText, styles.saveButtonText]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <TouchableOpacity 
          onPress={onProfileBannerChange}
          style={styles.bannerContainer}
          testID="profile-banner-button"
        >
          {initialData.profileBanner ? (
            <View style={styles.bannerWrapper}>
              <Image
                source={{ uri: initialData.profileBanner }}
                style={styles.banner}
              />
              <View style={styles.bannerOverlay} />
            </View>
          ) : (
            <View style={[styles.banner, styles.bannerPlaceholder]}>
              <Text style={styles.placeholderText}>Add Banner</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onProfilePicChange}
          style={styles.profilePicContainer}
          testID="profile-pic-button"
        >
          {initialData.profilePic ? (
            <Image
              source={{ uri: initialData.profilePic }}
              style={styles.profilePic}
            />
          ) : (
            <View style={[styles.profilePic, styles.profilePicPlaceholder]}>
              <Text style={styles.placeholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.container}>

          <View style={styles.form}>
            <View>
              <InputField
                label="Instagram"
                placeholder={socialLinks.instagram ?? "username"}
                onChangeText={(text) => handleInputChange("instagram", text)}
                labelColor="#3B080A"
              />
              {socialLinks.instagram && (
                <Text style={styles.linkPreview}>
                  https://instagram.com/{socialLinks.instagram.replace(/^@/, '')}/
                </Text>
              )}
            </View>

            <View>
              <InputField
                label="Twitter"
                placeholder={socialLinks.twitter ?? "username"}
                onChangeText={(text) => handleInputChange("twitter", text)}
                labelColor="#3B080A"
              />
              {socialLinks.twitter && (
                <Text style={styles.linkPreview}>
                  https://twitter.com/{socialLinks.twitter}
                </Text>
              )}
            </View>

            <View>
              <InputField
                label="Line"
                placeholder={socialLinks.line ?? "username"}
                onChangeText={(text) => handleInputChange("line", text)}
                labelColor="#3B080A"
              />
            </View>

            <View>
              <InputField
                label="TikTok"
                placeholder={socialLinks.tiktok ?? "username"}
                onChangeText={(text) => handleInputChange("tiktok", text)}
                labelColor="#3B080A"
              />
              {socialLinks.tiktok && (
                <Text style={styles.linkPreview}>
                  https://tiktok.com/@{socialLinks.tiktok}
                </Text>
              )}
            </View>

            <View>
              <InputField
                label="Discord"
                placeholder={socialLinks.discord ?? "username#1234"}
                onChangeText={(text) => handleInputChange("discord", text)}
                labelColor="#3B080A"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    marginTop: 0,
    marginBottom: 50,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: "5%",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 8,
    borderRadius: 5,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#9F3F3D',
  },
  headerButtonText: {
    fontWeight: 'bold',
    color: '#7F7574',
  },
  saveButtonText: {
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B080A',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#7F7574",
    marginTop: 20,
    marginBottom: 20,
  },
  form: {
    width: "100%",
    marginTop: 20,
  },
  bannerContainer: {
    width: "100%",
    height: 175,
    paddingTop: 0,
    marginBottom: 50,
  },
  banner: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  bannerPlaceholder: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  profilePicContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    zIndex: 1,
    alignSelf: "center",
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profilePicPlaceholder: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#7F7574",
  },
  linkPreview: {
    fontSize: 12,
    color: "#7F7574",
    marginTop: -10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },

  bannerWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 0,
  },
});

export default EditProfileForm;