import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import SignUpScreen, { onGoogleAuth } from "@/app/signUp/index";
import { Alert } from "react-native";
import { router } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

jest.spyOn(Alert, "alert");

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  router: {
    push: jest.fn(),
  },
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    configure: jest.fn(),
  },
}));

const mockedGoogleSignin = GoogleSignin as jest.Mocked<typeof GoogleSignin>;

console.log = jest.fn();

describe("SignUpScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the SignUpForm component", () => {
    render(<SignUpScreen />);

    expect(screen.getByTestId("signup-form")).toBeTruthy();
    expect(screen.getByPlaceholderText("Username")).toBeTruthy();
    expect(screen.getByPlaceholderText("E-mail address")).toBeTruthy();
    expect(screen.getByPlaceholderText("Date of Birth")).toBeTruthy();
    expect(screen.getByPlaceholderText("Password")).toBeTruthy();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeTruthy();
  });

  it("calls onSignUp when the Sign Up button is pressed with valid inputs", () => {
    render(<SignUpScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("Username"), "testuser");
    fireEvent.changeText(screen.getByPlaceholderText("E-mail address"), "test@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), "01/01/1990");
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "StrongPassword1!");
    fireEvent.changeText(screen.getByPlaceholderText("Confirm Password"), "StrongPassword1!");

    fireEvent.press(screen.getByTestId("signup-button"));
    expect(Alert.alert).toHaveBeenCalledWith("Sign Up Pressed!");
  });

  it("displays error messages for invalid email", () => {
    render(<SignUpScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("E-mail address"), "invalid-email");
    fireEvent.press(screen.getByTestId("signup-button"));

    expect(screen.getByText("Invalid email address")).toBeTruthy();
  });

  it("displays error messages for weak password", () => {
    render(<SignUpScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("Password"), "weak");
    fireEvent.press(screen.getByTestId("signup-button"));

    expect(
      screen.getByText(
        "Password must be at least 8 characters long and include a number, a special character, and an uppercase letter"
      )
    ).toBeTruthy();
  });

  it("displays error messages for mismatched passwords", () => {
    render(<SignUpScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("Password"), "StrongPassword1!");
    fireEvent.changeText(screen.getByPlaceholderText("Confirm Password"), "DifferentPassword1!");
    fireEvent.press(screen.getByTestId("signup-button"));

    expect(screen.getByText("Passwords do not match")).toBeTruthy();
  });

  it("displays error messages for missing date of birth", () => {
    render(<SignUpScreen />);

    fireEvent.press(screen.getByTestId("signup-button"));
    expect(screen.getByText("Date of Birth is required")).toBeTruthy();
  });

  it("displays error messages for invalid date of birth format", () => {
    render(<SignUpScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), "1990-01-01");
    fireEvent.press(screen.getByTestId("signup-button"));

    expect(screen.getByText("Date of Birth must be in DD/MM/YYYY format")).toBeTruthy();
  });

  it("displays error messages for age less than 16", () => {
    render(<SignUpScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), "01/01/2020");
    fireEvent.press(screen.getByTestId("signup-button"));

    expect(screen.getByText("You must be at least 16 years old")).toBeTruthy();
  });

  it("displays error messages for missing username", () => {
    render(<SignUpScreen />);

    fireEvent.press(screen.getByTestId("signup-button"));
    expect(screen.getByText("Username is required")).toBeTruthy();
  });

  it("navigates to login screen when Log In link is pressed", () => {
    render(<SignUpScreen />);

    fireEvent.press(screen.getByTestId("login-link"));
    expect(router.push).toHaveBeenCalledWith("/");
  });

  describe("isAtLeast16", () => {
    it("returns true if the user is exactly 16 years old today", () => {
      render(<SignUpScreen />);

      const today = new Date();
      const dob = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
      const dateOfBirth = `${String(dob.getDate()).padStart(2, "0")}/${String(dob.getMonth() + 1).padStart(2, "0")}/${dob.getFullYear()}`;

      fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), dateOfBirth);
      fireEvent.press(screen.getByTestId("signup-button"));

      expect(screen.queryByText("You must be at least 16 years old")).toBeNull();
    });

    it("returns true if the user is older than 16", () => {
      render(<SignUpScreen />);

      const today = new Date();
      const dob = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
      const dateOfBirth = `${String(dob.getDate()).padStart(2, "0")}/${String(dob.getMonth() + 1).padStart(2, "0")}/${dob.getFullYear()}`;

      fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), dateOfBirth);
      fireEvent.press(screen.getByTestId("signup-button"));

      expect(screen.queryByText("You must be at least 16 years old")).toBeNull();
    });

    it("returns false if the user is younger than 16", () => {
      render(<SignUpScreen />);

      const today = new Date();
      const dob = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
      const dateOfBirth = `${String(dob.getDate()).padStart(2, "0")}/${String(dob.getMonth() + 1).padStart(2, "0")}/${dob.getFullYear()}`;

      fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), dateOfBirth);
      fireEvent.press(screen.getByTestId("signup-button"));

      expect(screen.getByText("You must be at least 16 years old")).toBeTruthy();
    });

    it("returns false if the user's birthday hasn't occurred yet this year", () => {
      render(<SignUpScreen />);

      const today = new Date();
      const dob = new Date(today.getFullYear() - 16, today.getMonth() + 1, today.getDate());
      const dateOfBirth = `${String(dob.getDate()).padStart(2, "0")}/${String(dob.getMonth() + 1).padStart(2, "0")}/${dob.getFullYear()}`;

      fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), dateOfBirth);
      fireEvent.press(screen.getByTestId("signup-button"));

      expect(screen.getByText("You must be at least 16 years old")).toBeTruthy();
    });
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
        name: "Test User",
      },
    } as any;

    mockedGoogleSignin.hasPlayServices.mockResolvedValue(true);
    mockedGoogleSignin.signIn.mockResolvedValue(mockUserInfo);

    await onGoogleAuth();

    expect(mockedGoogleSignin.hasPlayServices).toHaveBeenCalledTimes(1);
    expect(mockedGoogleSignin.signIn).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("success");
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

  it("triggers Apple auth alert when the Apple auth button is pressed", () => {
    render(<SignUpScreen />);

    fireEvent.press(screen.getByTestId("apple-auth"));
    expect(Alert.alert).toHaveBeenCalledWith("Apple Auth Pressed!");
  });
});