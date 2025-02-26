import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Button from "@/components/Button";

describe("Button Component", () => {
  it("renders correctly", () => {
    const { getByText } = render(<Button testID="test-button" onPress={() => {}}>Click Me</Button>);
    expect(getByText("Click Me")).toBeTruthy();
  });

  it("calls onPress when clicked", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button testID="test-button" onPress={onPressMock}>Click Me</Button>);

    fireEvent.press(getByText("Click Me"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("applies custom styles if provided", () => {
    const customStyle = { backgroundColor: "blue" };
    const { getByTestId } = render(<Button testID="test-button" onPress={() => {}} style={customStyle}>Styled</Button>);

    expect(getByTestId("test-button").props.style).toMatchObject(customStyle);
  });
});
