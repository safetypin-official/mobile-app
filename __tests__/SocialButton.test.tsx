import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SocialButton from "@/components/SocialButton";

describe("SocialButton Component", () => {
  it("renders Google icon correctly", () => {
    const { getByTestId } = render(
      <SocialButton icon="google" onPress={jest.fn()} testID="google-auth" />
    );

    const button = getByTestId("google-auth");
    expect(button).toBeTruthy();
  });

  it("renders Apple icon correctly", () => {
    const { getByTestId } = render(
      <SocialButton icon="apple" onPress={jest.fn()} testID="apple-auth" />
    );

    const button = getByTestId("apple-auth");
    expect(button).toBeTruthy();
  });

  it("calls onPress when Google button is pressed", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <SocialButton icon="google" onPress={onPressMock} testID="google-auth" />
    );

    fireEvent.press(getByTestId("google-auth"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("calls onPress when Apple button is pressed", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <SocialButton icon="apple" onPress={onPressMock} testID="apple-auth" />
    );

    fireEvent.press(getByTestId("apple-auth"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
