// app/explore.tsx
import { StyleSheet, View, TouchableOpacity, Text, Modal, TextInput, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type PostType = {
  id: string;
  title: string;
  description: string;
  type: 'bencana' | 'kehilangan' | 'lainnya';
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
};

export default function ExploreScreen() {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [newPost, setNewPost] = useState<Partial<PostType>>({
    title: '',
    description: '',
    type: 'lainnya'
  });
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Load posts from AsyncStorage on component mount
  const loadPosts = async () => {
    try {
      const savedPosts = await AsyncStorage.getItem('posts');
      if (savedPosts) {
        // Parse the JSON and convert timestamp strings back to Date objects
        const parsedPosts = JSON.parse(savedPosts).map((post: any) => ({
          ...post,
          timestamp: new Date(post.timestamp)
        }));
        setPosts(parsedPosts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  // Save posts to AsyncStorage
  const savePosts = async (updatedPosts: PostType[]) => {
    try {
      await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
    } catch (error) {
      console.error('Failed to save posts:', error);
    }
  };

  useEffect(() => {
    // Request location permission and get current position
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();

    // Load saved posts
    loadPosts();
  }, []);

  const handleAddPost = async () => {
    if (!location) return;
    if (!newPost.title || !newPost.description) {
      Alert.alert('Error', 'Judul dan deskripsi harus diisi');
      return;
    }

    try {
      // Create a new post with a unique ID
      const newPostComplete: PostType = {
        id: Date.now().toString(), // Simple ID generation
        title: newPost.title || '',
        description: newPost.description || '',
        type: newPost.type as 'bencana' | 'kehilangan' | 'lainnya',
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        timestamp: new Date(),
      };

      // Add the new post to the posts array
      const updatedPosts = [...posts, newPostComplete];
      setPosts(updatedPosts);
      
      // Save to AsyncStorage
      await savePosts(updatedPosts);

      // Reset form and close modal
      setModalVisible(false);
      setNewPost({ title: '', description: '', type: 'lainnya' });
      Alert.alert('Sukses', 'Post berhasil ditambahkan');
    } catch (error) {
      Alert.alert('Error', 'Gagal menambahkan post');
    }
  };

  const getPinColor = (type: PostType['type']) => {
    switch (type) {
      case 'bencana':
        return 'red';
      case 'kehilangan':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={location}
          showsUserLocation
          showsMyLocationButton
        >
          {posts.map((post) => (
            <Marker
              key={post.id}
              coordinate={post.location}
              pinColor={getPinColor(post.type)}
              onPress={() => {
                setSelectedPost(post);
                setDetailModalVisible(true);
              }}
            />
          ))}
        </MapView>
      )}

      {/* Tombol Tambah Post */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal Form Post Baru */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Laporan Baru</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Judul"
              value={newPost.title}
              onChangeText={(text) => setNewPost({ ...newPost, title: text })}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Deskripsi"
              multiline
              numberOfLines={4}
              value={newPost.description}
              onChangeText={(text) => setNewPost({ ...newPost, description: text })}
            />

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newPost.type === 'bencana' && styles.selectedType
                ]}
                onPress={() => setNewPost({ ...newPost, type: 'bencana' })}
              >
                <Text>Bencana</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newPost.type === 'kehilangan' && styles.selectedType
                ]}
                onPress={() => setNewPost({ ...newPost, type: 'kehilangan' })}
              >
                <Text>Kehilangan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newPost.type === 'lainnya' && styles.selectedType
                ]}
                onPress={() => setNewPost({ ...newPost, type: 'lainnya' })}
              >
                <Text>Lainnya</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleAddPost}
              >
                <Text style={styles.buttonText}>Kirim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Detail Post */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedPost && (
              <>
                <Text style={styles.modalTitle}>{selectedPost.title}</Text>
                <Text style={styles.postType}>{selectedPost.type}</Text>
                <Text style={styles.postDescription}>{selectedPost.description}</Text>
                <Text style={styles.timestamp}>
                  {selectedPost.timestamp.toLocaleString()}
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={() => setDetailModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Tutup</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postType: {
    color: '#666',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  postDescription: {
    marginBottom: 15,
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
});