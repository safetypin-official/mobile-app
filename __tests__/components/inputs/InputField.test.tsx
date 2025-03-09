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
});
