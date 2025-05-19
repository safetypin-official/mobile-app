import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { TAG_KEYS } from '@/components/displays/post/ReportTags';
import { getTagInfo } from '@/components/displays/Types';
import { tagModalStyles } from '@/assets/ModalStyles';

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

const styles = tagModalStyles;

export default TagSelectorModal;
