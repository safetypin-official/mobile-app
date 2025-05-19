import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { TAG_KEYS } from '@/components/displays/post/ReportTags';
import { getTagInfo } from '@/components/displays/Types';

interface TagSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTag: (tag: string) => void;
  selectedTag: string;
  availableTags?: string[];
}

const TagSelectorModal: React.FC<TagSelectorModalProps> = ({
  visible,
  onClose,
  onSelectTag,
  selectedTag,
  availableTags = TAG_KEYS,
}) => {
  // Handle selecting a tag
  const handleSelectTag = (tag: string) => {
    onSelectTag(tag);
    onClose();
  };

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
            <Text style={styles.title}>Select Category</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={availableTags}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = selectedTag === item;
              const tagInfo = getTagInfo(item);
              
              return (
                <TouchableOpacity
                  style={[
                    styles.tagItem,
                    isSelected && {backgroundColor: tagInfo.color}
                  ]}
                  onPress={() => handleSelectTag(item)}
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#555',
  },
  tagsList: {
    padding: 16,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  tagIcon: {
    marginRight: 10,
  },
  tagText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  selectedTagText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default TagSelectorModal;
