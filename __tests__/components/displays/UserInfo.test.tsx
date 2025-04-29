import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import UserInfo from "../../../components/displays/post/UserInfo";
import { Alert } from "react-native";
import { authenticatedDelete } from "@/utils/api";

jest.useFakeTimers();
// Mock the API util
jest.mock("@/utils/api");

// Mock the MoreOptionsButton component, now including a Delete option
jest.mock("@/components/buttons/post/MoreOptionsButton", () => {
  const { View, Text } = require("react-native");
  return ({
    onSendMessage,
    onReport,
    onDelete,
  }: {
    onSendMessage: () => void;
    onReport: () => void;
    onDelete: () => void;
  }) => (
    <View testID="mocked-more-options-button">
      <Text testID="send-message"  onPress={onSendMessage}>Send Message</Text>
      <Text testID="report-post"   onPress={onReport}>Report</Text>
      <Text testID="delete-post"   onPress={onDelete}>Delete</Text>
    </View>
  );
});

// Mock the Toast component
jest.mock("../../../components/toasts/Toast", () => {
  const { Text, View } = require("react-native");
  return ({ text }: { text: string }) => (
    <View testID="toast-overlay">
      <Text testID="mocked-toast">{text}</Text>
    </View>
  );
});

// Mock the Pin component
jest.mock("@/components/displays/Pin", () => {
  const { View } = require("react-native");
  return ({
    type,
    onPress,
    width,
    height,
  }: {
    type: string;
    onPress: () => void;
    width: number;
    height: number;
  }) => (
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
    categoryType: "theft",
    postId: "12345",
  };

  /* Happy Path */

  it("renders user information correctly", () => {
    const { getByText, getByTestId } = render(<UserInfo {...mockProps} />);
    expect(getByText("John Doe")).toBeTruthy();
    expect(getByText("@johndoe")).toBeTruthy();
    expect(getByText("New York, USA")).toBeTruthy();
    expect(getByTestId("pin-theft")).toBeTruthy();
  });

  it("renders with default category type when not provided", () => {
    const { categoryType, ...propsWithoutCategory } = mockProps;
    const { getByTestId } = render(
      // @ts-ignore: intentionally omit categoryType
      <UserInfo {...propsWithoutCategory} />
    );
    expect(getByTestId("pin-other-crime")).toBeTruthy();
  });

  it("opens and closes more options modal", () => {
    const { getByTestId, queryByTestId } = render(
      <UserInfo {...mockProps} />
    );
    fireEvent.press(getByTestId("more-options-button"));
    expect(queryByTestId("mocked-more-options-button")).toBeTruthy();

    fireEvent.press(getByTestId("modal-overlay"));
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
  });

  it("closes modal via onRequestClose", () => {
    const { getByTestId, queryByTestId } = render(
      <UserInfo {...mockProps} />
    );
    fireEvent.press(getByTestId("more-options-button"));
    expect(queryByTestId("mocked-more-options-button")).toBeTruthy();

    fireEvent(getByTestId("more-options-modal"), "requestClose");
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
  });

  it("shows and hides toast when reporting", async () => {
    const { getByTestId, queryByTestId } = render(
      <UserInfo {...mockProps} />
    );
    fireEvent.press(getByTestId("more-options-button"));
    fireEvent.press(getByTestId("report-post"));

    // toast appears
    expect(queryByTestId("mocked-toast")).toHaveTextContent(
      "Report Submitted"
    );
    // modal closes
    expect(queryByTestId("mocked-more-options-button")).toBeNull();

    // dismiss toast by press
    fireEvent.press(getByTestId("toast-overlay"));
    expect(queryByTestId("mocked-toast")).toBeNull();

    // again show toast then auto-dismiss via timer
    fireEvent.press(getByTestId("more-options-button"));
    fireEvent.press(getByTestId("report-post"));
    expect(queryByTestId("mocked-toast")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(queryByTestId("mocked-toast")).toBeNull();
  });

  it("logs message when send message is clicked", () => {
    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});
    const { getByTestId } = render(<UserInfo {...mockProps} />);

    fireEvent.press(getByTestId("more-options-button"));
    fireEvent.press(getByTestId("send-message"));

    expect(consoleSpy).toHaveBeenCalledWith("Send Message");
    consoleSpy.mockRestore();
  });

  /* Unhappy Paths */

  it("renders without crashing when minimal props provided", () => {
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
        postId=""
      />
    );
    expect(getByText("John Doe")).toBeTruthy();
  });

  it("does not render modal content unless opened", () => {
    const { queryByTestId } = render(<UserInfo {...mockProps} />);
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
  });

  it("does not show toast unless report is clicked", () => {
    const { getByTestId, queryByTestId } = render(
      <UserInfo {...mockProps} />
    );
    fireEvent.press(getByTestId("more-options-button"));
    expect(queryByTestId("mocked-more-options-button")).toBeTruthy();
    expect(queryByTestId("mocked-toast")).toBeNull();
  });

  /* Delete functionality */

  describe("Delete functionality", () => {
    let alertSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      alertSpy = jest
        .spyOn(Alert, "alert")
        .mockImplementation(() => {});
    });

    it("confirms deletion and on success shows toast + calls onPostDeleted", async () => {
      (authenticatedDelete as jest.Mock).mockResolvedValue({
        success: true,
      });
      const onPostDeleted = jest.fn();

      const { getByTestId, queryByTestId } = render(
        <UserInfo {...mockProps} onPostDeleted={onPostDeleted} />
      );

      fireEvent.press(getByTestId("more-options-button"));
      fireEvent.press(getByTestId("delete-post"));

      // Confirmation alert
      expect(Alert.alert).toHaveBeenCalledWith(
        "Delete Post",
        "Are you sure you want to delete this post?",
        expect.arrayContaining([
          expect.objectContaining({
            text: "Delete",
            style: "destructive",
            onPress: expect.any(Function),
          }),
        ])
      );

      // Simulate pressing "Delete"
      const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
      await act(async () => {
        buttons.find((b: any) => b.text === "Delete").onPress();
        jest.runAllTimers();
      });

      // onPostDeleted callback
      expect(onPostDeleted).toHaveBeenCalled();
      // Toast shows "Post Deleted"
      expect(queryByTestId("mocked-toast")).toHaveTextContent(
        "Post Deleted"
      );
    });

    it("alerts an error when delete API fails", async () => {
      (authenticatedDelete as jest.Mock).mockResolvedValue({
        success: false,
      });
      const onPostDeleted = jest.fn();

      const { getByTestId } = render(
        <UserInfo {...mockProps} onPostDeleted={onPostDeleted} />
      );

      fireEvent.press(getByTestId("more-options-button"));
      fireEvent.press(getByTestId("delete-post"));

      // Confirmation alert
      expect(Alert.alert).toHaveBeenCalledWith(
        "Delete Post",
        "Are you sure you want to delete this post?",
        expect.any(Array)
      );

      // Simulate pressing "Delete"
      const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
      await act(async () => {
        buttons.find((b: any) => b.text === "Delete").onPress();
      });

      // Should show error alert
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Failed to delete post"
      );
      // onPostDeleted should not fire
      expect(onPostDeleted).not.toHaveBeenCalled();
    });
  });
});
