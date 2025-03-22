import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Tag {
  id: string;
  label: string;
  color: string;
}

const TAGS: Tag[] = [
  { id: 'lost_item', label: 'Lost Item', color: '#9b2c2c' },
  { id: 'found_item', label: 'Found Item', color: '#38a169' },
  { id: 'theft', label: 'Theft', color: '#4a4a4a' },
  { id: 'harassment', label: 'Harassment', color: '#9b2c2c' },
  { id: 'flood', label: 'Flood', color: '#3182ce' },
  { id: 'assault', label: 'Assault', color: '#9b2c2c' },
  { id: 'fire', label: 'Fire', color: '#e53e3e' },
  { id: 'other_natural_disasters', label: 'Other Natural Disasters', color: '#553c3c' },
  { id: 'earthquake', label: 'Earthquake', color: '#b7791f' },
  { id: 'other_crime', label: 'Other Crime', color: '#4a4a4a' },
];

interface TagSelectorProps {
  selectedTags: string[];
  onTagChange: (tags: string[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onTagChange }) => {
  const toggleTag = (tagId: string) => {
    const updatedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((t) => t !== tagId)
      : [...selectedTags, tagId];

    onTagChange(updatedTags);
  };

  return (
    <View style={styles.container}>
      {TAGS.map((tag) => (
        <TouchableOpacity
          key={tag.id}
          style={[
            styles.tag,
            { backgroundColor: selectedTags.includes(tag.id) ? tag.color : '#ddd' },
          ]}
          onPress={() => toggleTag(tag.id)}
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
    gap: 8 },
  tag: {
    padding: 10,
    borderRadius: 8,
    margin: 5 },
  tagText: {
    color: 'white',
    fontWeight: 'bold'},
});

export default TagSelector;
