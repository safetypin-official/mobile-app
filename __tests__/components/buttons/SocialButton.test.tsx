import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SocialButton } from "@/components/buttons/SocialButton";
import { googleIcon, appleIcon } from "@/assets/icons";

describe("SocialButton Component", () => {
  it("renders with default testID when not provided", () => {
    const { getByTestId } = render(
      <SocialButton iconXml={googleIcon} onPress={jest.fn()} />
    );

    const button = getByTestId("social-button");
    expect(button).toBeTruthy();
  });

  it("renders Google icon correctly", () => {
    const { getByTestId } = render(
      <SocialButton iconXml={googleIcon} onPress={jest.fn()} testID="google-auth" />
    );

    const button = getByTestId("google-auth");
    expect(button).toBeTruthy();
  });

  it("renders Apple icon correctly", () => {
    const { getByTestId } = render(
      <SocialButton iconXml={appleIcon} onPress={jest.fn()} testID="apple-auth" />
    );

    const button = getByTestId("apple-auth");
    expect(button).toBeTruthy();
  });

  it("calls onPress when Google button is pressed", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <SocialButton iconXml={googleIcon} onPress={onPressMock} testID="google-auth" />
    );

    fireEvent.press(getByTestId("google-auth"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("calls onPress when Apple button is pressed", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <SocialButton iconXml={appleIcon} onPress={onPressMock} testID="apple-auth" />
    );

    fireEvent.press(getByTestId("apple-auth"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
