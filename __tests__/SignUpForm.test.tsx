import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SignUpForm from "@/components/SignUpForm";

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
    const { getByText } = renderComponent();
    fireEvent.press(getByText("Sign Up"));
    expect(mockOnSignUp).toHaveBeenCalled();
  });

  it("calls onLogIn when the Log In link is pressed", () => {
    const { getByText } = renderComponent();
    fireEvent.press(getByText("Log In."));
    expect(mockOnLogIn).toHaveBeenCalled();
  });
});