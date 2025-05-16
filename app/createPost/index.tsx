import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { 
    View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import Entypo from '@expo/vector-icons/Entypo';
import Button from '@/components/buttons/Button';
import InputField from '@/components/inputs/InputField';
import TagSelector from '@/components/inputs/TagSelector';
import { router, useLocalSearchParams } from 'expo-router';
import { authenticatedPost } from '@/utils/api';
import Config from "react-native-config";
import * as Sentry from '@sentry/react-native';

const API_KEY = Config.GOOGLE_MAPS_API_KEY;

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
    // Get parameters from the URL or navigation state
    const params = useLocalSearchParams();
    
    // Initialize location state with passed parameters if available
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
            params.latitude && params.longitude 
                ? { 
                    latitude: typeof params.latitude === 'string' ? parseFloat(params.latitude) : Number(params.latitude), 
                    longitude: typeof params.longitude === 'string' ? parseFloat(params.longitude) : Number(params.longitude) 
                  }
                : null
        );
    
    // New state for storing the address from reverse geocoding
    const [address, setAddress] = useState<string>('Fetching address...');
    const [isLoadingAddress, setIsLoadingAddress] = useState<boolean>(false);
    
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    // Add these handler functions for setting text with limits
    const handleTitleChange = (text: string) => {
        setTitle(text);
    };

    const handleDescriptionChange = (text: string) => {
        setDescription(text);
    };

    // Function to fetch address using Google Maps Geocoding API
    const fetchAddress = async (latitude: number, longitude: number) => {
        setIsLoadingAddress(true);
        try {
            const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;
            
            const response = await fetch(geocodingUrl);
            const data = await response.json();
            
            if (data.status === 'OK' && data.results && data.results.length > 0) {
                // Use the first result which is typically the most specific
                setAddress(data.results[0].formatted_address);
            } else {
                setAddress('Address not found');
                console.log('Geocoding API response:', data);
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            setAddress('Failed to fetch address');
        } finally {
            setIsLoadingAddress(false);
        }
    };

    useEffect(() => {
        // Only fetch current location if no location was passed
        if (!location) {
            (async () => {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Permission to access location was denied');
                    return;
                }

                let loc = await Location.getCurrentPositionAsync({});
                const newLocation = {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                };
                setLocation(newLocation);
                
                // Fetch address once we have the location
                fetchAddress(newLocation.latitude, newLocation.longitude);
            })();
        } else {
            // If we already have a location (e.g., from params), fetch the address
            fetchAddress(location.latitude, location.longitude);
        }
    }, [location?.latitude, location?.longitude]);

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

    // Function to get presigned URL from backend - Now with authentication
    const getPresignedUrl = async (fileType: string): Promise<string | null> => {
        try {
            const response = await authenticatedPost('https://safetypin.ppl.cs.ui.ac.id/post/s3/presigned-url', {
                fileType: fileType
            });

            console.log('Presigned URL response:', response.url);
            
            return response.url;
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

    const handleSubmitMonitoring = async () => {
        Sentry.startSpan({ name: 'report_incident' }, async (span) => {
            try {
              // Your logic here (e.g., API call)
              await handleSubmit();
          
              // Optional: add attributes to the span
              span.setAttribute('status', 'success');
            } catch (error) {
              span.setAttribute('status', 'error');
              Sentry.captureException(error);
            }
          });
    }

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
    
    // Update the submitPost function too
    const submitPost = (imageUrl: string | null) => {
        // Create the post data with the category as a string and add the address
        const postData = {
            Title: title,
            Caption: description,
            Latitude: location?.latitude ?? 0,
            Longitude: location?.longitude ?? 0,
            Address: address, // Include the address in the post data
            Category: selectedTag,
            imageUrl: imageUrl
        };
        
        console.log('Submitting post data:', postData);
        
        // Use authenticatedPost for the post creation
        authenticatedPost('https://safetypin.ppl.cs.ui.ac.id/posts', postData)
            .then(data => {
                console.log('Post created successfully:', data);
                Alert.alert("Success", "Your report has been posted successfully", [
                    { text: "OK", onPress: handleClose }
                ]);
            })
            .catch((error) => {
                console.error('Error creating post:', error);
                Alert.alert(
                    "Error", 
                    `Failed to create post: ${error.message}`, 
                    [{ text: "OK" }]
                );
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
                    <Button onPress={handleSubmitMonitoring} testID="submit-button">
                        {isUploading ? "Uploading..." : "Post"}
                    </Button>
                </View>
            </View>

            <ScrollView 
                style={styles.scroll} 
                contentContainerStyle={{ 
                    flexGrow: 1,
                    paddingBottom: 100 // Add significant bottom padding
                }} 
                testID="scroll-container">
                <View style={styles.inputSection} testID="location-section">
                    <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
                    
                    {/* New address display */}
                    <View style={styles.addressContainer} testID="address-container">
                        {isLoadingAddress ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#904a47" />
                                <Text style={styles.loadingText}>Fetching address...</Text>
                            </View>
                        ) : (
                            <Text style={styles.addressText} testID="address-text">{address}</Text>
                        )}
                    </View>
                    
                    {/* Still show coordinates for reference */}
                    <Text style={styles.coordsText} testID="latitude-text">
                        Latitude: {location?.latitude ?? 'Fetching...'}
                    </Text>
                    <Text style={styles.coordsText} testID="longitude-text">
                        Longitude: {location?.longitude ?? 'Fetching...'}
                    </Text>
                </View>

                <View style={styles.inputSection}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
                        <Text style={styles.charCount}>{title.length}/70</Text>
                    </View>
                    <InputField 
                        placeholder="Enter title" 
                        labelColor='#904a47' 
                        onChangeText={handleTitleChange}
                        value={title}
                        maxLength={70}
                        testID="input-title"
                    />
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>Tags <Text style={styles.required}>*</Text></Text>
                    <TagSelector 
                        selectedTag={selectedTag} 
                        onTagChange={setSelectedTag} 
                        testID="tag-selector"
                    />
                </View>

                <View style={styles.inputSection}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
                        <Text style={styles.charCount}>{description.length}/200</Text>
                    </View>
                    <InputField 
                        placeholder="Enter description" 
                        multiline 
                        labelColor='#904a47' 
                        onChangeText={handleDescriptionChange}
                        value={description}
                        maxLength={200}
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
    required: {
        color: '#d9534f',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addressContainer: {
        backgroundColor: '#f9f1f1',
        padding: 12,
        borderRadius: 6,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e6d0d0',
    },
    addressText: {
        color: '#3b080a',
        fontSize: 14,
        lineHeight: 20,
    },
    coordsText: {
        color: "#904a47",
        fontSize: 12,
        opacity: 0.8,
        marginTop: 2,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingText: {
        color: '#904a47',
        marginLeft: 8,
        fontSize: 14,
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
    charCount: {
        color: "#904a47",
        fontSize: 12,
        textAlign: "right",
        marginTop: 4,
        opacity: 0.7,
    },
});

export default PostPage;