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
  it("prevents entering more than one character in an input field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
  
    // Try to enter multiple characters at once
    fireEvent.changeText(inputs[0], "123");
  
    // Check that the input is still empty (since the function returns early)
    expect(inputs[0].props.value).toBe("");
  
    // Verify normal behavior still works
    fireEvent.changeText(inputs[0], "1");
    expect(inputs[0].props.value).toBe("1");
  });
  
  it("automatically moves focus to the next input when a digit is entered", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    
    // Spy on focus method for TextInput instances
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    
    // Enter a digit in the first input
    fireEvent.changeText(inputs[0], "1");
    
    // Verify focus moved to the next input
    expect(focusSpy).toHaveBeenCalled();
    
    // Clean up
    focusSpy.mockRestore();
  });
  
  it("doesn't move focus when on the last input field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    
    // First, fill the first three inputs without a spy
    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2");
    fireEvent.changeText(inputs[2], "3");
    
    // Set up the focus spy after reaching the last input
    // This way, we only track focus calls after reaching the last input
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;
    
    // Enter a digit in the last input
    fireEvent.changeText(inputs[3], "4");
    
    // The number of focus calls should not increase
    // This test checks the condition: "if (text !== "" && index < otp.length - 1)"
    // When index === 3 (last input), the condition is false
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);
    
    // Clean up
    focusSpy.mockRestore();
  });

    // Test case 1: TTT - Backspace key, index > 0, empty field
  it("moves focus back when Backspace is pressed on an empty field with index > 0", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");

    // Spy on focus method for all TextInput instances
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate entering OTP
    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2");

    // Clear input 1
    fireEvent.changeText(inputs[1], "");

    // Simulate Backspace press on input 1 (index > 0 and empty field)
    fireEvent(inputs[1], "keyPress", { nativeEvent: { key: "Backspace" } });

    // Check if focus() was called to move back to the previous input
    expect(focusSpy.mock.calls.length).toBeGreaterThan(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 2: FTT - Wrong key, index > 0, empty field
  it("doesn't move focus when a non-Backspace key is pressed (FTT case)", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");

    // Simulate entering OTP in first field
    fireEvent.changeText(inputs[0], "1");
    
    // Clear input 1
    fireEvent.changeText(inputs[1], "");

    // Spy on focus method after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate pressing 'Enter' key on input 1 (not Backspace, but index > 0 and empty field)
    fireEvent(inputs[1], "keyPress", { nativeEvent: { key: "Enter" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 3: TFT - Backspace key, index = 0, empty field
  it("doesn't move focus when Backspace is pressed on the first field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    
    // Clear first input to ensure it's empty
    fireEvent.changeText(inputs[0], "");

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Backspace press on first input (index === 0 and empty field)
    fireEvent(inputs[0], "keyPress", { nativeEvent: { key: "Backspace" } });

    // Check focus is not moved (there's no previous input)
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 4: TTF - Backspace on non-empty field with index > 0
  it("doesn't move focus when Backspace is pressed on a non-empty field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");

    // Populate first and second input fields
    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2"); // Field is not empty

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Backspace press on second input (index > 0 but field NOT empty)
    fireEvent(inputs[1], "keyPress", { nativeEvent: { key: "Backspace" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 5: TFF - Backspace key, index = 0, non-empty field
  it("doesn't move focus for TFF case - Backspace on first non-empty field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    
    // Make first input non-empty
    fireEvent.changeText(inputs[0], "1");

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Backspace press on first input (index === 0 and NOT empty)
    fireEvent(inputs[0], "keyPress", { nativeEvent: { key: "Backspace" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 6: FTF - Not Backspace key, index > 0, non-empty field
  it("doesn't move focus for FTF case - Non-Backspace on non-empty field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    
    // Fill first and second inputs
    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2"); // Not empty

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Enter press on second input (Not Backspace, index > 0, not empty)
    fireEvent(inputs[1], "keyPress", { nativeEvent: { key: "Enter" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 7: FFT - Not Backspace key, index = 0, empty field
  it("doesn't move focus for FFT case - Non-Backspace on first empty field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    
    // Clear first input to ensure it's empty
    fireEvent.changeText(inputs[0], "");

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Enter press on first input (Not Backspace, index = 0, empty)
    fireEvent(inputs[0], "keyPress", { nativeEvent: { key: "Enter" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 8: FFF - Not Backspace key, index = 0, non-empty field
  it("doesn't move focus for FFF case - Non-Backspace on first non-empty field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    
    // Make first input non-empty
    fireEvent.changeText(inputs[0], "1");

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Enter press on first input (Not Backspace, index = 0, not empty)
    fireEvent(inputs[0], "keyPress", { nativeEvent: { key: "Enter" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 1: TTT - Backspace key, index > 0, empty field
  it("moves focus back when Backspace is pressed on an empty field with index > 0", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");

    // Spy on focus method for all TextInput instances
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate entering OTP
    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2");

    // Clear input 1
    fireEvent.changeText(inputs[1], "");

    // Simulate Backspace press on input 1 (index > 0 and empty field)
    fireEvent(inputs[1], "keyPress", { nativeEvent: { key: "Backspace" } });

    // Check if focus() was called to move back to the previous input
    expect(focusSpy.mock.calls.length).toBeGreaterThan(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 2: FTT - Wrong key, index > 0, empty field
  it("doesn't move focus when a non-Backspace key is pressed (FTT case)", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");

    // Simulate entering OTP in first field
    fireEvent.changeText(inputs[0], "1");
    
    // Clear input 1
    fireEvent.changeText(inputs[1], "");

    // Spy on focus method after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate pressing 'Enter' key on input 1 (not Backspace, but index > 0 and empty field)
    fireEvent(inputs[1], "keyPress", { nativeEvent: { key: "Enter" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 3: TFT - Backspace key, index = 0, empty field
  it("doesn't move focus when Backspace is pressed on the first field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    
    // Clear first input to ensure it's empty
    fireEvent.changeText(inputs[0], "");

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Backspace press on first input (index === 0 and empty field)
    fireEvent(inputs[0], "keyPress", { nativeEvent: { key: "Backspace" } });

    // Check focus is not moved (there's no previous input)
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 4: TTF - Backspace on non-empty field with index > 0
  it("doesn't move focus when Backspace is pressed on a non-empty field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");

    // Populate first and second input fields
    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2"); // Field is not empty

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Backspace press on second input (index > 0 but field NOT empty)
    fireEvent(inputs[1], "keyPress", { nativeEvent: { key: "Backspace" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 5: TFF - Backspace key, index = 0, non-empty field
  it("doesn't move focus for TFF case - Backspace on first non-empty field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    
    // Make first input non-empty
    fireEvent.changeText(inputs[0], "1");

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Backspace press on first input (index === 0 and NOT empty)
    fireEvent(inputs[0], "keyPress", { nativeEvent: { key: "Backspace" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 6: FTF - Not Backspace key, index > 0, non-empty field
  it("doesn't move focus for FTF case - Non-Backspace on non-empty field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    
    // Fill first and second inputs
    fireEvent.changeText(inputs[0], "1");
    fireEvent.changeText(inputs[1], "2"); // Not empty

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Enter press on second input (Not Backspace, index > 0, not empty)
    fireEvent(inputs[1], "keyPress", { nativeEvent: { key: "Enter" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 7: FFT - Not Backspace key, index = 0, empty field
  it("doesn't move focus for FFT case - Non-Backspace on first empty field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    
    // Clear first input to ensure it's empty
    fireEvent.changeText(inputs[0], "");

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Enter press on first input (Not Backspace, index = 0, empty)
    fireEvent(inputs[0], "keyPress", { nativeEvent: { key: "Enter" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 8: FFF - Not Backspace key, index = 0, non-empty field
  it("doesn't move focus for FFF case - Non-Backspace on first non-empty field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId("otp-input");
    
    // Make first input non-empty
    fireEvent.changeText(inputs[0], "1");

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Enter press on first input (Not Backspace, index = 0, not empty)
    fireEvent(inputs[0], "keyPress", { nativeEvent: { key: "Enter" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });
});
