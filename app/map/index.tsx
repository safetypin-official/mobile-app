import { StyleSheet, View, Dimensions, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE, MapPressEvent, LongPressEvent, Marker, Callout } from 'react-native-maps';
import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import NearbyReport, { Post } from '@/components/displays/NearbyReport';
import Pin from '@/components/displays/Pin';
import { router } from 'expo-router';
import { authenticatedGet } from '@/utils/api'; // Add this import

const { width, height } = Dimensions.get('window');

type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

// Default location
const DEFAULT_LOCATION = {
  latitude: -6.2088,
  longitude: 106.8456,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function ExploreScreen() {
  const [location, setLocation] = useState<LocationType>(DEFAULT_LOCATION);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showReport, setShowReport] = useState<boolean>(false);
  
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fetch user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let locationData = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Unable to get current location');
      }
    })();
  }, []);

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Use authenticatedGet instead of direct fetch
        const responseData = await authenticatedGet('https://safetypin.ppl.cs.ui.ac.id/post/all');
        console.log('Fetched posts response:', responseData);
        
        if (responseData.success && responseData.data?.content) {
          // Access the posts array from data.content
          const postsData = responseData.data.content;
          console.log('Posts content:', postsData);
          
          // The posts already have category as a string based on the new format
          setPosts(postsData);
        } else {
          throw new Error('Invalid response format or empty data');
        }
        setFetchError(null);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setFetchError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [refreshTrigger]); // Add refreshTrigger as a dependency

  // Function to refresh posts
  const refreshPosts = useCallback(() => {
    setPosts([]);
    setFetchError(null);
    // Increment the refreshTrigger to retrigger the useEffect
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleMapPress = (event: MapPressEvent) => {
    console.log('Position pressed:', {
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude
    });
    // Close report view when map is pressed
    if (showReport) {
      setShowReport(false);
    }
  };

  const onLongPress = (event: LongPressEvent) => {
    console.log('Long press detected at:', {
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude
    });
    router.push({
      pathname: '/createPost',
      params: {
        latitude: event.nativeEvent.coordinate.latitude,
        longitude: event.nativeEvent.coordinate.longitude,
      },
    });
  };

  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Handle marker press
  const handleMarkerPress = (postId: string) => {
    console.log('Marker pressed, post ID:', postId);
    
    // Find post in local data first
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setShowReport(true);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={location}
        showsUserLocation
        showsMyLocationButton
        onPress={handleMapPress}
        onLongPress={onLongPress}
      >
        {posts.map((post) => (
          <Marker
            key={post.id}
            coordinate={{
              latitude: post.latitude,
              longitude: post.longitude
            }}
            onPress={() => handleMarkerPress(post.id)}
          >
            <Pin 
              type={post.category} 
              onPress={() => {}} 
              width={36} 
              height={36}
            />
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{post.title}</Text>
                <Text style={styles.calloutCategory}>{post.category}</Text>
                <Text style={styles.calloutCaption}>{post.caption}</Text>
                <Text style={styles.calloutDate}>{formatDate(post.createdAt)}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Using updated NearbyReport component */}
      {showReport && selectedPost && (
        <View style={styles.reportOverlay}>
          <View style={styles.reportHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowReport(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <NearbyReport
            // Pass the selected post as initialPost according to new interface
            initialPost={selectedPost}
            onClose={() => setShowReport(false)}
          />
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      )}

      {fetchError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{fetchError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={refreshPosts}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {errorMsg && (
        <View style={styles.debugOverlay}>
          <Text style={styles.debugText}>{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    zIndex: 1,
  },
  calloutContainer: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  calloutCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  calloutCaption: {
    fontSize: 14,
    marginBottom: 5,
  },
  calloutDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  debugOverlay: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  debugText: {
    color: 'white',
    fontSize: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 20,
    borderRadius: 10,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 2,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorOverlay: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 10,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 2,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Report overlay styles
  reportOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 3,
    maxHeight: '100%', // Show only partial height to keep the map visible
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#f8f8f8',
  },
  closeButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  }
});