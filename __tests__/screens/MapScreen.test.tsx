import React from "react";
import { render } from "@testing-library/react-native";
import MapScreen from "@/app/map/index";

describe("MapScreen", () => {
  it("renders correctly", () => {
    const { getByTestId } = render(<MapScreen />);
    expect(getByTestId("map-screen")).toBeTruthy();
  });
});
