import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SearchBarProps {
  onSubmit?: (text: string) => void;
  placeholder?: string;
  testID?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSubmit = (text: string) => console.log(text),
  placeholder = "Search",
  testID = "search-bar",
}) => {
  const [searchText, setSearchText] = useState("");

  const handleSubmit = () => {
    onSubmit(searchText);
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.searchField}>
        <View style={styles.searchBackground} />
        <View style={styles.searchContent}>
          <View style={styles.searchIconText}>
            <Feather name="search" size={24} color="#785654" />
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="#AF8784"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSubmit}
              testID="search-input"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    left: "5%",
    right: "5%",
    width: "90%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100, // Ensures it stays on top
  },
  searchField: {
    width: "92%",
    height: 44,
    position: "relative",
  },
  searchBackground: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  searchContent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  searchIconText: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  input: {
    color: "#785654",
    fontSize: 14,
    fontWeight: "400",
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
    paddingVertical: 8,
  },
});



export default SearchBar;
