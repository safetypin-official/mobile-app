import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react-native";
import SearchBarFilter from "@/components/inputs/SearchBarFilter";

// Mocks
jest.mock("@expo/vector-icons", () => ({
  Feather: (props: Record<string, unknown>) => `Feather ${JSON.stringify(props)}`,
  FontAwesome: (props: Record<string, unknown>) => `FontAwesome ${JSON.stringify(props)}`,
  AntDesign: jest.fn(() => null),
}));

jest.mock("react-native-svg", () => ({
  SvgXml: jest.fn(() => null),
}));

jest.mock("@/components/inputs/SearchBar", () => {
  const { TextInput } = require("react-native");
  return ({ onSubmit }: any) => (
    <TextInput
      testID="search-input"
      onChangeText={onSubmit}
      onSubmitEditing={() => onSubmit("Search test")}
    />
  );
});

jest.mock("@/components/inputs/FilterModal", () => {
  const { View, TouchableOpacity, Text } = require("react-native");
  return ({ visible, onClose, onSave }: any) =>
    visible ? (
      <View testID="filter-modal">
        <TouchableOpacity testID="filter-modal-close" onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="filter-modal-save"
          onPress={() =>
            onSave({
              selectedTags: ["Tag1", "Tag2"],
              fromDate: "2023-01-01",
              toDate: "2023-12-31",
            })
          }
        >
          <Text>Save</Text>
        </TouchableOpacity>
      </View>
    ) : null;
});

describe("SearchBarFilter (New)", () => {
  afterEach(cleanup);

  it("renders correctly", () => {
    const { getByTestId } = render(<SearchBarFilter />);
    expect(getByTestId("search-bar-filter")).toBeTruthy();
  });

  it("opens the FilterModal when filter button is clicked", () => {
    const { getByTestId } = render(<SearchBarFilter />);
    fireEvent.press(getByTestId("filter-button"));
    expect(getByTestId("filter-modal")).toBeTruthy();
  });

  it("closes the FilterModal when Close is pressed", () => {
    const { getByTestId, queryByTestId } = render(<SearchBarFilter />);
    fireEvent.press(getByTestId("filter-button"));
    fireEvent.press(getByTestId("filter-modal-close"));
    expect(queryByTestId("filter-modal")).toBeNull();
  });

  it("calls onSave with filters object (tags + dates)", () => {
    const mockOnSave = jest.fn();
    const { getByTestId } = render(<SearchBarFilter onSave={mockOnSave} />);
    fireEvent.press(getByTestId("filter-button"));
    fireEvent.press(getByTestId("filter-modal-save"));

    expect(mockOnSave).toHaveBeenCalledWith({
      selectedTags: ["Tag1", "Tag2"],
      fromDate: "2023-01-01",
      toDate: "2023-12-31",
    });
  });

  it("calls onSubmit with text when search input submitted", () => {
    const mockOnSubmit = jest.fn();
    const { getByTestId } = render(<SearchBarFilter onSubmit={mockOnSubmit} />);
    const input = getByTestId("search-input");
    fireEvent.changeText(input, "Search test");
    fireEvent(input, "submitEditing");
    expect(mockOnSubmit).toHaveBeenCalledWith("Search test");
  });

  it("logs search if no onSubmit is provided", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { getByTestId } = render(<SearchBarFilter />);
    fireEvent(getByTestId("search-input"), "submitEditing");
    expect(logSpy).toHaveBeenCalledWith("Search test");
    logSpy.mockRestore();
  });

  it("logs filters if no onSave is provided", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { getByTestId } = render(<SearchBarFilter />);
    fireEvent.press(getByTestId("filter-button"));
    fireEvent.press(getByTestId("filter-modal-save"));

    expect(logSpy).toHaveBeenCalledWith({
      selectedTags: ["Tag1", "Tag2"],
      fromDate: "2023-01-01",
      toDate: "2023-12-31",
    });
    logSpy.mockRestore();
  });
});
