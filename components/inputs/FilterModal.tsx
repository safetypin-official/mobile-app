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
import DatePickerInput from "@/components/inputs/DatePickerInput"; // New date picker component
import { TAGS as TAG_OBJECTS } from "@/assets/TagData"; // Adjust path if needed

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
}

const TAGS = ["All", ...TAG_OBJECTS.map(tag => tag.label)];

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSelectedTags,
  initialFromDate = null,
  initialToDate = null
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);
  const [tags, setTags] = useState<string[]>([]);

  // Date state for "From"
  const [fromYear, setFromYear] = useState<number>(
    initialFromDate ? initialFromDate.getFullYear() : 2020
  );
  const [fromMonth, setFromMonth] = useState<number>(
    initialFromDate ? initialFromDate.getMonth() + 1 : 1
  );
  const [fromDay, setFromDay] = useState<number>(
    initialFromDate ? initialFromDate.getDate() : 1
  );

  // Date state for "To"
  const [toYear, setToYear] = useState<number>(
    initialToDate ? initialToDate.getFullYear() : 2020
  );
  const [toMonth, setToMonth] = useState<number>(
    initialToDate ? initialToDate.getMonth() + 1 : 1
  );
  const [toDay, setToDay] = useState<number>(
    initialToDate ? initialToDate.getDate() : 1
  );

  useEffect(() => {
    setSelectedTags(initialSelectedTags);
  }, [initialSelectedTags]);

  // (Optional) If you need to fetch tags from an API
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('https://safetypin.ppl.cs.ui.ac.id/posts/category');
      const data = await response.json();
      if (data.success) {
        setTags(["All", ...data.data.map((tag: any) => tag.name)]);
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const toggleTag = (tag: string) => {
    let updatedTags;
    if (tag === "All") {
      updatedTags = selectedTags.includes("All") ? [] : [...tags];
    } else {
      updatedTags = selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag && t !== "All")
        : [...selectedTags, tag];

      // If all except "All" are selected, select "All" too
      if (updatedTags.length === tags.length - 1) {
        updatedTags = [...tags];
      }
    }
    setSelectedTags(updatedTags);
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

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.mainTitle}>Filter by</Text>

          <Text style={styles.sectionTitle}>Tag</Text>
          <ScrollView style={styles.scrollView}>
            {(tags.length ? tags : TAGS).map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                style={styles.tagItem}
              >
                <View style={styles.checkbox}>
                  {selectedTags.includes(tag) && (
                    <View style={styles.checkedBox} testID={`checkedBox-${tag}`} />
                  )}
                </View>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Dates</Text>
          {/* Use the new DatePickerInput for "From" */}
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
          {/* Use the new DatePickerInput for "To" */}
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

          <View style={styles.buttonContainer}>
            <View>
              <Button style={styles.closeButton} onPress={onClose} testID="filter-modal-close-button">
                Close
              </Button>
            </View>
            <View>
              <Button onPress={handleSave} testID="filter-modal-save-button">
                Save
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;

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
  mainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#b00",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
    color: "#b00",
  },
  scrollView: {
    maxHeight: 200,
    marginBottom: 10,
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
