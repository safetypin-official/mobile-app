import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LoginForm from "@/components/LoginForm";

describe("LoginForm Component", () => {
  it("renders correctly", () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <LoginForm testID="login-test" onForgotPassword={() => {}} onSignUp={() => {}} onLogIn={() => {}} />
    );

    expect(getByTestId("login-button")).toBeTruthy();
    expect(getByPlaceholderText("Username/E-mail address")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
  });

  it("calls onForgotPassword when 'Forgot password?' is clicked", () => {
    const onForgotPasswordMock = jest.fn();
    const { getByText } = render(
      <LoginForm testID="login-test" onForgotPassword={onForgotPasswordMock} onSignUp={() => {}} onLogIn={() => {}} />
    );

    fireEvent.press(getByText("Forgot password?"));
    expect(onForgotPasswordMock).toHaveBeenCalledTimes(1);
  });

  it("calls onSignUp when 'Sign up.' is clicked", () => {
    const onSignUpMock = jest.fn();
    const { getByText } = render(
      <LoginForm testID="login-test" onForgotPassword={() => {}} onSignUp={onSignUpMock} onLogIn={() => {}} />
    );

    fireEvent.press(getByText("Sign up."));
    expect(onSignUpMock).toHaveBeenCalledTimes(1);
  });

  it("calls onLogIn when login button is pressed", () => {
    const onLogInMock = jest.fn();
    const { getByTestId } = render(
      <LoginForm testID="login-test" onForgotPassword={() => {}} onSignUp={() => {}} onLogIn={onLogInMock} />
    );

    fireEvent.press(getByTestId("login-button"));
    expect(onLogInMock).toHaveBeenCalledTimes(1);
  });
});
