import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SignUpPage from "@/app/signup";
import { Alert } from "react-native";

jest.spyOn(Alert, "alert").mockImplementation(() => {});

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
    const mockPush = jest.fn();
    require("expo-router").router.push = mockPush;

    const { getByTestId } = render(<SignUpPage />);

    fireEvent.press(getByTestId("login-link"));

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("triggers sign up alert when the sign up button is pressed", () => {
    const { getByTestId } = render(<SignUpPage />);
    
    fireEvent.press(getByTestId("signup-button"));
    
    expect(Alert.alert).toHaveBeenCalledWith("Sign Up Pressed!");
  });
});