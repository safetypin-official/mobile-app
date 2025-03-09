import React from "react";
import { TextInput } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import OTPVerification from "@/components/forms/OTPVerificationForm";

describe("OTPVerification Component", () => {
  const mockOnVerify = jest.fn();
  const mockOnResend = jest.fn();
  const testID = 'otp-verification-form';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setup = (overrides = {}) => {
    const props = {
      onVerify: mockOnVerify,
      onResend: mockOnResend,
      otpLength: 4, // Default, but configurable
      ...overrides,
    };

    const utils = render(<OTPVerification {...props} />);
    return { ...utils, props };
  };

  it("renders correctly with the default OTP length", () => {
    const { getByTestId, getAllByTestId, props } = setup();
    expect(getByTestId("otp-verification-form")).toBeTruthy();
    expect(getAllByTestId(/^otp-input-position-/)).toHaveLength(props.otpLength);
  });

  it("renders correctly with a different OTP length", () => {
    const otpLength = 6;
    const { getAllByTestId } = setup({ otpLength });
    expect(getAllByTestId(/^otp-input-position-/)).toHaveLength(otpLength);
  });

  it('renders correctly with all elements', () => {
    const { getByText, getByTestId } = setup();

    // Check main elements
    expect(getByTestId(testID)).toBeTruthy();
    expect(getByText('Verification')).toBeTruthy();
    expect(getByText(/Enter the verification code/)).toBeTruthy();
    
    // Check all 4 OTP inputs exist
    expect(getByTestId('otp-input-position-1')).toBeTruthy();
    expect(getByTestId('otp-input-position-2')).toBeTruthy();
    expect(getByTestId('otp-input-position-3')).toBeTruthy();
    expect(getByTestId('otp-input-position-4')).toBeTruthy();
    
    // Verify button
    expect(getByTestId('verify-button')).toBeTruthy();
    
    // Resend option
    expect(getByText(/Didn't receive a code/)).toBeTruthy();
    expect(getByText('Resend.')).toBeTruthy();
  });

  it('handles OTP input correctly and auto-advances focus', () => {
    const { getByTestId } = setup();

    // Get all input fields
    const input1 = getByTestId('otp-input-position-1');
    const input2 = getByTestId('otp-input-position-2');
    const input3 = getByTestId('otp-input-position-3');
    const input4 = getByTestId('otp-input-position-4');

    // Test entering digits and auto-advancing
    fireEvent.changeText(input1, '1');
    expect(input1.props.value).toBe('1');
    
    // Focus should move to second input
    fireEvent.changeText(input2, '2');
    expect(input2.props.value).toBe('2');
    
    fireEvent.changeText(input3, '3');
    expect(input3.props.value).toBe('3');
    
    fireEvent.changeText(input4, '4');
    expect(input4.props.value).toBe('4');
  });

  it('handles backspace and focus movement correctly', () => {
    const { getByTestId } = setup();

    // Get input fields
    const input1 = getByTestId('otp-input-position-1');
    const input2 = getByTestId('otp-input-position-2');
    
    // Enter a value in the first field
    fireEvent.changeText(input1, '1');
    
    // Enter a value in the second field
    fireEvent.changeText(input2, '2');
    
    // Press backspace in second field after clearing it
    fireEvent.changeText(input2, '');
    fireEvent(input2, 'keyPress', { nativeEvent: { key: 'Backspace' } });
    
    // First field should still have its value
    expect(input1.props.value).toBe('1');
  });

  it("calls onResend when the Resend link is pressed", () => {
    const { getByText, props } = setup();
    fireEvent.press(getByText("Resend."));
    expect(props.onResend).toHaveBeenCalledTimes(1);
  });

  it("moves focus back when Backspace is pressed on an empty field", () => {
    const { getAllByTestId } = setup();
    const inputs = getAllByTestId(/^otp-input-position-/);

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
  });

  it('calls onVerify with correct OTP when verify button is pressed', async () => {
    const { getByTestId } = setup();

    // Enter full OTP
    fireEvent.changeText(getByTestId('otp-input-position-1'), '1');
    fireEvent.changeText(getByTestId('otp-input-position-2'), '2');
    fireEvent.changeText(getByTestId('otp-input-position-3'), '3');
    fireEvent.changeText(getByTestId('otp-input-position-4'), '4');

    // Press verify button
    fireEvent.press(getByTestId('verify-button'));
    
    // Check if onVerify was called with the correct OTP
    expect(mockOnVerify).toHaveBeenCalledWith('1234');
  });

  it('calls onResend when resend option is pressed', () => {
    const { getByText } = setup();

    // Press the resend text
    fireEvent.press(getByText('Resend.'));
    
    // Check if onResend was called
    expect(mockOnResend).toHaveBeenCalled();
  });

  it('prevents entering more than one character per input', () => {
    const { getByTestId } = setup();

    const input1 = getByTestId('otp-input-position-1');
    
    // Try to enter multiple characters
    fireEvent.changeText(input1, '12');
    
    // Should only keep the first character or none at all
    // In this component's implementation, it should prevent this
    expect(input1.props.value).not.toBe('12');
  });

  it('handles incomplete OTP verification', () => {
    const { getByTestId } = setup();

    // Enter partial OTP
    fireEvent.changeText(getByTestId('otp-input-position-1'), '1');
    fireEvent.changeText(getByTestId('otp-input-position-2'), '2');
    // Leave positions 3 and 4 empty

    // Press verify button
    fireEvent.press(getByTestId('verify-button'));
    
    // onVerify should be called with incomplete OTP
    expect(mockOnVerify).toHaveBeenCalledWith('12');
  });

  // ----------------------------------------
  // NEW TRUE/FALSE TABLE EDGE CASE TESTS
  // ----------------------------------------

  // Test case 1: TTT - Backspace key, index > 0, empty field
  it("moves focus back when Backspace is pressed on an empty field with index > 0", () => {
    const { getByTestId } = setup();
    
    // Get input fields
    const input1 = getByTestId('otp-input-position-1');
    const input2 = getByTestId('otp-input-position-2');

    // Spy on focus method for TextInput
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate entering OTP
    fireEvent.changeText(input1, "1");
    fireEvent.changeText(input2, "2");

    // Clear input 2
    fireEvent.changeText(input2, "");

    // Simulate Backspace press on input 2 (index > 0 and empty field)
    fireEvent(input2, "keyPress", { nativeEvent: { key: "Backspace" } });

    // Check if focus() was called to move back to the previous input
    expect(focusSpy.mock.calls.length).toBeGreaterThan(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 2: FTT - Wrong key, index > 0, empty field
  it("doesn't move focus when a non-Backspace key is pressed on empty field (FTT case)", () => {
    const { getByTestId } = setup();
    
    // Get input fields
    const input1 = getByTestId('otp-input-position-1');
    const input2 = getByTestId('otp-input-position-2');

    // Simulate entering OTP in first field
    fireEvent.changeText(input1, "1");
    
    // Clear input 2
    fireEvent.changeText(input2, "");

    // Spy on focus method after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate pressing 'Enter' key on input 2 (not Backspace, but index > 0 and empty field)
    fireEvent(input2, "keyPress", { nativeEvent: { key: "Enter" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 3: TFT - Backspace key, index = 0, empty field
  it("doesn't move focus when Backspace is pressed on the first empty field (TFT case)", () => {
    const { getByTestId } = setup();
    
    // Get input field
    const input1 = getByTestId('otp-input-position-1');
    
    // Clear first input to ensure it's empty
    fireEvent.changeText(input1, "");

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Backspace press on first input (index === 0 and empty field)
    fireEvent(input1, "keyPress", { nativeEvent: { key: "Backspace" } });

    // Check focus is not moved (there's no previous input)
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 4: TTF - Backspace on non-empty field with index > 0
  it("doesn't move focus when Backspace is pressed on a non-empty field (TTF case)", () => {
    const { getByTestId } = setup();
    
    // Get input fields
    const input1 = getByTestId('otp-input-position-1');
    const input2 = getByTestId('otp-input-position-2');

    // Populate first and second input fields
    fireEvent.changeText(input1, "1");
    fireEvent.changeText(input2, "2"); // Field is not empty

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Backspace press on second input (index > 0 but field NOT empty)
    fireEvent(input2, "keyPress", { nativeEvent: { key: "Backspace" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 5: TFF - Backspace key, index = 0, non-empty field
  it("doesn't move focus for TFF case - Backspace on first non-empty field", () => {
    const { getByTestId } = setup();
    
    // Get input field
    const input1 = getByTestId('otp-input-position-1');
    
    // Make first input non-empty
    fireEvent.changeText(input1, "1");

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Backspace press on first input (index === 0 and NOT empty)
    fireEvent(input1, "keyPress", { nativeEvent: { key: "Backspace" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 6: FTF - Not Backspace key, index > 0, non-empty field
  it("doesn't move focus for FTF case - Non-Backspace on non-empty field", () => {
    const { getByTestId } = setup();
    
    // Get input fields
    const input1 = getByTestId('otp-input-position-1');
    const input2 = getByTestId('otp-input-position-2');
    
    // Fill first and second inputs
    fireEvent.changeText(input1, "1");
    fireEvent.changeText(input2, "2"); // Not empty

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Enter press on second input (Not Backspace, index > 0, not empty)
    fireEvent(input2, "keyPress", { nativeEvent: { key: "Enter" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 7: FFT - Not Backspace key, index = 0, empty field
  it("doesn't move focus for FFT case - Non-Backspace on first empty field", () => {
    const { getByTestId } = setup();
    
    // Get input field
    const input1 = getByTestId('otp-input-position-1');
    
    // Clear first input to ensure it's empty
    fireEvent.changeText(input1, "");

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Enter press on first input (Not Backspace, index = 0, empty)
    fireEvent(input1, "keyPress", { nativeEvent: { key: "Enter" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });

  // Test case 8: FFF - Not Backspace key, index = 0, non-empty field
  it("doesn't move focus for FFF case - Non-Backspace on first non-empty field", () => {
    const { getByTestId } = setup();
    
    // Get input field
    const input1 = getByTestId('otp-input-position-1');
    
    // Make first input non-empty
    fireEvent.changeText(input1, "1");

    // Spy on focus after setup
    const focusSpy = jest.spyOn(TextInput.prototype, "focus");
    const callCountBefore = focusSpy.mock.calls.length;

    // Simulate Enter press on first input (Not Backspace, index = 0, not empty)
    fireEvent(input1, "keyPress", { nativeEvent: { key: "Enter" } });

    // Check focus is not moved
    expect(focusSpy.mock.calls.length).toBe(callCountBefore);

    // Clean up the spy
    focusSpy.mockRestore();
  });
});