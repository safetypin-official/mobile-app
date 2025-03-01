import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LoginScreen from "@/app/index";
import { Alert } from "react-native";

jest.spyOn(Alert, "alert");

describe("LoginScreen", () => {
  it("renders the LoginForm component", () => {
    const { getByTestId } = render(<LoginScreen />);
    
    expect(getByTestId("login-screen")).toBeTruthy();
  });

  it("triggers forgot password alert when the button is pressed", () => {
    const { getByText } = render(<LoginScreen />);
    
    fireEvent.press(getByText("Forgot password?"));
    
    expect(Alert.alert).toHaveBeenCalledWith("Forgot Password Pressed!");
  });

  it("triggers sign up alert when the sign-up text is pressed", () => {
    const { getByText } = render(<LoginScreen />);
    
    fireEvent.press(getByText("Sign up."));
    
    expect(Alert.alert).toHaveBeenCalledWith("Sign Up Pressed!");
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
