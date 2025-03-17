import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Tag {
  id: string;
  label: string;
  color: string;
}

export const TAGS: Tag[] = [
  { id: '1b779770-6f91-426b-b3dc-463d7f323289', label: 'Lost Item', color: '#9b2c2c' },
  { id: '25514861-2c66-4f3a-8d93-8725a2b881b8', label: 'Found Item', color: '#38a169' },
  { id: '1899e1c1-587b-408f-a19d-19e20141901e', label: 'Theft', color: '#4a4a4a' },
  { id: 'b0112f3c-592d-4e9b-b6a6-95ca6c8a2162', label: 'Harassment', color: '#9b2c2c' },
  { id: '02bbc663-8a85-4d5c-a499-3ce42721beb3', label: 'Flood', color: '#3182ce' },
  { id: '00af1921-4328-4f5c-a6e6-8da62881accc', label: 'Assault', color: '#9b2c2c' },
  { id: 'f55115e5-d775-40f2-9c80-05168497af69', label: 'Fire', color: '#e53e3e' },
  { id: '001f9419-afc2-4a9a-93d1-f37df4594934', label: 'Other Natural Disasters', color: '#553c3c' },
  { id: '85c30371-47f3-4975-9ec6-8ae87444b489', label: 'Earthquake', color: '#b7791f' },
  { id: '32f21fa7-ca4f-4dbe-9e2c-97d37273dcbb', label: 'Other Crime', color: '#4a4a4a' },
];

interface TagSelectorProps {
  selectedTag: string | null;
  onTagChange: (tagId: string | null) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTag, onTagChange }) => {
  const selectTag = (tagId: string) => {
    // If the tag is already selected, deselect it
    if (selectedTag === tagId) {
      onTagChange(null);
    } else {
      // Otherwise select the new tag
      onTagChange(tagId);
    }
  };

  // Find the selected tag object to get its name
  const getSelectedTagName = (): string | null => {
    if (!selectedTag) return null;
    const tag = TAGS.find(t => t.id === selectedTag);
    return tag ? tag.label : null;
  };

  return (
    <View style={styles.container}>
      {TAGS.map((tag) => (
        <TouchableOpacity
          key={tag.id}
          style={[
            styles.tag,
            { backgroundColor: selectedTag === tag.id ? tag.color : '#ddd' },
          ]}
          onPress={() => selectTag(tag.id)}
        >
          <Text style={styles.tagText}>{tag.label}</Text>
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
});

export default TagSelector;