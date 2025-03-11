import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";

describe("ForgotPasswordForm Component", () => {
  const setup = (overrides = {}) => {
    const props = {
      onSend: jest.fn(),
      setEmail: jest.fn(),
      ...overrides,
    };

    const utils = render(<ForgotPasswordForm {...props} />);

    return { ...utils, props };
  };

  it("renders correctly", () => {
    const { getByTestId, getByPlaceholderText } = setup();

    expect(getByTestId("forgot-password-form")).toBeTruthy();
    expect(getByPlaceholderText("Enter email address")).toBeTruthy();
  });

  it("calls setEmail when typing in the input field", () => {
    const { getByPlaceholderText, props } = setup();
    const input = getByPlaceholderText("Enter email address");

    fireEvent.changeText(input, "test@example.com");
    expect(props.setEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("calls onSend when the Send button is pressed", () => {
    const { getByTestId, props } = setup();

    fireEvent.press(getByTestId("send-button"));
    expect(props.onSend).toHaveBeenCalledTimes(1);
  });
});
