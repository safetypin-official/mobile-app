import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MoreOptionsButton from "../components/MoreOptionsButton";

jest.mock("@expo/vector-icons/Ionicons", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock("@expo/vector-icons/AntDesign", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

test("calls correct functions on button press", () => {
  const mockClose = jest.fn();
  const mockSendMessage = jest.fn();
  const mockReport = jest.fn();

  const { getByTestId } = render(
    <MoreOptionsButton closeModal={mockClose} onSendMessage={mockSendMessage} onReport={mockReport} />
  );

  fireEvent.press(getByTestId("send-message"));
  expect(mockSendMessage).toHaveBeenCalled();

  fireEvent.press(getByTestId("report-post"));
  expect(mockReport).toHaveBeenCalled();
});
