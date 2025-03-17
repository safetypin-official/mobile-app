import { StyleSheet, View, Dimensions, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE, MapPressEvent, LongPressEvent, Marker, Callout } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import NearbyReport from '@/app/nearbyReport'; // Import NearbyReport component

const { width, height } = Dimensions.get('window');

type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

// Post type definition based on provided data
type Category = {
  id: string;
  name: string;
};

type Post = {
  id: string;
  caption: string;
  createdAt: string;
  postedBy: string | null;
  title: string;
  category: Category;
  latitude: number;
  longitude: number;
};

// Default location
const DEFAULT_LOCATION = {
  latitude: -6.2088,
  longitude: 106.8456,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Function to get marker color based on category
const getCategoryColor = (categoryName: string): string => {
  switch (categoryName) {
    case 'Lost Item':
    case 'Lost Book':
    case 'Lost Pet':
      return '#FF5252'; // Red for lost items
    case 'Found Item':
      return '#4CAF50'; // Green for found items
    case 'Infrastructure Issue':
      return '#FFC107'; // Yellow for infrastructure issues
    case 'Crime Watch':
      return '#9C27B0'; // Purple for crime alerts
    case 'Service Issue':
      return '#2196F3'; // Blue for service issues
    default:
      return '#757575'; // Gray for others
  }
};

export default function ExploreScreen() {
  const [location, setLocation] = useState<LocationType>(DEFAULT_LOCATION);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // State for selected post and report view
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showReport, setShowReport] = useState<boolean>(false);

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
        const response = await fetch('http://10.0.2.2/post/all');
        
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched posts:', data);
        setPosts(data);
        setFetchError(null);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setFetchError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
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
  };

  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Fetch post detail by ID
  const fetchPostDetail = async (postId: string) => {
    try {
      const response = await fetch(`http://10.0.2.2/post/${postId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched post detail:', data);
      setSelectedPost(data);
      setShowReport(true);
    } catch (error) {
      console.error('Error fetching post detail:', error);
      alert('Failed to load post details. Please try again later.');
    }
  };

  // Handle marker press
  const handleMarkerPress = (postId: string) => {
    console.log('Marker pressed, post ID:', postId);
    
    // Find post in local data first
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setShowReport(true);
    } else {
      // If not found locally, fetch from server
      fetchPostDetail(postId);
    }
  };

  // Convert tags for NearbyReport component
  const getCategoryTags = (category: Category): string[] => {
    return [category.name];
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
            pinColor={getCategoryColor(post.category.name)}
            onPress={() => handleMarkerPress(post.id)}
          >
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{post.title}</Text>
                <Text style={styles.calloutCategory}>{post.category.name}</Text>
                <Text style={styles.calloutCaption}>{post.caption}</Text>
                <Text style={styles.calloutDate}>{formatDate(post.createdAt)}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Using NearbyReport component instead of a Modal */}
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
            // Custom props for NearbyReport to handle the selected post
            key={selectedPost.id}
            post={selectedPost}
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
            onPress={() => {
              setPosts([]);
              setFetchError(null);
              setLoading(true);
              // Re-trigger the useEffect
              fetch('http://10.0.2.2/post/all')
                .then(response => response.json())
                .then(data => {
                  setPosts(data);
                  setLoading(false);
                })
                .catch(error => {
                  console.error('Error retrying fetch:', error);
                  setFetchError('Failed to load posts. Please try again later.');
                  setLoading(false);
                });
            }}
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