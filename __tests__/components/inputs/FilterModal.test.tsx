import React from "react";
import { render, fireEvent, cleanup, waitFor } from "@testing-library/react-native";
import FilterModal from "@/components/inputs/FilterModal";

// Mock Button component
jest.mock("@/components/buttons/Button", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ children, onPress, ...props }: any) => (
    <TouchableOpacity onPress={onPress} {...props}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
});

// Mock DatePickerInput component
jest.mock("@/components/inputs/DatePickerInput", () => {
  const { View, Text } = require("react-native");
  return ({ label, onChange }: any) => (
    <View>
      <Text>{label}</Text>
      <View testID={`date-picker-${label}`} />
    </View>
  );
});

// Mock TAGS from @/assets/TagData
jest.mock("@/assets/TagData", () => ({
  TAGS: [
    { label: "Tag1" },
    { label: "Tag2" },
    { label: "Tag3" },
  ],
}));

// Mock api module
jest.mock("@/utils/api", () => ({
  authenticatedGet: jest.fn().mockResolvedValue({
    success: true,
    data: ["Tag1", "Tag2", "Tag3"]
  })
}));

describe("FilterModal", () => {
  afterEach(cleanup);
  
  const baseProps = {
    visible: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    initialSelectedTags: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal when visible", async () => {
    const { getByText } = render(<FilterModal {...baseProps} />);
    
    // Wait for the filter title to be visible
    await waitFor(() => {
      expect(getByText("Filter by")).toBeTruthy();
    });
  });

  it("calls onClose when Close button is pressed", async () => {
    const { getByText } = render(<FilterModal {...baseProps} />);
    
    await waitFor(() => {
      fireEvent.press(getByText("Close"));
      expect(baseProps.onClose).toHaveBeenCalled();
    });
  });

  it("calls onSave with selected tags", async () => {
    const { getByText } = render(
      <FilterModal {...baseProps} initialSelectedTags={["Tag1"]} />
    );
    
    await waitFor(() => {
      fireEvent.press(getByText("Save"));
      expect(baseProps.onSave).toHaveBeenCalledWith(expect.objectContaining({
        selectedTags: expect.arrayContaining(["Tag1"])
      }));
    });
  });

  it("toggles a tag on and off", async () => {
    const { getByText, queryAllByTestId } = render(<FilterModal {...baseProps} />);
    
    await waitFor(() => {
      const tag = getByText("Tag1");
      
      // Select tag
      fireEvent.press(tag);
      expect(queryAllByTestId("checkedBox-Tag1")).toHaveLength(1);
      
      // Deselect tag
      fireEvent.press(tag);
      expect(queryAllByTestId("checkedBox-Tag1")).toHaveLength(0);
    });
  });  

  it("selects all tags when 'All' is clicked", async () => {
    const { getByText } = render(<FilterModal {...baseProps} />);
    
    await waitFor(() => {
      fireEvent.press(getByText("All"));

      ["All", "Tag1", "Tag2", "Tag3"].forEach((tag) => {
        expect(getByText(tag)).toBeTruthy();
      });
    });
  });

  it("selects 'All' automatically when all individual tags are selected", async () => {
    const { getByText, queryByTestId } = render(<FilterModal {...baseProps} />);
    
    await waitFor(() => {
      // Simulate selecting all individual tags except 'All'
      ["Tag1", "Tag2", "Tag3"].forEach((tag) => fireEvent.press(getByText(tag)));
      
      // "All" should now be selected automatically
      expect(queryByTestId("checkedBox-All")).toBeTruthy();
    });
  });  

  it("clears all tags when 'All' is clicked while selected", async () => {
    const { getByText, queryByTestId } = render(
      <FilterModal
        {...baseProps}
        initialSelectedTags={["All", "Tag1", "Tag2", "Tag3"]}
      />
    );
    
    await waitFor(() => {
      fireEvent.press(getByText("All"));
      
      // All checkboxes should now be gone
      ["All", "Tag1", "Tag2", "Tag3"].forEach((tag) => {
        expect(queryByTestId(`checkedBox-${tag}`)).toBeFalsy();
      });
    });
  });  

  it("updates selected tags when initialSelectedTags prop changes", async () => {
    const { rerender, queryByTestId } = render(
      <FilterModal {...baseProps} initialSelectedTags={[]} />
    );

    await waitFor(() => {
      rerender(
        <FilterModal {...baseProps} initialSelectedTags={["Tag2"]} />
      );
      
      expect(queryByTestId("checkedBox-Tag2")).toBeTruthy();
    });
  });

  it("deselects a tag and removes 'All' when it was selected", async () => {
    const { getByText, queryByTestId } = render(
      <FilterModal {...baseProps} initialSelectedTags={["All", "Tag1", "Tag2", "Tag3"]} />
    );
    
    await waitFor(() => {
      // Deselect "Tag1" when "All" is selected
      fireEvent.press(getByText("Tag1"));
      
      // "Tag1" should now be unchecked
      expect(queryByTestId("checkedBox-Tag1")).toBeFalsy();
      
      // "All" should also be deselected
      expect(queryByTestId("checkedBox-All")).toBeFalsy();
    });
  });
});
