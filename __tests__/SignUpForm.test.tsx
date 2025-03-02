import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import SignUpForm from "@/components/SignUpForm";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  router: {
    push: jest.fn(),
  },
}));

describe("SignUpForm", () => {
  const mockOnSignUp = jest.fn();
  const mockOnLogIn = jest.fn();

  const renderComponent = () => {
    return render(
      <SignUpForm
        onSignUp={mockOnSignUp}
        onLogIn={mockOnLogIn}
        testID="signup-form"
      />
    );
  };

  beforeEach(() => {
    renderComponent();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    expect(screen.getByTestId("signup-form")).toBeTruthy();
  });

  it("calls onSignUp when the Sign Up button is pressed with valid inputs", () => {
    fireEvent.changeText(screen.getByPlaceholderText("Username"), "testuser");
    fireEvent.changeText(screen.getByPlaceholderText("E-mail address"), "test@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), "01/01/1990"); // Correct format
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "StrongPassword1!");
    fireEvent.changeText(screen.getByPlaceholderText("Confirm Password"), "StrongPassword1!");

    fireEvent.press(screen.getByTestId("signup-button"));
    expect(mockOnSignUp).toHaveBeenCalled();
  });

  it("displays error messages for invalid email", () => {
    fireEvent.changeText(screen.getByPlaceholderText("E-mail address"), "invalid-email");
    fireEvent.press(screen.getByTestId("signup-button"));

    expect(screen.getByText("Invalid email address")).toBeTruthy();
  });

  it("displays error messages for weak password", () => {
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "weak");
    fireEvent.press(screen.getByTestId("signup-button"));

    expect(
      screen.getByText(
        "Password must be at least 8 characters long and include a number, a special character, and an uppercase letter"
      )
    ).toBeTruthy();
  });

  it("displays error messages for mismatched passwords", () => {
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "StrongPassword1!");
    fireEvent.changeText(screen.getByPlaceholderText("Confirm Password"), "DifferentPassword1!");
    fireEvent.press(screen.getByTestId("signup-button"));

    expect(screen.getByText("Passwords do not match")).toBeTruthy();
  });

  it("displays error messages for missing date of birth", () => {
    fireEvent.press(screen.getByTestId("signup-button"));

    expect(screen.getByText("Date of Birth is required")).toBeTruthy();
  });

  it("displays error messages for invalid date of birth format", () => {
    fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), "1990-01-01");
    fireEvent.press(screen.getByTestId("signup-button"));

    expect(screen.getByText("Date of Birth must be in DD/MM/YYYY format")).toBeTruthy();
  });

  it("displays error messages for age less than 16", () => {
    fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), "01/01/2020");
    fireEvent.press(screen.getByTestId("signup-button"));

    expect(screen.getByText("You must be at least 16 years old")).toBeTruthy();
  });

  it("displays error messages for missing username", () => {
    fireEvent.press(screen.getByTestId("signup-button"));

    expect(screen.getByText("Username is required")).toBeTruthy();
  });

  it("calls onLogIn when the Log In link is pressed", () => {
    fireEvent.press(screen.getByTestId("login-link"));
    expect(mockOnLogIn).toHaveBeenCalled();
  });

  describe("isAtLeast16", () => {
    it("returns true if the user is exactly 16 years old today", () => {
      const today = new Date();
      const dob = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
      const dateOfBirth = `${String(dob.getDate()).padStart(2, "0")}/${String(dob.getMonth() + 1).padStart(2, "0")}/${dob.getFullYear()}`; // Correct format

      fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), dateOfBirth);
      fireEvent.press(screen.getByTestId("signup-button"));

      expect(screen.queryByText("You must be at least 16 years old")).toBeNull();
    });

    it("returns true if the user is older than 16", () => {
      const today = new Date();
      const dob = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
      const dateOfBirth = `${String(dob.getDate()).padStart(2, "0")}/${String(dob.getMonth() + 1).padStart(2, "0")}/${dob.getFullYear()}`; // Correct format

      fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), dateOfBirth);
      fireEvent.press(screen.getByTestId("signup-button"));

      expect(screen.queryByText("You must be at least 16 years old")).toBeNull();
    });

    it("returns false if the user is younger than 16", () => {
      const today = new Date();
      const dob = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
      const dateOfBirth = `${String(dob.getDate()).padStart(2, "0")}/${String(dob.getMonth() + 1).padStart(2, "0")}/${dob.getFullYear()}`; // Correct format

      fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), dateOfBirth);
      fireEvent.press(screen.getByTestId("signup-button"));

      expect(screen.getByText("You must be at least 16 years old")).toBeTruthy();
    });

    it("returns false if the user's birthday hasn't occurred yet this year", () => {
      const today = new Date();
      const dob = new Date(today.getFullYear() - 16, today.getMonth() + 1, today.getDate());
      const dateOfBirth = `${String(dob.getDate()).padStart(2, "0")}/${String(dob.getMonth() + 1).padStart(2, "0")}/${dob.getFullYear()}`; // Correct format

      fireEvent.changeText(screen.getByPlaceholderText("Date of Birth"), dateOfBirth);
      fireEvent.press(screen.getByTestId("signup-button"));

      expect(screen.getByText("You must be at least 16 years old")).toBeTruthy();
    });
  });
});