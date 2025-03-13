import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import UserInfo from "../components/UserInfo";

jest.useFakeTimers();

jest.mock("../components/MoreOptionsButton", () => {
  const { View, Text } = require("react-native");
  return ({ onReport, closeModal }: { onReport: () => void; closeModal: () => void }) => (
    <View testID="mocked-more-options-button">
      <Text testID="report-post" onPress={onReport}>Report</Text>
      <Text testID="close-modal" onPress={closeModal}>Close</Text>
    </View>
  );
});

jest.mock("../components/Toast", () => {
  const { Text, View } = require("react-native");
  return ({ text }: { text: string }) => (
    <View testID="toast-overlay">
      <Text testID="mocked-toast">{text}</Text>
    </View>
  );
});

describe("UserInfo Component", () => {
  const mockProps = {
    avatarUrl: "https://example.com/avatar.jpg",
    username: "John Doe",
    handle: "@johndoe",
    date: "Mar 10",
    location: "New York, USA",
    locationIconUrl: "https://example.com/location-icon.png",
    moreOptionsIconUrl: "https://example.com/more-options-icon.png",
    longitude: 40.7128,
    latitude: -74.006,
  };

  /* Happy Path */

  it("renders user information correctly", () => {
    const { getByText } = render(<UserInfo {...mockProps} />);
    expect(getByText("John Doe")).toBeTruthy();
    expect(getByText("@johndoe")).toBeTruthy();
    expect(getByText("New York, USA")).toBeTruthy();
  });

  it("opens and closes more options modal", () => {
    const { getByTestId, queryByTestId } = render(<UserInfo {...mockProps} />);
    
    fireEvent.press(getByTestId("more-options-button"));
    expect(queryByTestId("mocked-more-options-button")).toBeTruthy();

    fireEvent.press(getByTestId("close-modal"));
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
  });

  it("closes more options modal when clicking outside", () => {
    const { getByTestId, queryByTestId } = render(<UserInfo {...mockProps} />);
    
    fireEvent.press(getByTestId("more-options-button"));
    expect(queryByTestId("mocked-more-options-button")).toBeTruthy();

    fireEvent.press(getByTestId("modal-overlay"));
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
  });

  it("closes modal via onRequestClose (Line 56-57)", () => {
    const { getByTestId, queryByTestId } = render(<UserInfo {...mockProps} />);

    fireEvent.press(getByTestId("more-options-button"));
    expect(queryByTestId("mocked-more-options-button")).toBeTruthy();

    fireEvent(getByTestId("more-options-modal"), "requestClose"); 
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
  });

    it("shows and hides toast when reporting", async () => {
        const { getByTestId, queryByTestId } = render(<UserInfo {...mockProps} />);

        fireEvent.press(getByTestId("more-options-button"));
        fireEvent.press(getByTestId("report-post"));

        expect(queryByTestId("mocked-toast")).toHaveTextContent("Report Submitted");

        fireEvent.press(getByTestId("toast-overlay"));
        expect(queryByTestId("mocked-toast")).toBeNull();

        act(() => {
        jest.advanceTimersByTime(3000);
        });

        expect(queryByTestId("mocked-toast")).toBeNull();
    });
    

  /* Unhappy Paths */

  it("renders without crashing when required props are missing", () => {
    const { getByText } = render(
      <UserInfo
        username="John Doe"
        avatarUrl=""
        handle=""
        date=""
        location=""
        locationIconUrl=""
        moreOptionsIconUrl=""
        longitude={0}
        latitude={0}
      />
    );

    expect(getByText("John Doe")).toBeTruthy();
  });

  it("does not crash when more options button is not clicked", () => {
    const { queryByTestId } = render(<UserInfo {...mockProps} />);
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
  });

  it("does not crash when report button is not clicked", () => {
    const { getByTestId, queryByTestId } = render(<UserInfo {...mockProps} />);
    fireEvent.press(getByTestId("more-options-button"));

    expect(queryByTestId("mocked-more-options-button")).toBeTruthy();
    expect(queryByTestId("mocked-toast")).toBeNull();
  });
});
