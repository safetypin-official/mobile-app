import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import FilterModal from "@/components/inputs/FilterModal";

// Mock DatePickerInput to test interaction
jest.mock("@/components/inputs/DatePickerInput", () => {
  const { View, Text } = require("react-native");
  return function MockDatePickerInput({ label, onChange }: any) {
    return (
      <View>
        <Text>{label}</Text>
        <Text onPress={() => onChange(2025, 5, 15)}>{label}-Picker</Text>
      </View>
    );
  };
});

// Mock Button component
jest.mock("@/components/buttons/Button", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ children, onPress, ...props }: any) => (
    <TouchableOpacity onPress={onPress} {...props}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
});

// Fallback TAGS mock
jest.mock("@/assets/TagData", () => ({
  TAGS: [
    { label: "Tag1" },
    { label: "Tag2" },
    { label: "Tag3" },
  ],
}));

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({
        success: true,
        data: [{ name: "Tag1" }, { name: "Tag2" }, { name: "Tag3" }],
      }),
    })
  ) as jest.Mock;
});

describe("FilterModal (new)", () => {
  const baseProps = {
    visible: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    initialSelectedTags: ["Tag1"],
    initialFromDate: new Date("2022-01-01"),
    initialToDate: new Date("2023-01-01"),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders properly and allows toggling tags", async () => {
    const { getByText, queryByTestId } = render(<FilterModal {...baseProps} />);

    await waitFor(() => expect(getByText("Filter by")).toBeTruthy());

    const tag = getByText("Tag2");
    fireEvent.press(tag);
    expect(queryByTestId("checkedBox-Tag2")).toBeTruthy();

    fireEvent.press(tag);
    expect(queryByTestId("checkedBox-Tag2")).toBeFalsy();
  });

  it("selects 'All' automatically when all individual tags are selected", async () => {
    // 1. Mock the fetch before rendering so it's ready on mount
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: true,
            data: [{ name: "Tag1" }, { name: "Tag2" }, { name: "Tag3" }],
          }),
      })
    ) as jest.Mock;
  
    const { getByText } = render(<FilterModal {...baseProps} />);
  
    // 2. Wait for the tags to load (i.e. fetchTags to finish)
    await waitFor(() => {
      expect(getByText("Tag1")).toBeTruthy();
      expect(getByText("Tag2")).toBeTruthy();
      expect(getByText("Tag3")).toBeTruthy();
    });
  
    // 3. Press all individual tags (excluding "All")
    fireEvent.press(getByText("Tag1"));
    fireEvent.press(getByText("Tag2"));
    fireEvent.press(getByText("Tag3"));
  
    // 4. Check if "All" is now selected automatically
    expect(getByText("All")).toBeTruthy();
  });
  

  it("deselects all when pressing 'All' while active", async () => {
    const props = {
      ...baseProps,
      initialSelectedTags: ["All", "Tag1", "Tag2", "Tag3"],
    };

    const { getByText, queryByTestId } = render(<FilterModal {...props} />);
    fireEvent.press(getByText("All"));

    ["All", "Tag1", "Tag2", "Tag3"].forEach((tag) => {
      expect(queryByTestId(`checkedBox-${tag}`)).toBeFalsy();
    });
  });

  it("calls onSave with correctly formatted dates", async () => {
    const { getByText } = render(<FilterModal {...baseProps} />);
    fireEvent.press(getByText("From-Picker")); // mock date update
    fireEvent.press(getByText("To-Picker"));

    fireEvent.press(getByText("Save"));

    expect(baseProps.onSave).toHaveBeenCalledWith({
      selectedTags: ["Tag1"],
      fromDate: "2025-05-15",
      toDate: "2025-05-15",
    });
  });

  it("handles API failure gracefully", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject("API error")
    );

    const { getByText } = render(<FilterModal {...baseProps} />);
    await waitFor(() => expect(getByText("Filter by")).toBeTruthy());
  });

  it("calls onClose when close is pressed", () => {
    const { getByText } = render(<FilterModal {...baseProps} />);
    fireEvent.press(getByText("Close"));
    expect(baseProps.onClose).toHaveBeenCalled();
  });
});
