import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { 
    View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Image, Alert
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import Entypo from '@expo/vector-icons/Entypo';
import Button from '@/components/buttons/Button';
import InputField from '@/components/inputs/InputField';
import TagSelector from '@/components/inputs/TagSelector';
import { router } from 'expo-router';

export const getFileExtension = (uri: string): string => {
    const fileName = uri.split('/');
    const endpoint = fileName.pop();
    const parts = endpoint!.split('.');

    // Ensure there is a valid extension after a dot
    if (parts.length > 1) {
        console.log('File extension:', parts[parts.length - 1]);
        return parts[parts.length - 1];
    }

    return 'jpeg'; // Default to "jpeg" if no valid extension exists
};

const PostPage = () => {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
        })();
    }, []);

    const handleClose = () => {
        router.replace('/map');
    };

    const handleImagePick = () => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log("User cancelled image picker");
            } else if (response.errorMessage) {
                console.log("ImagePicker Error: ", response.errorMessage);
            } else {
                const uri = response.assets?.[0]?.uri;
                if (uri) {
                    setImageUri(uri);
                    console.log("Selected Image URI:", uri);
                }
            }
        });
    };

    // Function to get presigned URL from backend
    const getPresignedUrl = async (fileType: string): Promise<string | null> => {
        try {
            const response = await fetch('http://10.0.2.2/post/s3/presigned-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileType: fileType
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to get presigned URL: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Received presigned URL:', data.url);
            return data.url;
        } catch (error) {
            console.error('Error getting presigned URL:', error);
            return null;
        }
    };

    // Function to upload image to S3
    const uploadImageToS3 = async (imageUri: string): Promise<string | null> => {
        
        setIsUploading(true);
        
        try {
            // Get file extension and type
            const fileExt = getFileExtension(imageUri);
            const fileType = fileExt === 'jpg' ? 'jpeg' : fileExt;
            
            // Get presigned URL
            const presignedUrl = await getPresignedUrl(fileType);
            if (!presignedUrl) {
                throw new Error('Failed to get presigned URL');
            }
            
            // Upload to S3
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
            
            // Extract S3 URL (remove query parameters)
            const s3Url = presignedUrl.split('?')[0];
            console.log('Upload successful:', s3Url);
            
            return s3Url;
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedTag) {
            Alert.alert("Missing Information", "Please select at least one category");
            return;
        }
        
        if (!title.trim()) {
            Alert.alert("Missing Information", "Please enter a title");
            return;
        }
        
        // Upload image first if available
        let uploadedImageUrl = null;
        if (imageUri) {
            uploadedImageUrl = await uploadImageToS3(imageUri);
            if (!uploadedImageUrl && imageUri) {
                // If upload failed but image was selected, show error
                Alert.alert("Upload Error", "Failed to upload image. Do you want to continue without an image?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Continue", onPress: () => submitPost(null) }
                ]);
                return;
            }
        }
        
        // Submit post with or without image
        submitPost(uploadedImageUrl);
    };
    
    const submitPost = (imageUrl: string | null) => {
        // Create the post data with the category as a string
        const postData = {
            title: title,
            caption: description,
            latitude: location?.latitude ?? 0,
            longitude: location?.longitude ?? 0,
            category: selectedTag, // Now passing the category directly as a string
            imageUrl: imageUrl
        };
        
        console.log('Submitting post data:', postData);
        
        // Submit the post directly
        fetch('http://10.0.2.2/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        })
            .then(response => {
                console.log('Server response:', response);
                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Post created successfully:', data);
                Alert.alert("Success", "Your report has been posted successfully", [
                    { text: "OK", onPress: handleClose }
                ]);
            })
            .catch((error) => {
                console.error('Error creating post:', error);
                Alert.alert("Error", "Failed to create post. Please try again.");
            });
    };

    return (
        <SafeAreaView style={styles.container} testID="post-page">
            <View style={styles.top} testID="top-section">
                <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 8 }}>
                    <TouchableOpacity onPress={handleClose} testID="close-button">
                        <Entypo name="cross" size={24} color="#3b080a" />
                    </TouchableOpacity>
                    <Text style={styles.header}>New Report</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 8, maxWidth: 80 }}>
                    <Button onPress={handleSubmit} testID="submit-button">
                        {isUploading ? "Uploading..." : "Post"}
                    </Button>
                </View>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={{ flexGrow: 1 }} testID="scroll-container">
                <View style={styles.inputSection} testID="location-section">
                    <Text style={styles.label}>Location</Text>
                    <Text style={styles.paragraph} testID="latitude-text">Latitude: {location?.latitude ?? 'Fetching...'}</Text>
                    <Text style={styles.paragraph} testID="longitude-text">Longitude: {location?.longitude ?? 'Fetching...'}</Text>
                </View>

                <View style={styles.inputSection}>
                    <InputField 
                        label="Title" 
                        placeholder="Enter title" 
                        labelColor='#904a47' 
                        onChangeText={setTitle}
                        testID="input-title"
                    />
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>Tags</Text>
                    <TagSelector 
                        selectedTag={selectedTag} 
                        onTagChange={setSelectedTag} 
                        testID="tag-selector"
                    />
                </View>

                <View style={styles.inputSection}>
                    <InputField 
                        label="Description" 
                        placeholder="Enter description" 
                        multiline 
                        labelColor='#904a47' 
                        onChangeText={setDescription}
                        testID="input-description"
                    />
                </View>

                <View style={styles.inputSection} testID="attachments-section">
                    <Text style={styles.label}>Attachments</Text>
                    <TouchableOpacity 
                        onPress={handleImagePick} 
                        style={styles.attachmentButton}
                        disabled={isUploading}
                        testID="image-picker-button"
                    >
                        <Entypo name="attachment" size={18} color="#fff" />
                        <Text style={styles.attachmentText}>
                            {isUploading ? "Uploading..." : "Select Image"}
                        </Text>
                    </TouchableOpacity>
                    {imageUri && (
                        <View style={styles.imageContainer} testID="image-container">
                            <Image 
                                source={{ uri: imageUri }} 
                                style={styles.imagePreview} 
                                testID="image-preview"
                            />
                            {!isUploading && (
                                <TouchableOpacity 
                                    style={styles.removeButton}
                                    onPress={() => setImageUri(null)}
                                    testID="remove-image-button"
                                >
                                    <Entypo name="cross" size={18} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 8,
        marginHorizontal: 8,
    },
    scroll: {
        marginHorizontal: 8,
    },
    top: {
        marginVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#3b080a",
        marginLeft: 8,
    },
    label: {
        marginBottom: 6,
        fontSize: 16,
        fontWeight: "bold",
        color: "#904a47",
    },
    paragraph: {
        color: "#904a47",
    },
    inputSection: {
        marginBottom: 12,
        width: "100%",
    },
    attachmentButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#904a47",
        padding: 10,
        borderRadius: 6,
        justifyContent: "center",
        marginTop: 8,
    },
    attachmentText: {
        color: "#fff",
        marginLeft: 8,
        fontSize: 16,
        fontWeight: "bold",
    },
    imageContainer: {
        position: 'relative',
        marginTop: 8,
    },
    imagePreview: {
        width: "100%",
        height: 200,
        borderRadius: 6,
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(139, 0, 0, 0.7)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PostPage;