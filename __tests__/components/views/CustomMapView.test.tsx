import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import CustomMapView from "@/components/views/CustomMapView";
import * as Location from "expo-location";

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({ coords: { latitude: 37.7749, longitude: -122.4194 } })
  ),
}));

describe("CustomMapView Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the MapView correctly", () => {
    const { getByTestId } = render(<CustomMapView />);
    const map = getByTestId("custom-map-view");

    expect(map).toBeTruthy();
  });

  it("requests location permissions and updates the region", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    });

    const { getByTestId } = render(<CustomMapView />);

    await waitFor(() => expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled());
    await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalled());

    const map = getByTestId("custom-map-view");
    expect(map.props.region).toEqual({
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  });

  it("renders UserLocationMarker when location is available", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    });

    const { getByTestId } = render(<CustomMapView />);

    await waitFor(() => expect(getByTestId("user-location-marker")).toBeTruthy());
  });

  it("does not render UserLocationMarker if location permission is denied", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: "denied" });

    const { queryByTestId } = render(<CustomMapView />);

    await waitFor(() => expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled());
    expect(queryByTestId("user-location-marker")).toBeNull();
  });
});
