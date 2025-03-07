
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import OTPVerificationScreen from "@/app/forgotPassword/otpVerificationScreen";
import { Alert } from "react-native";
import { router } from "expo-router";

jest.spyOn(Alert, "alert");

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  router: {
    push: jest.fn(),
  },
}));

describe("Password OTPVerificationScreen", () => {
  it("renders the OTPVerification component", () => {
    const { getByTestId } = render(<OTPVerificationScreen />);
    
    expect(getByTestId("otp-verification")).toBeTruthy();
  });

  it("displays an alert with entered OTP when verify is pressed", () => {
    const { getAllByTestId, getByTestId } = render(<OTPVerificationScreen />);
    const inputs = getAllByTestId("otp-input");

    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2");
    fireEvent.changeText(inputs[2], "3");
    fireEvent.changeText(inputs[3], "4");

    fireEvent.press(getByTestId("verify-button"));

    expect(Alert.alert).toHaveBeenCalledWith("Entered OTP", "Your OTP is: 1234");
  });

  it("navigates to new password screen when entered OTP is correct and verify is pressed", () => {
    const { getAllByTestId, getByTestId } = render(<OTPVerificationScreen />);
    const inputs = getAllByTestId("otp-input");

    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2");
    fireEvent.changeText(inputs[2], "3");
    fireEvent.changeText(inputs[3], "4");

    fireEvent.press(getByTestId("verify-button"));

    expect(router.push).toHaveBeenCalledWith('/forgotPassword/newPasswordScreen');
  });

  it("triggers alert when Resend is pressed", () => {
    const { getByText } = render(<OTPVerificationScreen />);

    fireEvent.press(getByText("Resend."));

    expect(Alert.alert).toHaveBeenCalledWith("Resend Pressed!");
  });
});
