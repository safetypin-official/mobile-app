import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import TagSelectorModal from '@/components/inputs/TagSelectorModal';
import { chevronDownIcon } from '@/assets/icons'; // Import the SVG

interface TagDropdownProps {
  selectedTag: string;
  onTagChange: (value: string) => void;
  testID?: string;
}

const TagDropdown: React.FC<TagDropdownProps> = ({ selectedTag, onTagChange, testID = "tag-dropdown"}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container} testID={testID}>
      <TouchableOpacity style={styles.dropdown} onPress={() => setModalVisible(true)} testID={`${testID}-button`}>
        <Text style={styles.text}>{selectedTag || 'Select a Tag'}</Text>
        <SvgXml xml={chevronDownIcon} width={20} height={20} style={styles.icon} />
      </TouchableOpacity>

      <TagSelectorModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSelectTag={onTagChange} 
        selectedTag={selectedTag}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: "100%",
  },
  dropdown: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E8D6D4",
    padding: 12,
    borderRadius: 12,
  },
  text: {
    fontSize: 16,
    color: "#904a47",
    fontWeight: "bold",
  },
  icon: {
    marginLeft: 8,
  },
});

export default TagDropdown;
