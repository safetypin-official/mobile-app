import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import UserInfo from "../../../components/displays/post/UserInfo";

jest.useFakeTimers();

// Mock the MoreOptionsButton component
jest.mock("@/components/buttons/post/MoreOptionsButton", () => {
  const { View, Text } = require("react-native");
  return ({ onSendMessage, onReport }) => (
    <View testID="mocked-more-options-button">
      <Text testID="send-message" onPress={onSendMessage}>Send Message</Text>
      <Text testID="report-post" onPress={onReport}>Report</Text>
    </View>
  );
});

// Mock the Toast component
jest.mock("../../../components/toast/Toast", () => {
  const { Text, View } = require("react-native");
  return ({ text }) => (
    <View testID="toast-overlay">
      <Text testID="mocked-toast">{text}</Text>
    </View>
  );
});

// Mock the Pin component
jest.mock("@/components/displays/Pin", () => {
  const { View } = require("react-native");
  return ({ type, onPress, width, height }) => (
    <View 
      testID={`pin-${type}`} 
      style={{ width, height }}
      onPress={onPress}
    />
  );
});

describe("UserInfo Component", () => {
  const mockProps = {
    avatarUrl: "https://example.com/avatar.jpg",
    username: "John Doe",
    handle: "@johndoe",
    date: "Mar 10",
    location: "New York, USA",
    moreOptionsIconUrl: "https://example.com/more-options-icon.png",
    longitude: 40.7128,
    latitude: -74.006,
    categoryType: "theft" // Add the new categoryType prop
  };

  /* Happy Path */

  it("renders user information correctly", () => {
    const { getByText, getByTestId } = render(<UserInfo {...mockProps} />);
    expect(getByText("John Doe")).toBeTruthy();
    expect(getByText("@johndoe")).toBeTruthy();
    expect(getByText("New York, USA")).toBeTruthy();
    // Check that the pin is rendered with the correct type
    expect(getByTestId("pin-theft")).toBeTruthy();
  });

  it("renders with default category type when not provided", () => {
    const propsWithoutCategory = { ...mockProps };
    delete propsWithoutCategory.categoryType;
    
    const { getByTestId } = render(<UserInfo {...propsWithoutCategory} />);
    // Should use the default "other-crime" type
    expect(getByTestId("pin-other-crime")).toBeTruthy();
  });

  it("opens and closes more options modal", () => {
    const { getByTestId, queryByTestId } = render(<UserInfo {...mockProps} />);
    
    fireEvent.press(getByTestId("more-options-button"));
    expect(queryByTestId("mocked-more-options-button")).toBeTruthy();

    // Close by clicking overlay
    fireEvent.press(getByTestId("modal-overlay"));
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
  });

  it("closes more options modal when clicking outside", () => {
    const { getByTestId, queryByTestId } = render(<UserInfo {...mockProps} />);
    
    fireEvent.press(getByTestId("more-options-button"));
    expect(queryByTestId("mocked-more-options-button")).toBeTruthy();

    fireEvent.press(getByTestId("modal-overlay"));
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
  });

  it("closes modal via onRequestClose", () => {
    const { getByTestId, queryByTestId } = render(<UserInfo {...mockProps} />);

    fireEvent.press(getByTestId("more-options-button"));
    expect(queryByTestId("mocked-more-options-button")).toBeTruthy();

    fireEvent(getByTestId("more-options-modal"), "requestClose"); 
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
  });

  it("shows and hides toast when reporting", async () => {
    const { getByTestId, queryByTestId } = render(<UserInfo {...mockProps} />);

    // Open modal and click report
    fireEvent.press(getByTestId("more-options-button"));
    fireEvent.press(getByTestId("report-post"));

    // Toast should be visible
    expect(queryByTestId("mocked-toast")).toHaveTextContent("Report Submitted");
    
    // Modal should be closed
    expect(queryByTestId("mocked-more-options-button")).toBeNull();

    // Click on toast to dismiss it
    fireEvent.press(getByTestId("toast-overlay"));
    expect(queryByTestId("mocked-toast")).toBeNull();

    // Reset toast visibility for timeout test
    fireEvent.press(getByTestId("more-options-button"));
    fireEvent.press(getByTestId("report-post"));
    
    // Toast should be visible again
    expect(queryByTestId("mocked-toast")).toBeTruthy();

    // Advance timers to test auto-dismiss
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Toast should be hidden after timeout
    expect(queryByTestId("mocked-toast")).toBeNull();
  });

  it("logs message when send message is clicked", () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const { getByTestId } = render(<UserInfo {...mockProps} />);

    fireEvent.press(getByTestId("more-options-button"));
    fireEvent.press(getByTestId("send-message"));

    expect(consoleSpy).toHaveBeenCalledWith("Send Message");
    consoleSpy.mockRestore();
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