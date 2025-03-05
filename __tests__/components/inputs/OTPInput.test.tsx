import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import OTPInput from "@/components/inputs/OTPInput";

describe("OTPInput Component", () => {
  const setup = (length = 4) => {
    const props = {
      length,
      otp: Array(length).fill(""),
      inputRefs: { current: Array(length).fill(null) },
      handleChange: jest.fn(),
      handleKeyPress: jest.fn(),
    };

    const utils = render(<OTPInput {...props} />);
    return { ...utils, props };
  };

  it("renders the correct number of OTP input fields", () => {
    const { getAllByTestId, props } = setup(6);
    expect(getAllByTestId("otp-input")).toHaveLength(props.length);
  });

  it("calls handleChange when a user enters a digit", () => {
    const { getAllByTestId, props } = setup();
    const inputs = getAllByTestId("otp-input");

    fireEvent.changeText(inputs[0], "1");
    expect(props.handleChange).toHaveBeenCalledWith("1", 0);
  });

  it("calls handleKeyPress when Backspace is pressed", () => {
    const { getAllByTestId, props } = setup();
    const inputs = getAllByTestId("otp-input");

    fireEvent(inputs[1], "keyPress", { nativeEvent: { key: "Backspace" } });
    expect(props.handleKeyPress).toHaveBeenCalledWith(expect.any(Object), 1);
  });
});
