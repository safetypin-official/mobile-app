import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NewPasswordScreen from "@/app/forgotPassword/newPasswordScreen";
import { Alert } from "react-native";
import { router } from "expo-router";

jest.spyOn(Alert, "alert");

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  router: {
    push: jest.fn(),
  },
}));

describe("NewPasswordScreen", () => {
  it("renders correctly", () => {
    const { getByTestId, getByPlaceholderText } = render(<NewPasswordScreen />);

    expect(getByTestId("title")).toBeTruthy();
    expect(getByPlaceholderText("Enter new password")).toBeTruthy();
    expect(getByPlaceholderText("Re-enter new password")).toBeTruthy();
  });

  it("shows success alert when passwords match", () => {
    const { getByPlaceholderText, getByTestId } = render(<NewPasswordScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter new password"), "password123");
    fireEvent.changeText(getByPlaceholderText("Re-enter new password"), "password123");
    fireEvent.press(getByTestId("update-button"));

    expect(Alert.alert).toHaveBeenCalledWith("Password updated successfully!");
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it("shows error alert when passwords do not match", () => {
    const { getByPlaceholderText, getByTestId } = render(<NewPasswordScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter new password"), "password123");
    fireEvent.changeText(getByPlaceholderText("Re-enter new password"), "password456");
    fireEvent.press(getByTestId("update-button"));

    expect(Alert.alert).toHaveBeenCalledWith("Passwords do not match.");
  });
});
