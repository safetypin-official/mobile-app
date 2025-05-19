import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import UserInfo from "../../../components/displays/post/UserInfo";
import { authenticatedDelete } from "@/utils/api";
import { router } from "expo-router";

jest.useFakeTimers();
jest.mock("@/utils/api");
jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

// Mock MoreOptionsButton
jest.mock("@/components/buttons/post/MoreOptionsButton", () => {
  const { View, Text } = require("react-native");
  return ({ onSendMessage, onReport, onDelete }: any) => (
    <View testID="mocked-more-options-button">
      <Text testID="send-message" onPress={onSendMessage}>Send Message</Text>
      <Text testID="report-post" onPress={onReport}>Report</Text>
      <Text testID="delete-post" onPress={onDelete}>Delete</Text>
    </View>
  );
});

// Mock Toast
jest.mock("../../../components/toasts/Toast", () => {
  const { View, Text } = require("react-native");
  return ({ text }: { text: string }) => (
    <View testID="toast-overlay">
      <Text testID="mocked-toast">{text}</Text>
    </View>
  );
});

// Mock Pin
jest.mock("@/components/displays/Pin", () => {
  const { View } = require("react-native");
  return ({ type, onPress, width, height }: any) => (
    <View testID={`pin-${type}`} style={{ width, height }} onPress={onPress} />
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

  const mockPostedByProps = {
    postedBy: {
      userId: "user123",
      name: "Jane Smith",
      profilePicture: "https://example.com/jane.jpg"
    },
    date: "Mar 10",
    location: "New York, USA",
    moreOptionsIconUrl: "https://example.com/more-options-icon.png",
    longitude: 40.7128,
    latitude: -74.006,
    categoryType: "theft",
    postId: "12345",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* Happy Path */

  it("renders user information correctly with legacy props", () => {
    const { getByText, getByTestId } = render(<UserInfo {...mockProps} />);
    expect(getByText("John Doe")).toBeTruthy();
    expect(getByText("@johndoe")).toBeTruthy();
    expect(getByText("New York, USA")).toBeTruthy();
    expect(getByTestId("pin-theft")).toBeTruthy();
  });

  it("renders user information correctly with postedBy structure", () => {
    const { getByText, getByTestId } = render(<UserInfo {...mockPostedByProps} />);
    expect(getByText("Jane Smith")).toBeTruthy();
    // Should generate a handle from name
    expect(getByText("@janesmith")).toBeTruthy();
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

  it("navigates to user profile when user info is pressed with postedBy", () => {
    const { getByText } = render(<UserInfo {...mockPostedByProps} />);
    
    // Find user name and press it
    fireEvent.press(getByText("Jane Smith"));
    
    // Check if router.push was called with correct path
    expect(router.push).toHaveBeenCalledWith(`/profile?userId=${mockPostedByProps.postedBy.userId}`);
  });

  it("calls custom onUserPress handler when provided", () => {
    const onUserPress = jest.fn();
    const { getByText } = render(<UserInfo {...mockPostedByProps} onUserPress={onUserPress} />);
    
    fireEvent.press(getByText("Jane Smith"));
    
    expect(onUserPress).toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled(); // Should not use default navigation
  });

  it("logs the user ID when pressing on user info", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { getByText } = render(<UserInfo {...mockPostedByProps} />);
    
    fireEvent.press(getByText("Jane Smith"));
    
    expect(consoleSpy).toHaveBeenCalledWith("User ID:", mockPostedByProps.postedBy.userId);
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

  it("renders with only postedBy.name and no profile picture", () => {
    const minimalPostedByProps = {
      postedBy: {
        userId: "user123",
        name: "Jane Smith",
        // No profilePicture
      },
      date: "Mar 10",
      location: "New York, USA",
      moreOptionsIconUrl: "",
      longitude: 0,
      latitude: 0,
      postId: "12345",
    };
    
    const { getByText } = render(<UserInfo {...minimalPostedByProps} />);
    expect(getByText("Jane Smith")).toBeTruthy();
    expect(getByText("@janesmith")).toBeTruthy();
  });

  it("renders with Anonymous when no user info is provided", () => {
    const noUserProps = {
      date: "Mar 10",
      location: "New York, USA",
      moreOptionsIconUrl: "",
      longitude: 0,
      latitude: 0,
      postId: "12345",
    };
    
    const { getByText } = render(<UserInfo {...noUserProps} />);
    expect(getByText("Anonymous")).toBeTruthy();
    expect(getByText("@anonymous")).toBeTruthy();
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
    it("shows confirmation modal when delete is pressed", () => {
      const { getByTestId } = render(<UserInfo {...mockProps} />);
      fireEvent.press(getByTestId("more-options-button"));
      fireEvent.press(getByTestId("delete-post"));

      // The CustomModal should now appear :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
      expect(getByTestId("delete-confirmation-modal")).toBeTruthy();
    });

    it("cancels deletion when Cancel is pressed", () => {
      const onPostDeleted = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <UserInfo {...mockProps} onPostDeleted={onPostDeleted} />
      );

      fireEvent.press(getByTestId("more-options-button"));
      fireEvent.press(getByTestId("delete-post"));

      // Press the modal's Cancel button :contentReference[oaicite:4]{index=4}:contentReference[oaicite:5]{index=5}
      fireEvent.press(getByTestId("delete-confirmation-modal-cancel"));

      // Modal should close and no API call or callback
      expect(queryByTestId("delete-confirmation-modal")).toBeNull();
      expect(authenticatedDelete).not.toHaveBeenCalled();
      expect(onPostDeleted).not.toHaveBeenCalled();
    });

    it("performs deletion when Delete is confirmed", async () => {
      (authenticatedDelete as jest.Mock).mockResolvedValue({ success: true });
      const onPostDeleted = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <UserInfo {...mockProps} onPostDeleted={onPostDeleted} />
      );

      fireEvent.press(getByTestId("more-options-button"));
      fireEvent.press(getByTestId("delete-post"));

      // Press the modal's OK/Delete button :contentReference[oaicite:6]{index=6}:contentReference[oaicite:7]{index=7}
      fireEvent.press(getByTestId("delete-confirmation-modal-ok"));

      // Wait for deletion + toast
      await act(async () => {
        jest.runAllTimers();
      });

      expect(authenticatedDelete).toHaveBeenCalledWith(
        `https://safetypin.ppl.cs.ui.ac.id/posts/${mockProps.postId}`
      );
      expect(onPostDeleted).toHaveBeenCalled();
      expect(queryByTestId("mocked-toast")).toHaveTextContent(
        "Post deleted successfully"
      );

      // Toast auto-dismisses after 3s
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      expect(queryByTestId("mocked-toast")).toBeNull();
    });

    it("handles errors during deletion", async () => {
      (authenticatedDelete as jest.Mock).mockRejectedValue(new Error("API error"));
      const errorSpy = jest.spyOn(console, "error").mockImplementation();
      const { getByTestId, queryByTestId } = render(<UserInfo {...mockProps} />);

      fireEvent.press(getByTestId("more-options-button"));
      fireEvent.press(getByTestId("delete-post"));
      fireEvent.press(getByTestId("delete-confirmation-modal-ok"));

      await act(async () => {
        jest.runAllTimers();
      });

      expect(errorSpy).toHaveBeenCalledWith(
        "Error deleting post:",
        expect.any(Error)
      );
      expect(queryByTestId("mocked-toast")).toHaveTextContent("Failed to delete post");

      errorSpy.mockRestore();
    });
  });
});
