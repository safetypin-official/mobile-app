import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Tag from "../../../components/displays/Tags";

const tagTypes = [
  "lost-item",
  "found-item",
  "theft",
  "harassment",
  "flood",
  "assault",
  "fire",
  "other-disaster",
  "earthquake",
  "other-crime",
];

describe("Tag Component", () => {
  const mockOnPress = jest.fn();

  test("renders default tag when no type is provided", () => {
    const { getByTestId } = render(<Tag onPress={mockOnPress} />);
    expect(getByTestId("tag-icon-other-crime")).toBeTruthy();
  });

  tagTypes.forEach((type) => {
    test(`renders correct tag for type "${type}"`, () => {
      const { getByTestId } = render(<Tag type={type} onPress={mockOnPress} />);
      expect(getByTestId(`tag-icon-${type}`)).toBeTruthy();
    });
  });

  test("renders default tag when an invalid type is provided", () => {
    const { getByTestId } = render(<Tag type="invalid-type" onPress={mockOnPress} />);
    expect(getByTestId("tag-icon-other-crime")).toBeTruthy();
  });

  test("calls onPress when tag is clicked", () => {
    const { getByTestId } = render(<Tag type="fire" onPress={mockOnPress} />);
    fireEvent.press(getByTestId("tag-button"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});