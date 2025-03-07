import React from "react";
import { render } from "@testing-library/react-native";
import MapScreen from "@/app/map/index";

jest.mock("@expo/vector-icons", () => ({
    Feather: (props: Record<string, unknown>) => `Feather ${JSON.stringify(props)}`,
    FontAwesome: (props: Record<string, unknown>) => `FontAwesome ${JSON.stringify(props)}`,
  }));

describe("MapScreen", () => {
  it("renders the map screen", () => {
    const { getByTestId } = render(<MapScreen />);
    expect(getByTestId("map-screen")).toBeTruthy();
  });

  it("renders the SearchBar inside MapScreen", () => {
    const { getByTestId } = render(<MapScreen />);
    expect(getByTestId("search-bar")).toBeTruthy();
  });
});
