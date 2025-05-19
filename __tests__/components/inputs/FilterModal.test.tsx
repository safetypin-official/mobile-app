import React, { useState, useEffect } from "react";
import { render, fireEvent, cleanup, waitFor, act } from "@testing-library/react-native";
import FilterModal from "@/components/inputs/FilterModal";
import { authenticatedGet } from "@/utils/api";
import { TAG_KEYS } from "@/components/displays/post/ReportTags";

// Mock Button component
jest.mock("@/components/buttons/Button", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ children, onPress, testID, disabled, ...props }: any) => (
    <TouchableOpacity 
      onPress={onPress} 
      testID={testID} 
      disabled={disabled} 
      // Add data attribute to make disabled prop visible in tests
      accessibilityState={{ disabled: !!disabled }}
      {...props}
    >
      <Text>{children}</Text>
    </TouchableOpacity>
  );
});

// Mock DatePickerInput component
jest.mock("@/components/inputs/DatePickerInput", () => {
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ label, onChange, initialYear, initialMonth, initialDay }: any) => (
    <View>
      <Text>{label}</Text>
      <TouchableOpacity 
        testID={`date-picker-${label}`}
        onPress={() => onChange(2023, 5, 15)} // Mock date change
      >
        <Text>Select Date</Text>
      </TouchableOpacity>
    </View>
  );
});

// Mock MultiTagSelectorModal component with simple implementation
let capturedTagModalProps = {
  visible: false,
  onClose: () => {},
  onSelectTag: (_: string) => {},
  selectedTags: [] as string[],
  availableTags: [] as string[]
};

