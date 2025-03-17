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

  it("defaults multiline to false", () => {
    const { getByPlaceholderText } = render(
      <InputField label="Single Line" placeholder="Type here" />
    );

    const input = getByPlaceholderText("Type here");
    expect(input.props.multiline).toBe(false);
    expect(input.props.numberOfLines).toBe(1);
  });

  it("renders correctly when multiline is set to true", () => {
    const { getByPlaceholderText } = render(
      <InputField label="Multiline Input" placeholder="Type here" multiline />
    );

    const input = getByPlaceholderText("Type here");
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(5);
  });

  it("renders correctly when multiline is explicitly set to false", () => {
    const { getByPlaceholderText } = render(
      <InputField label="Single Line" placeholder="Type here" multiline={false} />
    );

    const input = getByPlaceholderText("Type here");
    expect(input.props.multiline).toBe(false);
    expect(input.props.numberOfLines).toBe(1);
  });
});
