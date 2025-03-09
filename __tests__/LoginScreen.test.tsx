import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { router } from "expo-router";
import LoginScreen from "@/app/index";
import { onGoogleAuth, onAppleIDAuth, isValidEmail, loginWithEmail } from "@/utils/auth";

// Mock the dependencies
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("@/utils/auth", () => ({
  onGoogleAuth: jest.fn(),
  onAppleIDAuth: jest.fn(),
  isValidEmail: jest.fn(),
  loginWithEmail: jest.fn(),
}));

// Mock the LoginForm component
jest.mock("@/components/LoginForm", () => {
  const React = require("react");
  const { View, TouchableOpacity, Text, TextInput } = require("react-native");
  
  return function MockLoginForm(props: { testID: any; setEmail: any; setPassword: any; onLogIn: any; onGoogleAuth: any; onAppleAuth: any; onForgotPassword: any; onSignUp: any; }) {
    return (
      <View testID={props.testID}>
        <TextInput
          testID="email-input"
          onChangeText={props.setEmail}
          placeholder="Email"
        />
        <TextInput
          testID="password-input"
          onChangeText={props.setPassword}
          placeholder="Password"
          secureTextEntry
        />
        <TouchableOpacity 
          testID="login-button" 
          onPress={props.onLogIn}
        >
          <Text>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          testID="google-auth" 
          onPress={props.onGoogleAuth}
        >
          <Text>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          testID="apple-auth" 
          onPress={props.onAppleAuth}
        >
          <Text>Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          testID="forgot-password-link" 
          onPress={props.onForgotPassword}
        >
          <Text>Forgot Password</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          testID="signup-link" 
          onPress={props.onSignUp}
        >
          <Text>Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.spyOn(Alert, "alert");

// Mock console methods
console.log = jest.fn();
console.error = jest.fn();

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the LoginForm component", () => {
    const { getByTestId } = render(<LoginScreen />);
    expect(getByTestId("login-screen")).toBeTruthy();
  });

  it("navigates to forgot password screen when forgot password link is pressed", () => {
    const { getByTestId } = render(<LoginScreen />);
    fireEvent.press(getByTestId("forgot-password-link"));
    expect(router.push).toHaveBeenCalledWith("/forgotPassword");
  });

  it("navigates to sign up screen when sign up link is pressed", () => {
    const { getByTestId } = render(<LoginScreen />);
    fireEvent.press(getByTestId("signup-link"));
    expect(router.push).toHaveBeenCalledWith("/signUp");
  });

  it("shows alert when email is invalid during login", () => {
    (isValidEmail as jest.Mock).mockReturnValue(false);
    
    const { getByTestId } = render(<LoginScreen />);
    
    // Set email and password
    fireEvent.changeText(getByTestId("email-input"), "invalid-email");
    fireEvent.changeText(getByTestId("password-input"), "password123");
    
    // Attempt login
    fireEvent.press(getByTestId("login-button"));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      "Invalid Email",
      "Please enter a valid email address."
    );
    expect(loginWithEmail).not.toHaveBeenCalled();
  });

  it("shows alert when password is empty during login", () => {
    (isValidEmail as jest.Mock).mockReturnValue(true);
    
    const { getByTestId } = render(<LoginScreen />);
    
    // Set valid email but empty password
    fireEvent.changeText(getByTestId("email-input"), "valid@example.com");
    fireEvent.changeText(getByTestId("password-input"), "");
    
    // Attempt login
    fireEvent.press(getByTestId("login-button"));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      "Password Required",
      "Please enter your password."
    );
    expect(loginWithEmail).not.toHaveBeenCalled();
  });

  it("shows alert when password contains only whitespace", () => {
    (isValidEmail as jest.Mock).mockReturnValue(true);
    
    const { getByTestId } = render(<LoginScreen />);
    
    // Set valid email but password with only spaces
    fireEvent.changeText(getByTestId("email-input"), "valid@example.com");
    fireEvent.changeText(getByTestId("password-input"), "   ");
    
    // Attempt login
    fireEvent.press(getByTestId("login-button"));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      "Password Required",
      "Please enter your password."
    );
    expect(loginWithEmail).not.toHaveBeenCalled();
  });

  it("calls loginWithEmail when credentials are valid", async () => {
    (isValidEmail as jest.Mock).mockReturnValue(true);
    const mockLoginResult = { success: true };
    (loginWithEmail as jest.Mock).mockResolvedValue(mockLoginResult);
    
    const { getByTestId } = render(<LoginScreen />);
    
    // Set valid email and password
    fireEvent.changeText(getByTestId("email-input"), "valid@example.com");
    fireEvent.changeText(getByTestId("password-input"), "password123");
    
    // Attempt login
    fireEvent.press(getByTestId("login-button"));
    
    await waitFor(() => {
      expect(loginWithEmail).toHaveBeenCalledWith("valid@example.com", "password123");
      expect(console.log).toHaveBeenCalledWith("Email login successful:", mockLoginResult);
    });
  });

  it("handles loginWithEmail errors", async () => {
    (isValidEmail as jest.Mock).mockReturnValue(true);
    const mockError = new Error("Login failed");
    (loginWithEmail as jest.Mock).mockRejectedValue(mockError);
    
    const { getByTestId } = render(<LoginScreen />);
    
    // Set valid email and password
    fireEvent.changeText(getByTestId("email-input"), "valid@example.com");
    fireEvent.changeText(getByTestId("password-input"), "password123");
    
    // Attempt login
    fireEvent.press(getByTestId("login-button"));
    
    await waitFor(() => {
      expect(loginWithEmail).toHaveBeenCalledWith("valid@example.com", "password123");
      expect(console.error).toHaveBeenCalledWith("Email login failed:", mockError);
    });
  });

  it("handles successful Google authentication", async () => {
    const mockGoogleResult = { success: true };
    (onGoogleAuth as jest.Mock).mockResolvedValue(mockGoogleResult);
    
    const { getByTestId } = render(<LoginScreen />);
    
    // Attempt Google authentication
    fireEvent.press(getByTestId("google-auth"));
    
    await waitFor(() => {
      expect(onGoogleAuth).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("Google auth successful:", mockGoogleResult);
    });
  });

  it("handles Google authentication errors", async () => {
    const mockError = new Error("Google auth failed");
    (onGoogleAuth as jest.Mock).mockRejectedValue(mockError);
    
    const { getByTestId } = render(<LoginScreen />);
    
    // Attempt Google authentication
    fireEvent.press(getByTestId("google-auth"));
    
    await waitFor(() => {
      expect(onGoogleAuth).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith("Google auth failed in component:", mockError);
    });
  });

  it("handles successful Apple authentication", async () => {
    const mockAppleResult = { success: true };
    (onAppleIDAuth as jest.Mock).mockResolvedValue(mockAppleResult);
    
    const { getByTestId } = render(<LoginScreen />);
    
    // Attempt Apple authentication
    fireEvent.press(getByTestId("apple-auth"));
    
    await waitFor(() => {
      expect(onAppleIDAuth).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("Apple auth successful:", mockAppleResult);
    });
  });

  it("handles Apple authentication errors", async () => {
    const mockError = new Error("Apple auth failed");
    (onAppleIDAuth as jest.Mock).mockRejectedValue(mockError);
    
    const { getByTestId } = render(<LoginScreen />);
    
    // Attempt Apple authentication
    fireEvent.press(getByTestId("apple-auth"));
    
    await waitFor(() => {
      expect(onAppleIDAuth).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith("Apple auth failed in component:", mockError);
    });
  });

  it("logs email and password values when login is attempted", async () => {
    (isValidEmail as jest.Mock).mockReturnValue(true);
    (loginWithEmail as jest.Mock).mockResolvedValue({ success: true });
    
    const { getByTestId } = render(<LoginScreen />);
    
    // Set valid email and password
    fireEvent.changeText(getByTestId("email-input"), "test@example.com");
    fireEvent.changeText(getByTestId("password-input"), "testPassword");
    
    // Attempt login
    fireEvent.press(getByTestId("login-button"));
    
    expect(console.log).toHaveBeenCalledWith("test@example.com");
    expect(console.log).toHaveBeenCalledWith("testPassword");
  });
});