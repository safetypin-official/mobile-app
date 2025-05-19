import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from "react-native";
import Button from "@/components/buttons/Button";
import DatePickerInput from "@/components/inputs/DatePickerInput";
import MultiTagSelectorModal from "@/components/inputs/MultiTagSelectorModal";
import { authenticatedGet } from "@/utils/api";
import { TAG_KEYS } from "@/components/displays/post/ReportTags";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (filters: {
    selectedTags: string[];
    fromDate: string;
    toDate: string;
  }) => void;
  initialSelectedTags: string[];
  initialFromDate?: Date | null;
  initialToDate?: Date | null;
  testID?: string;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSelectedTags,
  initialFromDate = null,
  initialToDate = null,
  testID = "filter-modal"
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagModalVisible, setTagModalVisible] = useState(false);

  // Get current date
  const today = new Date();
  
  // Validate initialFromDate and initialToDate
  const isValidDate = (date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  };
  
  const validInitialFromDate = initialFromDate && isValidDate(initialFromDate) ? initialFromDate : today;
  const validInitialToDate = initialToDate && isValidDate(initialToDate) ? initialToDate : today;
  
  // Date state for "From"
  const [fromYear, setFromYear] = useState<number>(validInitialFromDate.getFullYear());
  const [fromMonth, setFromMonth] = useState<number>(validInitialFromDate.getMonth() + 1);
  const [fromDay, setFromDay] = useState<number>(validInitialFromDate.getDate());

  // Date state for "To"
  const [toYear, setToYear] = useState<number>(validInitialToDate.getFullYear());
  const [toMonth, setToMonth] = useState<number>(validInitialToDate.getMonth() + 1);
  const [toDay, setToDay] = useState<number>(validInitialToDate.getDate());

  useEffect(() => {
    setSelectedTags(initialSelectedTags);
  }, [initialSelectedTags]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await authenticatedGet('https://safetypin.ppl.cs.ui.ac.id/posts/category');
      if (response?.success) {
        setAvailableTags(response.data);
      } else {
        // If API returns success: false or malformed response
        console.error("API returned unsuccessful response");
        setAvailableTags([...TAG_KEYS]);
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
      // Fall back to our defined TAG_KEYS if API fails
      setAvailableTags([...TAG_KEYS]);
    }
  };

  const handleAddTag = (tag: string) => {
    setSelectedTags((prev) => [...prev, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  // Helper to format date as yyyy-MM-dd
  const formatDate = (year: number, month: number, day: number): string => {
    const mm = month < 10 ? `0${month}` : month;
    const dd = day < 10 ? `0${day}` : day;
    return `${year}-${mm}-${dd}`;
  };

  const handleSave = () => {
    const fromDateStr = formatDate(fromYear, fromMonth, fromDay);
    const toDateStr = formatDate(toYear, toMonth, toDay);
    onSave({ selectedTags, fromDate: fromDateStr, toDate: toDateStr });
  };

  // Function to check if there's anything to reset
  const canReset = (): boolean => {
    // Check if there are any selected tags
    const hasSelectedTags = selectedTags.length > 0;
    
    // Check if dates are different from today's date
    const today = new Date();
    const isDefaultFromDate = 
      fromYear === today.getFullYear() && 
      fromMonth === today.getMonth() + 1 && 
      fromDay === today.getDate();
    
    const isDefaultToDate = 
      toYear === today.getFullYear() && 
      toMonth === today.getMonth() + 1 && 
      toDay === today.getDate();
    
    return hasSelectedTags || !isDefaultFromDate || !isDefaultToDate;
  };

  // Reset function
  const handleReset = () => {
    setSelectedTags([]);
    
    // Reset dates to today
    const today = new Date();
    setFromYear(today.getFullYear());
    setFromMonth(today.getMonth() + 1);
    setFromDay(today.getDate());
    
    setToYear(today.getFullYear());
    setToMonth(today.getMonth() + 1);
    setToDay(today.getDate());
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent} testID={testID}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Filter</Text>
            <TouchableOpacity style={styles.closeIcon} onPress={onClose} testID="filter-modal-close-button">
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.tagDropdownContainer}>
              <TouchableOpacity 
                style={styles.tagSelector}
                onPress={() => setTagModalVisible(true)}
                testID="tag-selector-button"
              >
                <Text style={styles.tagSelectorText}>
                  {selectedTags.length ? `${selectedTags.length} categories selected` : 'Select Categories'}
                </Text>
                <Text style={styles.chevronIcon}>▼</Text>
              </TouchableOpacity>
              
              <MultiTagSelectorModal
                visible={tagModalVisible}
                onClose={() => setTagModalVisible(false)}
                onSelectTag={(tag) => {
                  if (selectedTags.includes(tag)) {
                    handleRemoveTag(tag);
                  } else {
                    handleAddTag(tag);
                  }
                }}
                selectedTags={selectedTags}
                availableTags={availableTags}
              />
            </View>
            
            <Text style={styles.sectionTitle}>Date Range</Text>
            <View style={styles.dateContainer}>
              <DatePickerInput
                label="From"
                initialYear={fromYear}
                initialMonth={fromMonth}
                initialDay={fromDay}
                onChange={(year, month, day) => {
                  setFromYear(year);
                  setFromMonth(month);
                  setFromDay(day);
                }}
              />
              
              <View style={styles.dateSpacing} />
              
              <DatePickerInput
                label="To"
                initialYear={toYear}
                initialMonth={toMonth}
                initialDay={toDay}
                onChange={(year, month, day) => {
                  setToYear(year);
                  setToMonth(month);
                  setToDay(day);
                }}
              />
            </View>
          </ScrollView>
          
          <View style={styles.divider} />
          
          <View style={styles.buttonContainer}>
            <Button 
              style={[
                styles.resetButton,
                !canReset() && styles.resetButtonDisabled
              ]} 
              onPress={handleReset}
              testID="filter-reset-button"
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </Button>
            <Button 
              style={styles.applyButton} 
              onPress={handleSave}
              testID="filter-modal-save-button"
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeIcon: {
    position: "absolute",
    right: 20,
    top: 16,
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
  },
  closeIconText: {
    fontSize: 16,
    color: "#555",
  },
  divider: {
    height: 1,
    backgroundColor: "#eaeaea",
    marginHorizontal: 20,
  },
  scrollContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  tagDropdownContainer: {
    marginBottom: 24,
  },
  tagSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8D6D4',
    padding: 12,
    borderRadius: 12,
  },
  tagSelectorText: {
    fontSize: 16,
    color: '#904a47',
    fontWeight: 'bold',
  },
  chevronIcon: {
    fontSize: 16,
    color: '#904a47',
  },
  dateContainer: {
    marginBottom: 24,
  },
  dateSpacing: {
    height: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 20,
    justifyContent: "space-between",
  },
  resetButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
    borderColor: "#ddd",
    borderWidth: 1,
  },
  resetButtonDisabled: {
    backgroundColor: "#f7f7f7",
    borderColor: "#e5e5e5",
  },
  resetButtonText: {
    color: "#333",
    fontWeight: "500",
  },
  applyButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#b00",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "500",
  }
});
