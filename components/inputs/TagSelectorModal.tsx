import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { TAGS } from '@/assets/TagData';
import { AntDesign } from '@expo/vector-icons';
import Button from '@/components/buttons/Button';

interface TagSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTag: (tag: string) => void;
  selectedTag: string;
  testID?: string;
}

const TagSelectorModal: React.FC<TagSelectorModalProps> = ({ visible, onClose, onSelectTag, selectedTag, testID = "tag-selector-modal"}) => {
  const [tempSelected, setTempSelected] = useState(selectedTag);

  return (
    <Modal visible={visible} animationType="fade" transparent testID={testID}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.header}>Select a Tag</Text>

          {/* Scrollable content */}
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={true}>
            {TAGS.map((item) => {
              const isSelected = item.value === tempSelected;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.item, isSelected && styles.selectedItem]}
                  onPress={() => setTempSelected(item.value)}
                >
                  <SvgXml xml={item.icon} width={24} height={24} />
                  <Text style={styles.label}>{item.label}</Text>
                  {isSelected && <AntDesign name="checkcircle" size={20} color="#904a47" style={styles.checkmark} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Button Container */}
          <View style={styles.buttonContainer}>
            <Button
              onPress={() => {
                onSelectTag(tempSelected);
                onClose();
              }}
            >
              Confirm
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    width: '80%',
    maxHeight: '80%',
  },
  scrollContainer: {
    maxHeight: 300,
    width: '100%',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#904a47',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    width: '100%',
    borderRadius: 8,
  },
  selectedItem: {
    backgroundColor: '#f2e2e1',
  },
  label: {
    fontSize: 16,
    color: '#904a47',
    flex: 1,
    marginLeft: 10,
  },
  checkmark: {
    marginLeft: 'auto',
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
});

export default TagSelectorModal;