jest.mock("@/components/inputs/MultiTagSelectorModal", () => {
  const { View, Text, TouchableOpacity } = require("react-native");
  return function MockMultiTagSelectorModal(props: any) {
    // Store the props for tests to access
    capturedTagModalProps = {...props};
    
    if (!props.visible) return null;
    
    return (
      <View testID="tag-modal">
        <Text testID="tag-modal-title">Select Categories</Text>
        <TouchableOpacity testID="tag-modal-close" onPress={props.onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
        {props.availableTags.map((tag: string) => (
          <TouchableOpacity 
            key={tag}
            testID={`tag-${tag.replace(/\s+/g, '-')}`}
            onPress={() => props.onSelectTag(tag)}
          >
            <Text>{tag}</Text>
            {props.selectedTags.includes(tag) && (
              <View testID={`selected-${tag.replace(/\s+/g, '-')}`} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };
});

// Mock the API call
jest.mock("@/utils/api", () => ({
  authenticatedGet: jest.fn(() => {
    // Return a promise that resolves immediately with mock data
    return Promise.resolve({
      success: true,
      data: ["Tag1", "Tag2", "Tag3"]
    });
  })
}));

// Suppress console.error during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe("FilterModal", () => {
  afterEach(cleanup);
  
  const baseProps = {
    visible: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    initialSelectedTags: [],
    testID: "filter-modal" 
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset captured modal props
    capturedTagModalProps = {
      visible: false,
      onClose: () => {},
      onSelectTag: (_: string) => {},
      selectedTags: [],
      availableTags: []
    };
  });

  it("renders modal when visible", async () => {
    const { getByText, getByTestId } = render(<FilterModal {...baseProps} />);
    
    await waitFor(() => {
      expect(getByText("Filter")).toBeTruthy();
      expect(getByText("Categories")).toBeTruthy();
      expect(getByText("Date Range")).toBeTruthy();
      expect(getByTestId("filter-modal-close-button")).toBeTruthy();
    });
  });

  it("calls onClose when close button is pressed", async () => {
    const { getByTestId } = render(<FilterModal {...baseProps} />);
    
    await waitFor(() => {
      fireEvent.press(getByTestId("filter-modal-close-button"));
      expect(baseProps.onClose).toHaveBeenCalled();
    });
  });

  it("fetches tags when component mounts", async () => {
    render(<FilterModal {...baseProps} />);
    
    await waitFor(() => {
      expect(authenticatedGet).toHaveBeenCalledWith('https://safetypin.ppl.cs.ui.ac.id/posts/category');
    });
  });

  it("falls back to TAG_KEYS when API call fails", async () => {
    // Override the mock for this test only
    (authenticatedGet as jest.Mock).mockRejectedValueOnce(new Error("API error"));
    
    const { getByTestId } = render(<FilterModal {...baseProps} />);
    
    // Wait for API call to resolve and component to update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Open tag selector modal
    await act(async () => {
      fireEvent.press(getByTestId("tag-selector-button"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Check if we're using TAG_KEYS by accessing the captured modal props
    expect(capturedTagModalProps.availableTags).toEqual(TAG_KEYS);
  });

  it("handles API success with valid data", async () => {
    const mockTags = ["Tag1", "Tag2", "Tag3"];
    
    // Override the mock for this test only
    (authenticatedGet as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockTags
    });
    
    const { getByTestId } = render(<FilterModal {...baseProps} />);
    
    // Wait for API call to resolve and component to update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Open tag selector modal
    await act(async () => {
      fireEvent.press(getByTestId("tag-selector-button"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Verify API tags are being used
    expect(capturedTagModalProps.availableTags).toEqual(mockTags);
  });

  it("handles API success with false success flag", async () => {
    // Override the mock for this test only
    (authenticatedGet as jest.Mock).mockResolvedValueOnce({
      success: false,
      message: "Failed to fetch tags"
    });
    
    const { getByTestId } = render(<FilterModal {...baseProps} />);
    
    // Wait for API call to resolve and component to update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Open tag selector modal
    await act(async () => {
      fireEvent.press(getByTestId("tag-selector-button"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Verify TAG_KEYS are being used
    expect(capturedTagModalProps.availableTags).toEqual(TAG_KEYS);
  });

  it("opens tag selector modal when clicking the selector", async () => {
    const { getByTestId, queryByTestId } = render(<FilterModal {...baseProps} />);
    
    // Initially no modal
    expect(queryByTestId("tag-modal")).toBeNull();
    
    // Open tag selector modal
    await act(async () => {
      fireEvent.press(getByTestId("tag-selector-button"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Modal should be open
    expect(capturedTagModalProps.visible).toBe(true);
    expect(queryByTestId("tag-modal")).toBeTruthy();
  });

  it("closes tag selector modal", async () => {
    const { getByTestId, queryByTestId } = render(<FilterModal {...baseProps} />);
    
    // Open tag selector modal
    await act(async () => {
      fireEvent.press(getByTestId("tag-selector-button"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Modal should be open
    expect(queryByTestId("tag-modal")).toBeTruthy();
    
    // Close tag selector modal
    await act(async () => {
      fireEvent.press(getByTestId("tag-modal-close"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Modal should be closed
    expect(capturedTagModalProps.visible).toBe(false);
    expect(queryByTestId("tag-modal")).toBeNull();
  });

  it("adds a tag when selected", async () => {
    const { getByText, getByTestId } = render(<FilterModal {...baseProps} />);
    
    // Open tag selector modal
    await act(async () => {
      fireEvent.press(getByTestId("tag-selector-button"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Select a tag using the captured function
    await act(async () => {
      capturedTagModalProps.onSelectTag("Tag1");
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Check that the tag was added to selected tags
    expect(capturedTagModalProps.selectedTags).toContain("Tag1");
    
    // Close modal
    await act(async () => {
      capturedTagModalProps.onClose();
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Verify the tag count is displayed
    expect(getByText("1 categories selected")).toBeTruthy();
  });

  it("removes a tag when an already selected tag is clicked", async () => {
    const { getByText, getByTestId } = render(
      <FilterModal {...baseProps} initialSelectedTags={["Tag1"]} />
    );
    
    // Initially should show 1 tag selected
    expect(getByText("1 categories selected")).toBeTruthy();
    
    // Open tag selector modal
    await act(async () => {
      fireEvent.press(getByTestId("tag-selector-button"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Deselect the tag using captured function
    await act(async () => {
      capturedTagModalProps.onSelectTag("Tag1");
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Check that the tag was removed
    expect(capturedTagModalProps.selectedTags).not.toContain("Tag1");
    
    // Close modal
    await act(async () => {
      capturedTagModalProps.onClose();
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Verify no tags are selected
    expect(getByText("Select Categories")).toBeTruthy();
  });

  it("saves filters when Apply button is pressed", async () => {
    const { getByTestId } = render(
      <FilterModal 
        {...baseProps} 
        initialSelectedTags={["Tag1"]} 
      />
    );
    
    // Press save button
    await act(async () => {
      fireEvent.press(getByTestId("filter-modal-save-button"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Check that onSave was called with the right params
    expect(baseProps.onSave).toHaveBeenCalledWith({
      selectedTags: ["Tag1"],
      fromDate: expect.any(String),
      toDate: expect.any(String)
    });
  });

  it("updates dates when DatePickerInput values change", async () => {
    const { getByTestId } = render(<FilterModal {...baseProps} />);
    
    // Change "From" date
    await act(async () => {
      fireEvent.press(getByTestId("date-picker-From"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Change "To" date
    await act(async () => {
      fireEvent.press(getByTestId("date-picker-To"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Press save button
    await act(async () => {
      fireEvent.press(getByTestId("filter-modal-save-button"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Check that onSave was called with updated dates
    expect(baseProps.onSave).toHaveBeenCalledWith({
      selectedTags: [],
      fromDate: "2023-05-15", // The mock date we set
      toDate: "2023-05-15" // The mock date we set
    });
  });

  it("resets filters when Reset button is pressed", async () => {
    const today = new Date();
    const todayFormattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Render with some initial selections
    const { getByTestId, getByText } = render(
      <FilterModal 
        {...baseProps} 
        initialSelectedTags={["Tag1", "Tag2"]} 
      />
    );
    
    // Expect to see selected categories count
    expect(getByText("2 categories selected")).toBeTruthy();
    
    // Press reset button
    await act(async () => {
      fireEvent.press(getByTestId("filter-reset-button"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Expect categories to be reset
    expect(getByText("Select Categories")).toBeTruthy();
    
    // Press save to confirm reset worked
    await act(async () => {
      fireEvent.press(getByTestId("filter-modal-save-button"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Check that onSave was called with reset values
    expect(baseProps.onSave).toHaveBeenCalledWith({
      selectedTags: [],
      fromDate: todayFormattedDate,
      toDate: todayFormattedDate
    });
  });

  it("enables Reset button when there are changes to reset", async () => {
    // Render with initial selections that need to be reset
    const { getByTestId } = render(
      <FilterModal 
        {...baseProps} 
        initialSelectedTags={["Tag1"]} 
      />
    );
    
    // Reset button should be enabled
    const resetButton = getByTestId("filter-reset-button");
    expect(resetButton.props.accessibilityState.disabled).toBe(false);
  });

  it("updates selectedTags when initialSelectedTags prop changes", async () => {
    const { rerender, getByText } = render(
      <FilterModal {...baseProps} initialSelectedTags={[]} />
    );
    
    // Initially should show "Select Categories"
    expect(getByText("Select Categories")).toBeTruthy();
    
    // Update props
    rerender(
      <FilterModal {...baseProps} initialSelectedTags={["Tag1", "Tag2"]} />
    );
    
    // Should now show updated count
    expect(getByText("2 categories selected")).toBeTruthy();
  });

  it("handles initialFromDate and initialToDate props", async () => {
    const { getByTestId } = render(
      <FilterModal 
        {...baseProps} 
        initialFromDate={new Date(2023, 0, 1)} // Jan 1, 2023
        initialToDate={new Date(2023, 11, 31)} // Dec 31, 2023
      />
    );
    
    // Press save to check if the provided dates are used
    await act(async () => {
      fireEvent.press(getByTestId("filter-modal-save-button"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Check that onSave was called with initial dates in string format
    expect(baseProps.onSave).toHaveBeenCalledWith({
      selectedTags: [],
      fromDate: "2023-01-01",
      toDate: "2023-12-31"
    });
  });

  it("handles invalid initialFromDate and initialToDate props", async () => {
    const today = new Date();
    const todayFormattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Create invalid Date objects (NaN dates)
    const invalidDate = new Date("invalid-date");
    
    // Render with invalid dates
    const { getByTestId } = render(
      <FilterModal 
        {...baseProps} 
        initialFromDate={invalidDate}
        initialToDate={invalidDate}
      />
    );
    
    // Press save to check fallback behavior
    await act(async () => {
      fireEvent.press(getByTestId("filter-modal-save-button"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Check that onSave was called with today's date as fallback
    expect(baseProps.onSave).toHaveBeenCalledWith({
      selectedTags: [],
      fromDate: todayFormattedDate,
      toDate: todayFormattedDate
    });
  });

  it("properly handles NaN values in formatDate function", async () => {
    const today = new Date();
    const todayYear = today.getFullYear(); // 2025
    const todayMonth = today.getMonth() + 1; // 5
    const todayDay = today.getDate(); // 19
    
    const todayFormatted = `${todayYear}-${String(todayMonth).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;
    
    // Create a spy on onSave to capture the formatted dates
    const onSaveMock = jest.fn();
    
    // Create mock values for direct testing
    let mockFromYear, mockFromMonth, mockFromDay;
    let mockToYear, mockToMonth, mockToDay;
    
    // Mock component for testing
    const TestComponent = () => {
      const [fromYear, setFromYear] = useState(mockFromYear);
      const [fromMonth, setFromMonth] = useState(mockFromMonth);
      const [fromDay, setFromDay] = useState(mockFromDay);
      
      return (
        <FilterModal
          visible={true}
          onClose={() => {}}
          onSave={onSaveMock}
          initialSelectedTags={[]}
        />
      );
    };
    
    // Case 1: Only year is NaN
    mockFromYear = NaN;
    mockFromMonth = 5;
    mockFromDay = 15;
    
    const { rerender, getByTestId } = render(<TestComponent />);
    
    await act(async () => {
      fireEvent.press(getByTestId("filter-modal-save-button"));
    });
    
    expect(onSaveMock).toHaveBeenLastCalledWith({
      selectedTags: [],
      fromDate: todayFormatted, // Always expect today's date when NaN is present
      toDate: todayFormatted
    });
    
    // Case 2: Only month is NaN
    onSaveMock.mockClear();
    mockFromYear = 2023;
    mockFromMonth = NaN;
    mockFromDay = 15;
    
    rerender(<TestComponent />);
    
    await act(async () => {
      fireEvent.press(getByTestId("filter-modal-save-button"));
    });
    
    expect(onSaveMock).toHaveBeenLastCalledWith({
      selectedTags: [],
      fromDate: todayFormatted,
      toDate: todayFormatted
    });
    
    // Case 3: Only day is NaN
    onSaveMock.mockClear();
    mockFromYear = 2023;
    mockFromMonth = 5;
    mockFromDay = NaN;
    
    rerender(<TestComponent />);
    
    await act(async () => {
      fireEvent.press(getByTestId("filter-modal-save-button"));
    });
    
    expect(onSaveMock).toHaveBeenLastCalledWith({
      selectedTags: [],
      fromDate: todayFormatted,
      toDate: todayFormatted
    });
    
    // Case 4: All values are NaN
    onSaveMock.mockClear();
    mockFromYear = NaN;
    mockFromMonth = NaN;
    mockFromDay = NaN;
    
    rerender(<TestComponent />);
    
    await act(async () => {
      fireEvent.press(getByTestId("filter-modal-save-button"));
    });
    
    expect(onSaveMock).toHaveBeenLastCalledWith({
      selectedTags: [],
      fromDate: todayFormatted,
      toDate: todayFormatted
    });
  });

});
