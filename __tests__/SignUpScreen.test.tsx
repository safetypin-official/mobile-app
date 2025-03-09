import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react-native";
import SignUpScreen from "@/app/signUp/index";
import { Alert } from "react-native";
import { router } from "expo-router";
import { onGoogleAuth, onAppleIDAuth, registerEmailPassword } from "@/utils/auth";

// Mock the dependencies
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("@/utils/auth", () => ({
  onGoogleAuth: jest.fn(),
  onAppleIDAuth: jest.fn(),
  registerEmailPassword: jest.fn(),
}));

// Mock the SignUpForm component
jest.mock("@/components/SignUpForm", () => {
  const React = require("react");
  const { View, TouchableOpacity, Text, TextInput } = require("react-native");
  
  return function MockSignUpForm(props: { onSignUp: (arg0: { username: string; email: string; dateOfBirth: string; password: string; }) => void; testID: any; onLogIn: any; onGoogleAuth: any; onAppleAuth: any; }) {
    const handleSubmit = () => {
      props.onSignUp({
        username: "testuser",
        email: "test@example.com",
        dateOfBirth: "01/01/1990",
        password: "StrongPassword1!"
      });
    };
    
    return (
      <View testID={props.testID}>
        <TextInput placeholder="Username" />
        <TextInput placeholder="E-mail address" />
        <TextInput placeholder="DD/MM/YYYY" />
        <TextInput placeholder="Password" secureTextEntry />
        <TextInput placeholder="Confirm Password" secureTextEntry />
        <TouchableOpacity testID="signup-button" onPress={handleSubmit}>
          <Text>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="login-link" onPress={props.onLogIn}>
          <Text>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="google-auth" onPress={props.onGoogleAuth}>
          <Text>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="apple-auth" onPress={props.onAppleAuth}>
          <Text>Apple</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.spyOn(Alert, "alert");

console.log = jest.fn();
console.error = jest.fn();

describe("SignUpScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the SignUpForm component", () => {
    render(<SignUpScreen />);
    expect(screen.getByTestId("signup-form")).toBeTruthy();
  });

  it("navigates to login screen when Log In link is pressed", () => {
    render(<SignUpScreen />);
    fireEvent.press(screen.getByTestId("login-link"));
    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("calls registerEmailPassword and formats date properly when the Sign Up button is pressed", async () => {
    // Setup the mocks
    const mockRegisterResult = { success: true };
    (registerEmailPassword as jest.Mock).mockResolvedValue(mockRegisterResult);

    render(<SignUpScreen />);

    // Submit the form
    fireEvent.press(screen.getByTestId("signup-button"));

    await waitFor(() => {
      expect(registerEmailPassword).toHaveBeenCalledWith(
        "test@example.com",
        "StrongPassword1!",
        "testuser",
        "1990-01-01"
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        "Registration Successful",
        "Your account has been created successfully!"
      );
    });
  });

  it("handles registerEmailPassword errors", async () => {
    // Setup the mocks to simulate an error
    const mockError = new Error("Registration failed");
    (registerEmailPassword as jest.Mock).mockRejectedValue(mockError);

    render(<SignUpScreen />);

    // Submit the form
    fireEvent.press(screen.getByTestId("signup-button"));

    await waitFor(() => {
      expect(registerEmailPassword).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("Sign up failed:", mockError);
    });
  });

  it("calls onGoogleAuth when Google button is pressed", async () => {
    // Setup the mock to return a successful result
    const mockGoogleResult = { success: true };
    (onGoogleAuth as jest.Mock).mockResolvedValue(mockGoogleResult);

    render(<SignUpScreen />);
    fireEvent.press(screen.getByTestId("google-auth"));

    await waitFor(() => {
      expect(onGoogleAuth).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("Google auth successful");
    });
  });

  it("handles errors during Google authentication", async () => {
    // Setup the mock to simulate an error
    const mockError = new Error("Google auth failed");
    (onGoogleAuth as jest.Mock).mockRejectedValue(mockError);

    render(<SignUpScreen />);
    fireEvent.press(screen.getByTestId("google-auth"));

    await waitFor(() => {
      expect(onGoogleAuth).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith("Google auth failed:", mockError);
    });
  });

  it("calls onAppleIDAuth when Apple button is pressed", async () => {
    // Setup the mock to return a successful result
    const mockAppleResult = { success: true };
    (onAppleIDAuth as jest.Mock).mockResolvedValue(mockAppleResult);

    render(<SignUpScreen />);
    fireEvent.press(screen.getByTestId("apple-auth"));

    await waitFor(() => {
      expect(onAppleIDAuth).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("Apple auth successful");
    });
  });

  it("handles errors during Apple authentication", async () => {
    // Setup the mock to simulate an error
    const mockError = new Error("Apple auth failed");
    (onAppleIDAuth as jest.Mock).mockRejectedValue(mockError);

    render(<SignUpScreen />);
    fireEvent.press(screen.getByTestId("apple-auth"));

    await waitFor(() => {
      expect(onAppleIDAuth).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith("Apple auth failed:", mockError);
    });
  });
});