import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
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

  it("renders without crashing", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("signup-form")).toBeTruthy();
  });

  it("calls onSignUp when the Sign Up button is pressed", () => {
    const { getByTestId } = renderComponent();
    fireEvent.press(getByTestId("signup-button"));
    expect(mockOnSignUp).toHaveBeenCalled();
  });

  it("calls onLogIn when the Log In link is pressed", () => {
    const { getByTestId } = renderComponent();
    fireEvent.press(getByTestId("login-link"));
    expect(mockOnLogIn).toHaveBeenCalled();
  });
});