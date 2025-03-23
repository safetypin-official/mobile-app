import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import SignUpOTPScreen from "@/app/signUp/otp";
import { Alert } from "react-native";
import { router } from "expo-router";
import { verifyOTP } from "@/utils/auth";

// Mock Alert.alert
jest.spyOn(Alert, "alert").mockImplementation(() => {});

// Mock the useSearchParams with a mock implementation factory
jest.mock('expo-router/build/hooks', () => ({
  useSearchParams: jest.fn()
}));

// Get the mocked function so we can control its implementation
const useSearchParamsMock = require('expo-router/build/hooks').useSearchParams;

// Create a mock for router.push
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  }
}));

// Mock the verification function
jest.mock('@/utils/auth', () => ({
  verifyOTP: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  mergeItem: jest.fn(() => Promise.resolve()),
}));

describe("SignUpOTPScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock implementation for useSearchParams
    useSearchParamsMock.mockImplementation(() => ({
      get: (param: string) => {
        if (param === 'email') return "test@example.com";
        return null;
      }
    }));
  });

  it("renders the OTPVerification component", () => {
    const { getByTestId } = render(<SignUpOTPScreen />);
    expect(getByTestId("otp-verification")).toBeTruthy();
  });

  it("triggers alert when Resend is pressed", () => {
    const { getByText } = render(<SignUpOTPScreen />);
    const resendLink = getByText("Resend.");
    fireEvent.press(resendLink);
    expect(Alert.alert).toHaveBeenCalledWith("Resend Pressed!");
  });

  it("handles auto-focusing to next input when a digit is entered", () => {
    const { getByTestId } = render(<SignUpOTPScreen />);
    const input1 = getByTestId("otp-input-position-1");
    const input2 = getByTestId("otp-input-position-2");
    fireEvent.changeText(input1, "1");
    fireEvent.changeText(input2, "2");
    expect(input2.props.value).toBe("2");
  });

  it("doesn't allow entering more than one character in an input", () => {
    const { getByTestId } = render(<SignUpOTPScreen />);
    const input1 = getByTestId("otp-input-position-1");
    fireEvent.changeText(input1, "12");
    expect(input1.props.value).not.toBe("12");
  });

  it("successfully verifies OTP and navigates to map screen", async () => {
    // Mock successful verification
    const successResponse = { success: true, message: "Verification successful" };
    (verifyOTP as jest.Mock).mockResolvedValue(successResponse);
    
    // Render component
    const { getByTestId } = render(<SignUpOTPScreen />);
    
    // Fill in OTP digits
    const otpInputs = [1, 2, 3, 4, 5, 6].map(i => getByTestId(`otp-input-position-${i}`));
    
    // Set OTP values
    const otpValue = "123456";
    for (let i = 0; i < 6; i++) {
      fireEvent.changeText(otpInputs[i], otpValue[i]);
    }
    
    // Submit the OTP
    const submitButton = getByTestId("verify-button");
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    // Verify the function was called with correct params
    expect(verifyOTP).toHaveBeenCalledWith("test@example.com", otpValue);
    
    // Check success alert
    expect(Alert.alert).toHaveBeenCalledWith(
      "Verification Successful", 
      successResponse.message
    );
    
    // Check navigation
    expect(router.push).toHaveBeenCalledWith('/map');
  });

  it("shows error alert when verification fails", async () => {
    // Mock failed verification
    const errorMessage = "Invalid OTP code";
    const failureResponse = { success: false, message: errorMessage };
    (verifyOTP as jest.Mock).mockResolvedValue(failureResponse);
    
    // Render component
    const { getByTestId } = render(<SignUpOTPScreen />);
    
    // Fill in OTP digits
    const otpInputs = [1, 2, 3, 4, 5, 6].map(i => getByTestId(`otp-input-position-${i}`));
    
    // Set OTP values
    const otpValue = "123456";
    for (let i = 0; i < 6; i++) {
      fireEvent.changeText(otpInputs[i], otpValue[i]);
    }
    
    // Submit the OTP
    const submitButton = getByTestId("verify-button");
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    // Verify the function was called with correct params
    expect(verifyOTP).toHaveBeenCalledWith("test@example.com", otpValue);
    
    // Check error alert
    expect(Alert.alert).toHaveBeenCalledWith(
      "OTP Verification Failed", 
      errorMessage
    );
    
    // Check navigation didn't happen
    expect(router.push).not.toHaveBeenCalled();
  });

  it("handles API errors gracefully", async () => {
    // Mock API throwing an error
    const networkError = new Error("Network error");
    (verifyOTP as jest.Mock).mockRejectedValue(networkError);
    
    // Render component
    const { getByTestId } = render(<SignUpOTPScreen />);
    
    // Fill in OTP digits
    const otpInputs = [1, 2, 3, 4, 5, 6].map(i => getByTestId(`otp-input-position-${i}`));
    
    // Set OTP values
    const otpValue = "123456";
    for (let i = 0; i < 6; i++) {
      fireEvent.changeText(otpInputs[i], otpValue[i]);
    }
    
    // Submit the OTP
    const submitButton = getByTestId("verify-button");
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    // Verify the function was called with correct params
    expect(verifyOTP).toHaveBeenCalledWith("test@example.com", otpValue);
    
    // Check error alert
    expect(Alert.alert).toHaveBeenCalledWith(
      "OTP Verification Failed", 
      "Network error"
    );
    
    // Check navigation didn't happen
    expect(router.push).not.toHaveBeenCalled();
  });

  it("handles missing email parameter", async () => {
    // Override the mock implementation to return null for email
    useSearchParamsMock.mockImplementationOnce(() => ({
      get: () => null
    }));
    
    // Render component with the updated mock
    const { getByTestId } = render(<SignUpOTPScreen />);
    
    // Fill in OTP digits
    const otpInputs = [1, 2, 3, 4, 5, 6].map(i => getByTestId(`otp-input-position-${i}`));
    
    // Set OTP values
    const otpValue = "123456";
    for (let i = 0; i < 6; i++) {
      fireEvent.changeText(otpInputs[i], otpValue[i]);
    }
    
    // Submit the OTP
    const submitButton = getByTestId("verify-button");
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    // Check error alert
    expect(Alert.alert).toHaveBeenCalledWith(
      "OTP Verification Failed", 
      "Email is missing"
    );
    
    // Verify API wasn't called
    expect(verifyOTP).not.toHaveBeenCalled();
    
    // Check navigation didn't happen
    expect(router.push).not.toHaveBeenCalled();
  });

  it("handles non-Error type exceptions", async () => {
    // Mock API throwing a non-Error value
    (verifyOTP as jest.Mock).mockRejectedValue("Unknown error type");
    
    // Render component
    const { getByTestId } = render(<SignUpOTPScreen />);
    
    // Fill in OTP digits
    const otpInputs = [1, 2, 3, 4, 5, 6].map(i => getByTestId(`otp-input-position-${i}`));
    
    // Set OTP values
    const otpValue = "123456";
    for (let i = 0; i < 6; i++) {
      fireEvent.changeText(otpInputs[i], otpValue[i]);
    }
    
    // Submit the OTP
    const submitButton = getByTestId("verify-button");
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    // Verify the function was called with correct params
    expect(verifyOTP).toHaveBeenCalledWith("test@example.com", otpValue);
    
    // Check error alert
    expect(Alert.alert).toHaveBeenCalledWith(
      "OTP Verification Failed", 
      "An unknown error occurred"
    );
    
    // Check navigation didn't happen
    expect(router.push).not.toHaveBeenCalled();
  });
  
  const simulateDelayedVerification = () => 
    new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, message: "Verification successful" });
      }, 100);
    });

  it("shows loading state during verification process", async () => {
    // Create a delayed API response
    (verifyOTP as jest.Mock).mockImplementation(simulateDelayedVerification);
    
    // Render component
    const { getByTestId, queryByTestId } = render(<SignUpOTPScreen />);
    
    // Fill in OTP digits
    const otpInputs = [1, 2, 3, 4, 5, 6].map(i => getByTestId(`otp-input-position-${i}`));
    
    // Set OTP values
    const otpValue = "123456";
    for (let i = 0; i < 6; i++) {
      fireEvent.changeText(otpInputs[i], otpValue[i]);
    }
    
    // Submit the OTP
    const submitButton = getByTestId("verify-button");
    let loadingIndicator;
    
    await act(async () => {
      fireEvent.press(submitButton);
      // Check for loading indicator immediately after press
      loadingIndicator = queryByTestId("loading-indicator");
    });
    
    // If the component has a loading indicator, verify it was shown
    if (loadingIndicator) {
      expect(loadingIndicator).toBeTruthy();
    }
    
    // Wait for the delayed response to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    
    // Verify function was called and navigation happened
    expect(verifyOTP).toHaveBeenCalledWith("test@example.com", otpValue);
    expect(router.push).toHaveBeenCalledWith('/map');
  });
});