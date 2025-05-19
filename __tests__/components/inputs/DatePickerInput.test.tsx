import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DatePickerInput from "@/components/inputs/DatePickerInput";

// Mock DateTimePicker component
jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ value, onChange }) => {
      // Simulate DateTimePicker by providing a way to trigger onChange
      return (
        <View testID="mock-date-picker">
          <View 
            testID="select-date-button"
            onPress={() => {
              // Simulate selecting tomorrow's date
              const newDate = new Date(value);
              newDate.setDate(newDate.getDate() + 1);
              onChange({ type: 'set' }, newDate);
            }}
          />
        </View>
      );
    }
  };
});

describe("DatePickerInput", () => {
  it("renders correctly with label and default values", () => {
    const onChangeMock = jest.fn();
    const { getByText, getByTestId } = render(
      <DatePickerInput label="Test Label" onChange={onChangeMock} />
    );

    // Label should render
    expect(getByText("Test Label")).toBeTruthy();
    
    // Date display should be present
    expect(getByTestId("date-picker-Test Label")).toBeTruthy();
    
    // Should format the default date
    const defaultDate = new Date();
    const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][defaultDate.getMonth()];
    const expectedFormat = `${monthName} ${defaultDate.getDate()}, ${defaultDate.getFullYear()}`;
    expect(getByText(expectedFormat)).toBeTruthy();
  });

  it("renders with initial values", () => {
    const onChangeMock = jest.fn();
    const { getByText } = render(
      <DatePickerInput
        label="Date Picker"
        initialYear={2025}
        initialMonth={4}
        initialDay={15}
        onChange={onChangeMock}
      />
    );

    // Check if the date is formatted correctly with initial values
    expect(getByText("Apr 15, 2025")).toBeTruthy();
    
    // Note: Component does not call onChange during initialization
  });

  it("opens date picker when the date display is pressed", () => {
    const onChangeMock = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <DatePickerInput label="Date Picker" onChange={onChangeMock} />
    );

    // DatePicker should not be visible initially
    expect(queryByTestId("mock-date-picker")).toBeNull();
    
    // Press the date display to show the picker
    fireEvent.press(getByTestId("date-picker-Date Picker"));
    
    // DatePicker should now be visible
    expect(queryByTestId("mock-date-picker")).toBeTruthy();
  });

  it("calls onChange when date is selected", () => {
    const onChangeMock = jest.fn();
    const { getByTestId } = render(
      <DatePickerInput 
        label="Date Picker" 
        initialYear={2023}
        initialMonth={5}
        initialDay={10}
        onChange={onChangeMock} 
      />
    );
    
    // Press the date display to show the picker
    fireEvent.press(getByTestId("date-picker-Date Picker"));
    
    // Simulate selecting a date in the picker
    const mockDateChange = (selectedDate) => {
      fireEvent(getByTestId("mock-date-picker"), "onChange", { type: 'set' }, selectedDate);
    };
    
    // Select May 15, 2023
    const newDate = new Date(2023, 4, 15); // Month is 0-indexed in Date constructor
    mockDateChange(newDate);
    
    // Should call onChange with year, month (1-indexed), and day
    expect(onChangeMock).toHaveBeenCalledWith(2023, 5, 15);
  });

  it("updates display when props change", () => {
    const onChangeMock = jest.fn();
    const { rerender, getByText } = render(
      <DatePickerInput
        label="Date Picker"
        initialYear={2023}
        initialMonth={5}
        initialDay={10}
        onChange={onChangeMock}
      />
    );
    
    // Initial render should show May 10, 2023
    expect(getByText("May 10, 2023")).toBeTruthy();
    
    // Update props
    rerender(
      <DatePickerInput
        label="Date Picker"
        initialYear={2024}
        initialMonth={8}
        initialDay={20}
        onChange={onChangeMock}
      />
    );
    
    // Should update to Aug 20, 2024
    expect(getByText("Aug 20, 2024")).toBeTruthy();
    
    // Note: Component does not call onChange when props change
  });

  it("handles optional initial date props correctly", () => {
    const today = new Date();
    
    // Test with only initialYear
    const { getByText } = render(
      <DatePickerInput
        label="Date Picker"
        initialYear={2030}
        onChange={jest.fn()}
      />
    );
    
    // Should use current month and day with specified year
    const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][today.getMonth()];
    const expectedFormat = `${monthName} ${today.getDate()}, 2030`;
    expect(getByText(expectedFormat)).toBeTruthy();
  });
  
  it("handles missing initial date props by using current date", () => {
    const today = new Date();
    const { getByText } = render(
      <DatePickerInput
        label="Date Picker"
        onChange={jest.fn()}
      />
    );
    
    // Should display today's date
    const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][today.getMonth()];
    const expectedFormat = `${monthName} ${today.getDate()}, ${today.getFullYear()}`;
    expect(getByText(expectedFormat)).toBeTruthy();
  });

  it("handles canceled date selection properly", () => {
    const onChangeMock = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <DatePickerInput 
        label="Date Picker" 
        initialYear={2023}
        initialMonth={5}
        initialDay={10}
        onChange={onChangeMock} 
      />
    );
    
    // Store the current date display text to compare later
    const dateDisplay = getByTestId("date-picker-Date Picker").children[0].props.children;
    
    // Press to open the date picker
    fireEvent.press(getByTestId("date-picker-Date Picker"));
    
    // Date picker should be visible
    expect(queryByTestId("mock-date-picker")).toBeTruthy();
    
    // Simulate a canceled selection (event with no selectedDate)
    fireEvent(getByTestId("mock-date-picker"), "onChange", { type: 'dismissed' }, undefined);
    
    // The date picker should be closed
    expect(queryByTestId("mock-date-picker")).toBeNull();
    
    // The date display should not have changed
    const dateDisplayAfter = getByTestId("date-picker-Date Picker").children[0].props.children;
    expect(dateDisplayAfter).toEqual(dateDisplay);
    
    // The onChange callback should not have been called
    expect(onChangeMock).not.toHaveBeenCalled();
  });
});