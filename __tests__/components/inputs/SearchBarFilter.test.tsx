import React from "react";
import { render, fireEvent, waitFor, cleanup } from "@testing-library/react-native";
import SearchBarFilter from "@/components/inputs/SearchBarFilter";

jest.mock("@expo/vector-icons", () => ({
  Feather: (props: Record<string, unknown>) => `Feather ${JSON.stringify(props)}`,
  FontAwesome: (props: Record<string, unknown>) => `FontAwesome ${JSON.stringify(props)}`,
  AntDesign: jest.fn(() => null),
}));

jest.mock('react-native-svg', () => ({
  SvgXml: jest.fn(() => null),
}));

// Mocking SearchBar without using useState
jest.mock("@/components/inputs/SearchBar", () => {
    const { TextInput } = require("react-native");
    return ({ onSubmit }: any) => (
      <TextInput
        testID="search-input"
        onChangeText={onSubmit}
        onSubmitEditing={() => onSubmit('Test search')}
      />
    );
  });

// Mock FilterModal with React Native components (TouchableOpacity, Text)
jest.mock("@/components/inputs/FilterModal", () => {
    const { View, TouchableOpacity, Text } = require("react-native");
    return ({ visible, onClose, onSave }: any) => (
        visible ? (
            <View testID="filter-modal">
            <TouchableOpacity onPress={onClose} testID="filter-modal-close">
                <Text>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSave(["Tag1", "Tag2"])} testID="filter-modal-save">
                <Text>Save</Text>
            </TouchableOpacity>
        </View>
        ) : null
    );
});

describe("SearchBarFilter Component", () => {
  afterEach(cleanup);
  
  it("renders correctly", () => {
    const { getByTestId } = render(<SearchBarFilter />);
    expect(getByTestId("search-bar-filter")).toBeTruthy();
  });

  it("opens the FilterModal when the filter button is clicked", () => {
    const { getByTestId } = render(<SearchBarFilter />);
    const filterButton = getByTestId("filter-button");
    fireEvent.press(filterButton);
    
    // Wait for the modal to appear
    waitFor(() => expect(getByTestId("filter-modal")).toBeTruthy());
  });

  it("closes the FilterModal when the Close button is pressed", () => {
    const { getByTestId, queryByTestId } = render(<SearchBarFilter />);
    const filterButton = getByTestId("filter-button");
    fireEvent.press(filterButton);
    
    // Close the modal
    const closeButton = getByTestId("filter-modal-close");
    fireEvent.press(closeButton);

    expect(queryByTestId("filter-modal")).toBeNull();
  });

  it("calls onSave with selected tags when Save is pressed in FilterModal", () => {
    const mockOnSave = jest.fn();
    const { getByTestId } = render(<SearchBarFilter onSave={mockOnSave} />);
    const filterButton = getByTestId("filter-button");
    fireEvent.press(filterButton);

    const saveButton = getByTestId("filter-modal-save");
    fireEvent.press(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(expect.arrayContaining(["Tag1", "Tag2"]));
  });

  it("calls onSubmit with correct text when search input is submitted", () => {
    const mockOnSubmit = jest.fn();
    const { getByTestId } = render(<SearchBarFilter onSubmit={mockOnSubmit} />);
    const searchInput = getByTestId("search-input");

    fireEvent.changeText(searchInput, "Test search");
    fireEvent(searchInput, "submitEditing");

    expect(mockOnSubmit).toHaveBeenCalledWith("Test search");
  });

  it("calls console.log with correct text when onSubmit is used", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { getByTestId } = render(<SearchBarFilter />);

    // Trigger the search submit action
    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "Test search");
    fireEvent(searchInput, "submitEditing");

    // Check if console.log was called with the correct text
    expect(consoleLogSpy).toHaveBeenCalledWith("Test search");

    consoleLogSpy.mockRestore();
  });

  it("calls console.log with selected tags when onSave is used", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { getByTestId } = render(<SearchBarFilter />);

    // Trigger the filter modal save action
    const filterButton = getByTestId("filter-button");
    fireEvent.press(filterButton);

    const saveButton = getByTestId("filter-modal-save");
    fireEvent.press(saveButton);

    // Check if console.log was called with the selected tags
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.arrayContaining(["Tag1", "Tag2"]));

    consoleLogSpy.mockRestore();
  });
});
