import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SignUpPage from "@/app/signup";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  router: {
    push: jest.fn(),
  },
}));

describe("SignUpPage", () => {
  it("renders the SignUpForm component", () => {
    const { getAllByText, getByPlaceholderText } = render(<SignUpPage />);

    const signUpTexts = getAllByText("Sign Up");
    expect(signUpTexts[0]).toBeTruthy();

    expect(getByPlaceholderText("Username")).toBeTruthy();
    expect(getByPlaceholderText("E-mail address")).toBeTruthy();
    expect(getByPlaceholderText("Date of Birth")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByPlaceholderText("Confirm Password")).toBeTruthy();
  });

  it("navigates to the login page when Log In link is pressed", () => {
    // Mock the router.push function
    const mockPush = jest.fn();
    require("expo-router").router.push = mockPush;

    // Render the SignUpPage component
    const { getByTestId } = render(<SignUpPage />);

    // Simulate pressing the "Log In" link
    fireEvent.press(getByTestId("login-link"));

    // Verify that router.push was called with "/"
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});