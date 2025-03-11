import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SearchBar from "@/components/inputs/SearchBar";

jest.mock("@expo/vector-icons", () => ({
  Feather: (props: Record<string, unknown>) => `Feather ${JSON.stringify(props)}`,
  FontAwesome: (props: Record<string, unknown>) => `FontAwesome ${JSON.stringify(props)}`,
}));

describe("SearchBar Component", () => {
  it("renders correctly with default props", () => {
    const { getByTestId, getByPlaceholderText } = render(<SearchBar />);
    
    expect(getByTestId("search-bar")).toBeTruthy();
    expect(getByPlaceholderText("Search")).toBeTruthy();
  });

  it("renders correctly with a custom placeholder", () => {
    const { getByPlaceholderText } = render(<SearchBar placeholder="Find something..." />);
    
    expect(getByPlaceholderText("Find something...")).toBeTruthy();
  });

  it("updates the text when typing", () => {
    const { getByTestId } = render(<SearchBar />);
    const input = getByTestId("search-input");

    fireEvent.changeText(input, "Hello");

    expect(input.props.value).toBe("Hello");
  });

  it("calls onSubmit with the correct text when submitted", () => {
    const mockSubmit = jest.fn();
    const { getByTestId } = render(<SearchBar onSubmit={mockSubmit} />);
    const input = getByTestId("search-input");

    fireEvent.changeText(input, "Test Search");
    fireEvent(input, "submitEditing");

    expect(mockSubmit).toHaveBeenCalledWith("Test Search");
  });

  it("calls default onSubmit when no onSubmit prop is provided", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const { getByTestId } = render(<SearchBar />);
    const input = getByTestId("search-input");

    fireEvent.changeText(input, "test input");
    fireEvent(input, "submitEditing");

    expect(consoleLogSpy).toHaveBeenCalledWith("test input");

    consoleLogSpy.mockRestore();
  });
});
