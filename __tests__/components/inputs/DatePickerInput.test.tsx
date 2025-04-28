import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DatePickerInput from "@/components/inputs/DatePickerInput";

describe("DatePickerInput", () => {
  it("renders correctly with label and default values", () => {
    const onChangeMock = jest.fn();
    const { getByText } = render(
      <DatePickerInput label="Test Label" onChange={onChangeMock} />
    );

    // Label should render
    expect(getByText("Test Label")).toBeTruthy();
    expect(getByText("Month")).toBeTruthy();
    expect(getByText("Date")).toBeTruthy();
    expect(getByText("Year")).toBeTruthy();

    // Initial onChange from useEffect
    expect(onChangeMock).toHaveBeenCalledWith(2020, 1, 1);
  });

  it("renders with initial values and triggers onChange on mount", () => {
    const onChangeMock = jest.fn();
    render(
      <DatePickerInput
        label="Date Picker"
        initialYear={2025}
        initialMonth={4}
        initialDay={15}
        onChange={onChangeMock}
      />
    );

    expect(onChangeMock).toHaveBeenCalledWith(2025, 4, 15);
  });

  it("calls onChange when changing year, month, and day", () => {
    const onChangeMock = jest.fn();
    const { getAllByTestId } = render(
      <DatePickerInput label="Date Picker" onChange={onChangeMock} />
    );

    const pickers = getAllByTestId("RNPickerSelect");

    // Simulate user selecting month
    fireEvent(pickers[0], "valueChange", 5);
    expect(onChangeMock).toHaveBeenLastCalledWith(2020, 5, 1);

    // Simulate user selecting day
    fireEvent(pickers[1], "valueChange", 20);
    expect(onChangeMock).toHaveBeenLastCalledWith(2020, 5, 20);

    // Simulate user selecting year
    fireEvent(pickers[2], "valueChange", 2028);
    expect(onChangeMock).toHaveBeenLastCalledWith(2028, 5, 20);
  });

  it("uses fallback when 0 or falsy value is passed", () => {
    const onChangeMock = jest.fn();
    const { getAllByTestId } = render(
      <DatePickerInput label="Date Picker" onChange={onChangeMock} />
    );

    const pickers = getAllByTestId("RNPickerSelect");

    fireEvent(pickers[0], "valueChange", 0); // month
    expect(onChangeMock).toHaveBeenLastCalledWith(2020, 1, 1);

    fireEvent(pickers[1], "valueChange", 0); // day
    expect(onChangeMock).toHaveBeenLastCalledWith(2020, 1, 1);

    fireEvent(pickers[2], "valueChange", 0); // year
    expect(onChangeMock).toHaveBeenLastCalledWith(2020, 1, 1);
  });
});
