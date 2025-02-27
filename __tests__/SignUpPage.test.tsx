import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SignUpPage from "@/app/signup";
import { useRouter } from "expo-router";

// Mock expo-router's useRouter
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("SignUpPage", () => {
  it("renders the SignUpForm component", () => {
    const { getByText, getByPlaceholderText } = render(<SignUpPage />);

    expect(getByText("Sign Up")).toBeTruthy();
    expect(getByPlaceholderText("Username")).toBeTruthy();
    expect(getByPlaceholderText("E-mail address")).toBeTruthy();
    expect(getByPlaceholderText("Date of Birth")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByPlaceholderText("Confirm Password")).toBeTruthy();
  });

  it("navigates to the login page when Log In link is pressed", () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    const { getByText } = render(<SignUpPage />);

    fireEvent.press(getByText("Log In."));

    expect(mockPush).toHaveBeenCalledWith("/");
  });
});