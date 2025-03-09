import React from "react";
import { render } from "@testing-library/react-native";
import MapScreen from "@/app/map/index";

jest.mock("@/components/inputs/SearchBar", () => {
  const React = require("react");
  const { View } = require("react-native");
  return () => <View testID="search-bar" />;
});

jest.mock("@/components/views/CustomMapView", () => {
  const React = require("react");
  const { View } = require("react-native");
  return () => <View testID="custom-map-view" />;
});

describe("MapScreen", () => {
  it("renders the MapScreen container", () => {
    const { getByTestId } = render(<MapScreen />);
    expect(getByTestId("map-screen")).toBeTruthy();
  });

  it("renders the SearchBar inside MapScreen", () => {
    const { getByTestId } = render(<MapScreen />);
    expect(getByTestId("search-bar")).toBeTruthy();
  });

  it("renders the CustomMapView inside MapScreen", () => {
    const { getByTestId } = render(<MapScreen />);
    expect(getByTestId("custom-map-view")).toBeTruthy();
  });
});
