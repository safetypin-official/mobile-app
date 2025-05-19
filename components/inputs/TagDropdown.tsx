import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import TagSelectorModal from "@/components/inputs/TagSelectorModal";
import { chevronDownIcon } from "@/assets/icons";
import { authenticatedGet } from "@/utils/api";
import { TAG_KEYS } from "@/components/displays/post/ReportTags";

interface TagDropdownProps {
  selectedTag: string;
  onTagChange: (tag: string) => void;
  testID?: string;
  availableTags?: string[]; // Make this optional so existing code still works
}

const TagDropdown: React.FC<TagDropdownProps> = ({ 
  selectedTag, 
  onTagChange, 
  testID = "tag-dropdown",
  availableTags: propAvailableTags
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>(propAvailableTags || []);

  // Fetch tags if not provided through props
  useEffect(() => {
    if (propAvailableTags && propAvailableTags.length > 0) {
      setAvailableTags(propAvailableTags);
    } else {
      fetchTags();
    }
  }, [propAvailableTags]);

  const fetchTags = async () => {
    try {
      const response = await authenticatedGet('https://safetypin.ppl.cs.ui.ac.id/posts/category');
      if (response?.success) {
        setAvailableTags(response.data);
      } else {
        // Add this else clause to handle success:false
        console.error("API returned unsuccessful response");
        setAvailableTags([...TAG_KEYS]);
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
      // Fall back to our defined TAG_KEYS if API fails
      setAvailableTags([...TAG_KEYS]);
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <TouchableOpacity 
        style={styles.dropdown} 
        onPress={() => setModalVisible(true)} 
        testID={`${testID}-button`}
      >
        <Text style={styles.text}>{selectedTag || 'Select a Tag'}</Text>
        <SvgXml xml={chevronDownIcon} width={20} height={20} style={styles.icon} />
      </TouchableOpacity>

      <TagSelectorModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSelectTag={onTagChange} 
        selectedTag={selectedTag}
        availableTags={availableTags}
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
