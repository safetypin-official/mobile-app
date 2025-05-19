// MultiTagSelectorModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { TAG_KEYS } from '@/components/displays/post/ReportTags';
import { getTagInfo } from '@/components/displays/Types';
import { tagModalStyles } from '@/assets/ModalStyles';

interface MultiTagSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTag: (tag: string) => void;
  selectedTags: string[];
  availableTags?: string[];
}

const MultiTagSelectorModal: React.FC<MultiTagSelectorModalProps> = ({
  visible,
  onClose,
  onSelectTag,
  selectedTags,
  availableTags = TAG_KEYS,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Categories</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={availableTags}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = selectedTags.includes(item);
              const tagInfo = getTagInfo(item);
              
              return (
                <TouchableOpacity
                  style={[
                    styles.tagItem,
                    isSelected && {backgroundColor: tagInfo.color}
                  ]}
                  onPress={() => onSelectTag(item)}
                >
                  {isSelected && (
                    <SvgXml xml={tagInfo.icon} width={20} height={20} style={styles.tagIcon} />
                  )}
                  <Text 
                    style={[
                      styles.tagText,
                      isSelected && styles.selectedTagText
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmarkContainer}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.tagsList}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                // Reset all selections by calling onSelectTag for each selected tag
                selectedTags.forEach(tag => onSelectTag(tag));
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.doneButton}
              onPress={onClose}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Combine shared styles with component-specific styles
const styles = StyleSheet.create({
  ...tagModalStyles,
  // Define only the unique styles for MultiTagSelectorModal
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resetButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    width: '48%',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  doneButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#904a47',
    width: '48%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MultiTagSelectorModal;