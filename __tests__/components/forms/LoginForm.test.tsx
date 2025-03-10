import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LoginForm from "@/components/forms/LoginForm";

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe("LoginForm Component", () => {
  const setup = (overrides = {}) => {
    const props = {
      onForgotPassword: jest.fn(),
      onSignUp: jest.fn(),
      onLogIn: jest.fn(),
      onGoogleAuth: jest.fn(),
      onAppleAuth: jest.fn(),
      setEmail: jest.fn(),
      ...overrides,
    };

    const utils = render(<LoginForm {...props} />);

    return { ...utils, props };
  };

  it("renders with default testID when not provided", () => {
    const { getByTestId, getByPlaceholderText } = setup();

    expect(getByTestId("login-form")).toBeTruthy();
  });

  it("renders correctly", () => {
    const { getByTestId, getByPlaceholderText } = setup();

    expect(getByTestId("login-button")).toBeTruthy();
    expect(getByPlaceholderText("Username/E-mail address")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
  });

  it("calls onForgotPassword when 'Forgot password?' is clicked", () => {
    const { getByText, props } = setup();

    fireEvent.press(getByText("Forgot password?"));
    expect(props.onForgotPassword).toHaveBeenCalledTimes(1);
  });

  it("calls onSignUp when 'Sign up.' is clicked", () => {
    const { getByTestId, props } = setup();

    fireEvent.press(getByTestId("signup-link"));
    expect(props.onSignUp).toHaveBeenCalledTimes(1);
  });

  it("calls onLogIn when login button is pressed", () => {
    const { getByTestId, props } = setup();

    fireEvent.press(getByTestId("login-button"));
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
