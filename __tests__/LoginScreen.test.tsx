import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LoginScreen from "@/app/index";
import { Alert } from "react-native";
import { router } from 'expo-router';

jest.spyOn(Alert, "alert");

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  router: {
    push: jest.fn(),
  },
}));

describe("LoginScreen", () => {
  it("renders the LoginForm component", () => {
    const { getByTestId } = render(<LoginScreen />);
    
    expect(getByTestId("login-screen")).toBeTruthy();
  });

  it("navigates to forgotPassword screen on button press", () => {
    const { getByText } = render(<LoginScreen />);
    
    fireEvent.press(getByText("Forgot password?"));
    
    expect(router.push).toHaveBeenCalledWith('/forgotPassword');
  });

  it("navigates to sign up screen when sign-up text is pressed", () => {
    const { getByText } = render(<LoginScreen />);
    
    fireEvent.press(getByText("Sign up."));
    
    expect(router.push).toHaveBeenCalledWith('/signUp');
  });

  it("shows error alert when email format is invalid", () => {
    const { getByTestId, getByPlaceholderText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText("Username/E-mail address"), "invalid-email");
    fireEvent.press(getByTestId("login-button"));
    
    expect(Alert.alert).toHaveBeenCalledWith("Invalid email format!");
  });

  it("triggers log in alert when a valid email is entered", () => {
    const { getByTestId, getByPlaceholderText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText("Username/E-mail address"), "user@example.com");
    fireEvent.press(getByTestId("login-button"));
    
    expect(Alert.alert).toHaveBeenCalledWith("Log In Pressed!");
  });

  it("triggers google auth alert when the google auth button is pressed", () => {
    const { getByTestId } = render(<LoginScreen />);
    
    fireEvent.press(getByTestId("google-auth"));
    
    expect(Alert.alert).toHaveBeenCalledWith("Google Auth Pressed!");
  });

  it("triggers apple auth alert when the apple auth button is pressed", () => {
    const { getByTestId } = render(<LoginScreen />);
    
    fireEvent.press(getByTestId("apple-auth"));
    
    expect(Alert.alert).toHaveBeenCalledWith("Apple Auth Pressed!");
  });
});
