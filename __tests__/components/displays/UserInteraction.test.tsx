import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import UserInteraction from "../../../components/displays/UserInteraction";
import { likeIcon, dislikeIcon } from "@/assets/userInteractions";

describe("UserInteraction Component", () => {
  const mockOnPress = jest.fn();

  const interactionTypes = [
    { type: "like-icon", expectedSvg: likeIcon },
    { type: "dislike-icon", expectedSvg: dislikeIcon },
  ];

  test("renders default interaction when no type is provided", () => {
    const { getByTestId } = render(<UserInteraction onPress={mockOnPress} />);
    expect(getByTestId("user-interaction-like-icon")).toBeTruthy();
  });

  interactionTypes.forEach(({ type }) => {
    test(`renders correct icon for type "${type}"`, () => {
      const { getByTestId } = render(<UserInteraction type={type} onPress={mockOnPress} />);
      expect(getByTestId(`user-interaction-${type}`)).toBeTruthy();
    });
  });

  test("renders default interaction when an invalid type is provided", () => {
    const { getByTestId } = render(<UserInteraction type="invalid-type" onPress={mockOnPress} />);
    expect(getByTestId("user-interaction-like-icon")).toBeTruthy();
  });

  test("calls onPress when interaction icon is clicked", () => {
    const { getByTestId } = render(<UserInteraction type="like-icon" onPress={mockOnPress} />);
    fireEvent.press(getByTestId("user-interaction-like-icon"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});