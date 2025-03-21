import React from "react";
import { render } from "@testing-library/react-native";
import InputField from "@/components/inputs/InputField";

describe("InputField Component", () => {
  it("renders correctly with given label and placeholder", () => {
    const { getByText, getByPlaceholderText } = render(
      <InputField label="Email" placeholder="Enter your email" />
    );

    expect(getByText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
  });

  it("renders secureTextEntry correctly", () => {
    const { getByPlaceholderText } = render(
      <InputField label="Password" placeholder="Enter password" secureTextEntry />
    );

    const input = getByPlaceholderText("Enter password");
    expect(input.props.secureTextEntry).toBe(true);
  });

  it("sets numberOfLines to 1 when multiline is false", () => {
    const { getByPlaceholderText } = render(
      <InputField placeholder="Single-line input" multiline={false} />
    );

    const input = getByPlaceholderText("Single-line input");
    expect(input.props.numberOfLines).toBe(1);
  });

  it("sets numberOfLines to 5 when multiline is true", () => {
    const { getByPlaceholderText } = render(
      <InputField placeholder="Multi-line input" multiline />
    );

    const input = getByPlaceholderText("Multi-line input");
    expect(input.props.numberOfLines).toBe(5);
  });
});
