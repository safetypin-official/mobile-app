import React from "react";
import { TextInput } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import OTPVerification from "@/components/OTPVerification";

describe("OTPVerification Component", () => {
  const setup = (overrides = {}) => {
    const props = {
      testID: "otp-verification-test",
      onVerify: jest.fn(),
      onResend: jest.fn(),
      ...overrides,
    };

    const utils = render(<OTPVerification {...props} />);

    return { ...utils, props };
  };

  it("renders correctly", () => {
    const { getByTestId, getAllByRole, getAllByTestId } = setup();
  
    expect(getByTestId("otp-verification-test")).toBeTruthy();
    expect(getAllByRole("text")).toHaveLength(5);
    expect(getAllByTestId("otp-input")).toHaveLength(4);
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
    fireEvent(getAllByTestId("otp-input")[1], "keyPress", { nativeEvent: { key: "Backspace" } });
  
    // Check if focus() was called on the previous input
    expect(focusSpy).toHaveBeenCalled();
  
    // Clean up the spy
    focusSpy.mockRestore();
  });

  
  it("does not move focus if multiple characters are entered", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    fireEvent.changeText(inputs[0], "12");
    expect(inputs[0].props.value).toBe("");
  });

  it("does not move focus forward if last field is filled", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    fireEvent.changeText(inputs[3], "4");
    expect(inputs[3].props.value).toBe("4");
  });

  it("handles backspace properly in the first field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");

    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[0], "");
    fireEvent(inputs[0], "keyPress", { nativeEvent: { key: "Backspace" } });
    expect(inputs[0].props.value).toBe("");
  });

  it("displays the resend link and triggers resend function", () => {
    const { getByText, props } = setup();
    fireEvent.press(getByText("Resend."));
    expect(props.onResend).toHaveBeenCalledTimes(1);
  });
});
