import React from "react";
import { render } from "@testing-library/react-native";
import MapScreen from "@/app/map/index";
import { View } from "react-native";

jest.mock("@/components/inputs/SearchBar", () => () => <View testID="search-bar" />);
jest.mock("@/components/views/CustomMapView", () => () => <View testID="custom-map-view" />);

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
