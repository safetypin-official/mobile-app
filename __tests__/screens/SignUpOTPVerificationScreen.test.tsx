import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SignUpOTPScreen from "@/app/signUp/otp";
import { Alert } from "react-native";
import { router } from "expo-router";

jest.spyOn(Alert, "alert").mockImplementation(() => {});

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  router: {
    push: jest.fn(),
  },
}));

describe("SignUpOTPScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the OTPVerification component", () => {
    const { getByTestId } = render(<SignUpOTPScreen />);
    
    expect(getByTestId("otp-verification")).toBeTruthy();
  });

  it("displays an alert with entered OTP when verify is pressed", () => {
    const { getByTestId } = render(<SignUpOTPScreen />);
    
    // Get all the OTP inputs by their position-based testIDs
    const input1 = getByTestId("otp-input-position-1");
    const input2 = getByTestId("otp-input-position-2");
    const input3 = getByTestId("otp-input-position-3");
    const input4 = getByTestId("otp-input-position-4");
    const input5 = getByTestId("otp-input-position-5");
    const input6 = getByTestId("otp-input-position-6");


    // Enter OTP values
    fireEvent.changeText(input1, "1");
    fireEvent.changeText(input2, "2");
    fireEvent.changeText(input3, "3");
    fireEvent.changeText(input4, "4");
    fireEvent.changeText(input5, "5");
    fireEvent.changeText(input6, "6");

    // Press the verify button
    const verifyButton = getByTestId("verify-button");
    fireEvent.press(verifyButton);

    // Verify the alert was shown with the correct OTP
    expect(Alert.alert).toHaveBeenCalledWith("Entered OTP", "Your OTP is: 123456");
  });

  it("navigates to login screen when entered OTP is correct and verify is pressed", () => {
    const { getAllByTestId, getByTestId } = render(<SignUpOTPScreen />);
    const inputs = getAllByTestId(/^otp-input-position-/);

    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2");
    fireEvent.changeText(inputs[2], "3");
    fireEvent.changeText(inputs[3], "4");
    fireEvent.changeText(inputs[4], "5");
    fireEvent.changeText(inputs[5], "6");

    fireEvent.press(getByTestId("verify-button"));

    expect(router.push).toHaveBeenCalledWith('/');
  });

  it("works with a partial OTP", () => {
    const { getByTestId } = render(<SignUpOTPScreen />);
    
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
    const { getByText } = render(<SignUpOTPScreen />);

    // Find and press the Resend text
    const resendLink = getByText("Resend.");
    fireEvent.press(resendLink);

    // Verify the resend alert was shown
    expect(Alert.alert).toHaveBeenCalledWith("Resend Pressed!");
  });

  it("handles auto-focusing to next input when a digit is entered", () => {
    const { getByTestId } = render(<SignUpOTPScreen />);
    
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
    const { getByTestId } = render(<SignUpOTPScreen />);
    
    // Get the first OTP input
    const input1 = getByTestId("otp-input-position-1");

    // Try to enter multiple characters
    fireEvent.changeText(input1, "12");
    
    // Check that no value was set (our implementation should prevent it)
    expect(input1.props.value).not.toBe("12");
  });
});