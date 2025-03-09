import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MapButton from "@/components/buttons/MapButton";
import { locationIcon, locationIconActive } from "@/assets/icons";
import { SvgXml } from "react-native-svg";

jest.mock("react-native-svg", () => ({
  SvgXml: jest.fn(() => null), // Mock SvgXml
}));

jest.mock("@/assets/icons", () => ({
  locationIcon: "<svg>inactive</svg>",
  locationIconActive: "<svg>active</svg>",
}));

describe("MapButton", () => {
  it("renders correctly with default props", () => {
    const { getByTestId } = render(<MapButton />);
    expect(getByTestId("map-button")).toBeTruthy();
  });

  it("renders active icon when active is true", () => {
    const { getByTestId } = render(<MapButton active />);
    expect(SvgXml).toHaveBeenCalledWith(
      expect.objectContaining({ xml: locationIconActive }),
      expect.any(Object)
    );
  });

  it("renders inactive icon when active is false", () => {
    const { getByTestId } = render(<MapButton active={false} />);
    expect(SvgXml).toHaveBeenCalledWith(
      expect.objectContaining({ xml: locationIcon }),
      expect.any(Object)
    );
  });

  it("calls onPress when clicked", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<MapButton onPress={onPressMock} />);
    fireEvent.press(getByTestId("map-button"));
    expect(onPressMock).toHaveBeenCalled();
  });
});
