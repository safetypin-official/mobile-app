import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SignUpForm from "@/components/forms/SignUpForm";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

describe("SignUpForm Component", () => {
  const setup = (overrides = {}) => {
    const props = {
      testID: "signup-form",
      onSignUp: jest.fn(),
      onLogIn: jest.fn(),
      onGoogleAuth: jest.fn(),
      onAppleAuth: jest.fn(),
      ...overrides,
    };

    const utils = render(<SignUpForm {...props} />);

    return { ...utils, props };
  };

  it("renders correctly", () => {
    const { getByTestId, getByPlaceholderText } = setup();

    expect(getByTestId("signup-form")).toBeTruthy();
    expect(getByPlaceholderText("Username")).toBeTruthy();
    expect(getByPlaceholderText("E-mail address")).toBeTruthy();
    expect(getByPlaceholderText("Date of Birth")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByPlaceholderText("Confirm Password")).toBeTruthy();
  });

  it("calls onSignUp when Sign Up button is pressed with valid inputs", () => {
    const { getByTestId, getByPlaceholderText, props } = setup();

    fireEvent.changeText(getByPlaceholderText("Username"), "testuser");
    fireEvent.changeText(getByPlaceholderText("E-mail address"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Date of Birth"), "01/01/1990");
    fireEvent.changeText(getByPlaceholderText("Password"), "StrongPassword1!");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "StrongPassword1!");

    fireEvent.press(getByTestId("signup-button"));
    expect(props.onSignUp).toHaveBeenCalledTimes(1);
  });

  it("calls onLogIn when Log In link is pressed", () => {
    const { getByTestId, props } = setup();

    fireEvent.press(getByTestId("login-link"));
    expect(props.onLogIn).toHaveBeenCalledTimes(1);
  });

  it("calls onGoogleAuth when Google social button is clicked", () => {
    const { getByTestId, props } = setup();

    fireEvent.press(getByTestId("google-auth"));
    expect(props.onGoogleAuth).toHaveBeenCalledTimes(1);
  });

  it("calls onAppleAuth when Apple social button is clicked", () => {
    const { getByTestId, props } = setup();

    fireEvent.press(getByTestId("apple-auth"));
    expect(props.onAppleAuth).toHaveBeenCalledTimes(1);
  });
});