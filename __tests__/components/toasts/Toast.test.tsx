import React from "react";
import { render } from "@testing-library/react-native";
import Toast from "../../../components/toasts/Toast";

jest.mock("@expo/vector-icons", () => ({
    AntDesign: "",
  }));

test("renders Toast with default text", () => {
  const { getByText } = render(<Toast />);
  expect(getByText("Post Reported")).toBeTruthy();
});

test("renders Toast with custom text", () => {
  const { getByText } = render(<Toast text="Custom Message" />);
  expect(getByText("Custom Message")).toBeTruthy();
});
