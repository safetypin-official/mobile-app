import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { authenticatedGet } from '@/utils/api'; // Add this import

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: string[]; // Updated to match new response format (array of strings)
}

const TAG_COLORS = [
  '#9b2c2c', '#38a169', '#4a4a4a', '#3182ce', 
  '#e53e3e', '#553c3c', '#b7791f', '#805ad5',
  '#dd6b20', '#2c7a7b'
];

interface TagSelectorProps {
  selectedTag: string | null;
  onTagChange: (tagId: string | null) => void;
  testID?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTag, onTagChange, testID }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch tags from API when component mounts
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      
      // Replace direct fetch with authenticatedGet
      const response = await authenticatedGet('https://safetypin.ppl.cs.ui.ac.id/posts/category');
      
      if (response.success) {
        // Map string array to Tag format, using the string as both id and name
        // Assign colors based on index
        const tagsWithColors = response.data.map((categoryName: string, index: number) => ({
          id: categoryName, // Using the category name as ID
          name: categoryName,
          color: TAG_COLORS[index % TAG_COLORS.length]
        }));
        
        setTags(tagsWithColors);
        setError(null);
      } else {
        setError(response.message ?? 'Failed to fetch tags');
      }
    } catch (err: any) {
      setError('Error connecting to the server');
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectTag = (tagId: string) => {
    // If the tag is already selected, deselect it
    if (selectedTag === tagId) {
      onTagChange(null);
    } else {
      // Otherwise select the new tag
      onTagChange(tagId);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer} testID={testID ? `${testID}-loading` : "tag-selector-loading"}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading tags...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer} testID={testID ? `${testID}-error` : "tag-selector-error"}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchTags}
          testID={testID ? `${testID}-retry` : "tag-selector-retry"}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID ?? "tag-selector"}>
      {tags.map((tag) => (
        <TouchableOpacity
          key={tag.id}
          style={[
            styles.tag,
            { backgroundColor: selectedTag === tag.id ? tag.color : '#ddd' },
          ]}
          onPress={() => selectTag(tag.id)}
          testID={`${testID ?? "tag-selector"}-tag-${tag.id}`}
        >
          <Text style={styles.tagText}>{tag.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    padding: 10,
    borderRadius: 8,
    margin: 5,
  },
  tagText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#e53e3e',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#3182ce',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TagSelector;