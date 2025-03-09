import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import OTPVerificationScreen from "@/app/forgotPassword/otpVerificationScreen";
import { Alert } from "react-native";
import { router } from "expo-router";

// Mock Alert.alert
jest.spyOn(Alert, "alert").mockImplementation(() => {});

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  router: {
    push: jest.fn(),
  },
}));

describe("Password OTPVerificationScreen", () => {
  beforeEach(() => {
    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  it("renders the OTPVerification component", () => {
    const { getByTestId } = render(<OTPVerificationScreen />);
    
    expect(getByTestId("otp-verification")).toBeTruthy();
  });

  it("displays an alert with entered OTP when verify is pressed", () => {
    const { getByTestId } = render(<OTPVerificationScreen />);
    
    // Get all the OTP inputs by their position-based testIDs
    const input1 = getByTestId("otp-input-position-1");
    const input2 = getByTestId("otp-input-position-2");
    const input3 = getByTestId("otp-input-position-3");
    const input4 = getByTestId("otp-input-position-4");

    // Enter OTP values
    fireEvent.changeText(input1, "1");
    fireEvent.changeText(input2, "2");
    fireEvent.changeText(input3, "3");
    fireEvent.changeText(input4, "4");

    // Press the verify button
    const verifyButton = getByTestId("verify-button");
    fireEvent.press(verifyButton);

    // Verify the alert was shown with the correct OTP
    expect(Alert.alert).toHaveBeenCalledWith("Entered OTP", "Your OTP is: 1234");
  });

  it("navigates to new password screen when entered OTP is correct and verify is pressed", () => {
    const { getAllByTestId, getByTestId } = render(<OTPVerificationScreen />);
    const inputs = getAllByTestId(/^otp-input-position-/);

    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2");
    fireEvent.changeText(inputs[2], "3");
    fireEvent.changeText(inputs[3], "4");

    fireEvent.press(getByTestId("verify-button"));

    expect(router.push).toHaveBeenCalledWith('/forgotPassword/newPasswordScreen');
  });

  it("works with a partial OTP", () => {
    const { getByTestId } = render(<OTPVerificationScreen />);
    
    // Get the first two OTP inputs
    const input1 = getByTestId("otp-input-position-1");
    const input2 = getByTestId("otp-input-position-2");

    // Enter only two digits
    fireEvent.changeText(input1, "1");
    fireEvent.changeText(input2, "2");

    // Press the verify button
    const verifyButton = getByTestId("verify-button");
    fireEvent.press(verifyButton);

    // Verify the alert shows the partial OTP
    expect(Alert.alert).toHaveBeenCalledWith("Entered OTP", "Your OTP is: 12");
  });

  it("triggers alert when Resend is pressed", () => {
    const { getByText } = render(<OTPVerificationScreen />);

    // Find and press the Resend text
    const resendLink = getByText("Resend.");
    fireEvent.press(resendLink);

    // Verify the resend alert was shown
    expect(Alert.alert).toHaveBeenCalledWith("Resend Pressed!");
  });

  it("handles auto-focusing to next input when a digit is entered", () => {
    const { getByTestId } = render(<OTPVerificationScreen />);
    
    // Get the first two OTP inputs
    const input1 = getByTestId("otp-input-position-1");
    const input2 = getByTestId("otp-input-position-2");

    // Enter a digit in the first input
    fireEvent.changeText(input1, "1");
    
    // Simulating focus on the second input (we can't directly test focus in react-native-testing-library)
    // but we can test that entering a value in the second input works
    fireEvent.changeText(input2, "2");
    expect(input2.props.value).toBe("2");
  });

  it("doesn't allow entering more than one character in an input", () => {
    const { getByTestId } = render(<OTPVerificationScreen />);
    
    // Get the first OTP input
    const input1 = getByTestId("otp-input-position-1");

    // Try to enter multiple characters
    fireEvent.changeText(input1, "12");
    
    // Check that no value was set (our implementation should prevent it)
    expect(input1.props.value).not.toBe("12");
  });
});