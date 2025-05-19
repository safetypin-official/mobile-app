import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MoreOptionsButton from "@/components/buttons/post/MoreOptionsButton";

jest.mock("@expo/vector-icons/Ionicons", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock("@expo/vector-icons/AntDesign", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

test("calls onDelete and closeModal when Delete button is pressed", () => {
  const mockClose = jest.fn();
  const mockSendMessage = jest.fn();
  const mockReport = jest.fn();
  const mockDelete = jest.fn();

  const { getByTestId } = render(
    <MoreOptionsButton
      closeModal={mockClose}
      onSendMessage={mockSendMessage}
      onReport={mockReport}
      onDelete={mockDelete}
    />
  );

  fireEvent.press(getByTestId("delete-post"));
  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(mockClose).toHaveBeenCalledTimes(1);
  expect(mockSendMessage).not.toHaveBeenCalled();
  expect(mockReport).not.toHaveBeenCalled();
});
