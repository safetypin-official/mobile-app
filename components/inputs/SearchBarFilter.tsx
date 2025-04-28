import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { filterIcon } from "@/assets/icons";
import SearchBar from "@/components/inputs/SearchBar";
import FilterModal from "@/components/inputs/FilterModal";

// Define a Filters type that includes tags and dates as formatted strings.
interface Filters {
  selectedTags: string[];
  fromDate: string;
  toDate: string;
}

interface SearchBarFilterProps {
  onSubmit?: (text: string) => void;
  onSave?: (filters: Filters) => void;
  testID?: string;
}

const SearchBarFilter: React.FC<SearchBarFilterProps> = ({
  onSubmit = (text: string) => console.log(text),
  onSave = (filters: Filters) => console.log(filters),
  testID = "search-bar-filter",
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Handle saving filters from the FilterModal.
  const handleSave = (filters: Filters) => {
    setSelectedTags(filters.selectedTags);
    onSave(filters);
    setModalVisible(false);
  };

  const handleSubmit = (text: string) => {
    onSubmit(text);
  };

  return (
    <View style={styles.container} testID={testID}>
      <SearchBar onSubmit={handleSubmit} testID="search-bar" />
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
        testID="filter-button"
      >
        <SvgXml xml={filterIcon} width={24} height={24} />
      </TouchableOpacity>

      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        initialSelectedTags={selectedTags}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "96%",
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  filterButton: {
    paddingLeft: 8,
  },
});

export default SearchBarFilter;
