import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LoginForm, { onGoogleAuth } from "@/components/LoginForm";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    hasPlayServices: jest.fn(),
    signIn: jest.fn()
  }
}));

const mockedGoogleSignin = GoogleSignin as jest.Mocked<typeof GoogleSignin>;

console.log = jest.fn();

describe("LoginForm Component", () => {
  const setup = (overrides = {}) => {
    const props = {
      testID: "login-test",
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
    const { getByText, props } = setup();

    fireEvent.press(getByText("Sign up."));
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

describe("onGoogleAuth function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("successfully signs in with Google", async () => {
    const mockUserInfo = {
      data: { 
        email: "test@example.com", 
        name: "Test User" 
      }
    } as any;
    
    mockedGoogleSignin.hasPlayServices.mockResolvedValue(true);
    mockedGoogleSignin.signIn.mockResolvedValue(mockUserInfo);

    await onGoogleAuth();

    expect(mockedGoogleSignin.hasPlayServices).toHaveBeenCalledTimes(1);
    expect(mockedGoogleSignin.signIn).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(mockUserInfo.data);
  });

  it("handles errors during Google sign in", async () => {
    const mockError = new Error("Google Sign-In Error");
    
    mockedGoogleSignin.hasPlayServices.mockResolvedValue(true);
    mockedGoogleSignin.signIn.mockRejectedValue(mockError);

    await onGoogleAuth();

    expect(mockedGoogleSignin.hasPlayServices).toHaveBeenCalledTimes(1);
    expect(mockedGoogleSignin.signIn).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("error");
    expect(console.log).toHaveBeenCalledWith(mockError);
  });

  it("handles Play Services not available error", async () => {
    const mockError = new Error("Play Services not available");
    
    mockedGoogleSignin.hasPlayServices.mockRejectedValue(mockError);

    await onGoogleAuth();

    expect(mockedGoogleSignin.hasPlayServices).toHaveBeenCalledTimes(1);
    expect(mockedGoogleSignin.signIn).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("error");
    expect(console.log).toHaveBeenCalledWith(mockError);
  });
});