import React from "react";
import { TextInput } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import OTPVerification from "@/components/forms/OTPVerificationForm";

describe("OTPVerification Component", () => {
  const setup = (overrides = {}) => {
    const props = {
      onVerify: jest.fn(),
      onResend: jest.fn(),
      otpLength: 4, // Default, but configurable
      ...overrides,
    };

    const utils = render(<OTPVerification {...props} />);
    return { ...utils, props };
  };

  it("renders correctly with the default OTP length", () => {
    const { getByTestId, getAllByTestId, props } = setup();
    expect(getByTestId("otp-verification-form")).toBeTruthy();
    expect(getAllByTestId("otp-input")).toHaveLength(props.otpLength);
  });

  it("renders correctly with a different OTP length", () => {
    const otpLength = 6;
    const { getAllByTestId } = setup({ otpLength });
    expect(getAllByTestId("otp-input")).toHaveLength(otpLength);
  });

  it("updates OTP input fields correctly", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");

    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2");
    fireEvent.changeText(inputs[2], "3");
    fireEvent.changeText(inputs[3], "4");

    expect(inputs[0].props.value).toBe("1");
    expect(inputs[1].props.value).toBe("2");
    expect(inputs[2].props.value).toBe("3");
    expect(inputs[3].props.value).toBe("4");
  });

  it("calls onVerify with entered OTP when Verify button is pressed", () => {
    const { getAllByTestId, getByTestId, props } = setup();
    const inputs = getAllByTestId("otp-input");

    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2");
    fireEvent.changeText(inputs[2], "3");
    fireEvent.changeText(inputs[3], "4");

    fireEvent.press(getByTestId("verify-button"));
    expect(props.onVerify).toHaveBeenCalledWith("1234");
  });

  it("does not call onVerify when OTP is incomplete", () => {
    const { getAllByTestId, getByTestId, props } = setup();
    const inputs = getAllByTestId("otp-input");

    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2");

    fireEvent.press(getByTestId("verify-button"));
    expect(props.onVerify).not.toHaveBeenCalled();
  });

  it("calls onResend when the Resend link is pressed", () => {
    const { getByText, props } = setup();
    fireEvent.press(getByText("Resend."));
    expect(props.onResend).toHaveBeenCalledTimes(1);
  });

  it("moves focus back when Backspace is pressed on an empty field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");

    // Spy on focus method for all TextInput instances
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");

    // Simulate entering OTP
    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2");

    // Clear input 1
    fireEvent.changeText(inputs[1], "");

    // Simulate Backspace press on input 1
    fireEvent(inputs[1], "keyPress", { nativeEvent: { key: "Backspace" } });

    // Check if focus() was called on the previous input
    expect(focusSpy).toHaveBeenCalled();

    // Clean up the spy
    focusSpy.mockRestore();
  });
});
