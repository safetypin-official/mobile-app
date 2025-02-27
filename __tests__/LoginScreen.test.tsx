import React from "react";
import { render } from "@testing-library/react-native";
import LoginScreen from "@/app/index";

describe("LoginScreen", () => {
  it("renders the LoginForm component", () => {
    const { getByTestId } = render(<LoginScreen />);
    
    expect(getByTestId("login-screen")).toBeTruthy();
  });
});
