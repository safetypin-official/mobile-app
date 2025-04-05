import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import Button from "@/components/buttons/Button";
import { TAGS as TAG_OBJECTS } from "@/assets/TagData"; // Adjust path if needed


interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (selectedTags: string[]) => void;
  initialSelectedTags: string[];
}

const TAGS = ["All", ...TAG_OBJECTS.map(tag => tag.label)];
  
const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onSave, initialSelectedTags }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);

  useEffect(() => {
    setSelectedTags(initialSelectedTags);
  }, [initialSelectedTags]);

  const toggleTag = (tag: string) => {
    let updatedTags;
    if (tag === "All") {
      updatedTags = selectedTags.includes("All") ? [] : [...TAGS];
    } else {
      updatedTags = selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag && t !== "All")
        : [...selectedTags, tag];

      if (updatedTags.length === TAGS.length - 1) {
        updatedTags = [...TAGS]; // Select all if all except "All" are selected
      }
    }
    
    setSelectedTags(updatedTags);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Filter by Tag</Text>
          <ScrollView style={styles.scrollView}>
            {TAGS.map((tag) => (
              <TouchableOpacity key={tag} onPress={() => toggleTag(tag)} style={styles.tagItem}>
                <View style={styles.checkbox}>
                  {selectedTags.includes(tag) && <View style={styles.checkedBox} testID={`checkedBox-${tag}`} />}
                </View>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <View>
                <Button style={styles.closeButton} onPress={onClose} testID="filter-modal-close-button">Close</Button>
            </View>
            <View>
                <Button onPress={() => onSave(selectedTags)} testID="filter-modal-save-button">Save</Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scrollView: {
    maxHeight: 200,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    width: 12,
    height: 12,
    backgroundColor: "#333",
  },
  tagText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  closeButton: {
    backgroundColor: "#bbbbbb",
    borderRadius: 16,
  },
});

export default FilterModal;
