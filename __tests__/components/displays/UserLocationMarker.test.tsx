import React from "react";
import { render } from "@testing-library/react-native";
import UserLocationMarker from "@/components/displays/UserLocationMarker";

describe("UserLocationMarker Component", () => {
  it("renders correctly with given latitude and longitude", () => {
    const latitude = 37.7749;
    const longitude = -122.4194;
    const { getByTestId } = render(<UserLocationMarker latitude={latitude} longitude={longitude} />);
    
    const marker = getByTestId("user-location-marker");
    
    expect(marker).toBeTruthy();
    expect(marker.props.coordinate).toEqual({ latitude, longitude });
  });

  it("contains a View inside Marker for custom styling", () => {
    const { getByTestId } = render(<UserLocationMarker latitude={0} longitude={0} />);
    
    const customMarker = getByTestId("custom-marker-view");
    
    expect(customMarker).toBeTruthy();
    expect(customMarker.props.style).toMatchObject({
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: "red",
      borderWidth: 2,
      borderColor: "white",
    });
  });
});
