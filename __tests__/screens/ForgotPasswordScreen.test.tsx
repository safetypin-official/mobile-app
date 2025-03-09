import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ForgotPasswordScreen from "@/app/forgotPassword/index";
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

describe("ForgotPasswordScreen", () => {
  it("renders ForgotPasswordForm component", () => {
    const { getByTestId } = render(<ForgotPasswordScreen />);
    
    expect(getByTestId("forgot-password")).toBeTruthy();
  });

  it("shows an error alert when email format is invalid", () => {
    const { getByPlaceholderText, getByTestId } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter email address"), "invalid-email");
    fireEvent.press(getByTestId("send-button"));

    expect(Alert.alert).toHaveBeenCalledWith("Invalid email format!");
  });

  it("navigates to password OTP screen when valid email is entered", () => {
    const { getByPlaceholderText, getByTestId } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter email address"), "user@example.com");
    fireEvent.press(getByTestId("send-button"));
    
    expect(router.push).toHaveBeenCalledWith('/forgotPassword/otpVerificationScreen');
  });

});
