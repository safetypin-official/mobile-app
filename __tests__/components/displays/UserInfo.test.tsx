import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import UserInfo from "../../../components/displays/post/UserInfo";
import { Alert } from "react-native";
import { authenticatedDelete } from "@/utils/api";
import { router } from "expo-router";

jest.useFakeTimers();
// Mock the API util
jest.mock("@/utils/api");

// Mock the router
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock the MoreOptionsButton component
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
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("shows confirmation dialog when delete is pressed", async () => {
      const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
      const { getByTestId } = render(<UserInfo {...mockProps} />);

      fireEvent.press(getByTestId("more-options-button"));
      fireEvent.press(getByTestId("delete-post"));

      expect(Alert.alert).toHaveBeenCalledWith(
        "Delete Post",
        "Are you sure you want to delete this post?",
        expect.arrayContaining([
          expect.objectContaining({ text: "Cancel" }),
          expect.objectContaining({ text: "Delete" })
        ])
      );

      alertSpy.mockRestore();
    });

    it("cancels deletion when Cancel is pressed", async () => {
      const alertMock = jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
        // Find and trigger the Cancel button callback
        const cancelButton = buttons?.find(btn => btn.text === "Cancel");
        if (cancelButton && cancelButton.onPress) {
          cancelButton.onPress();
        }
      });

      const onPostDeleted = jest.fn();
      const { getByTestId } = render(<UserInfo {...mockProps} onPostDeleted={onPostDeleted} />);

      fireEvent.press(getByTestId("more-options-button"));
      fireEvent.press(getByTestId("delete-post"));

      expect(Alert.alert).toHaveBeenCalled();
      expect(authenticatedDelete).not.toHaveBeenCalled();
      expect(onPostDeleted).not.toHaveBeenCalled();

      alertMock.mockRestore();
    });

    it("performs deletion when Delete is confirmed", async () => {
      (authenticatedDelete as jest.Mock).mockResolvedValue({ success: true });
      
      // Mock Alert.alert to trigger the Delete callback
      const alertMock = jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
        // Find and trigger the Delete button callback
        const deleteButton = buttons?.find(btn => btn.text === "Delete");
        if (deleteButton && deleteButton.onPress) {
          deleteButton.onPress();
        }
      });

      const onPostDeleted = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <UserInfo {...mockProps} onPostDeleted={onPostDeleted} />
      );

      fireEvent.press(getByTestId("more-options-button"));
      fireEvent.press(getByTestId("delete-post"));

      // Let all promises resolve
      await act(async () => {
        jest.runAllTimers();
      });

      expect(authenticatedDelete).toHaveBeenCalledWith(
        `https://safetypin.ppl.cs.ui.ac.id/posts/${mockProps.postId}`
      );
      
      expect(onPostDeleted).toHaveBeenCalled();
      expect(queryByTestId("mocked-toast")).toHaveTextContent("Post deleted successfully");
      
      // Test auto-dismissal of toast
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      expect(queryByTestId("mocked-toast")).toBeNull();

      alertMock.mockRestore();
    });

    it("handles errors during deletion", async () => {
      (authenticatedDelete as jest.Mock).mockRejectedValue(new Error("API error"));
      
      // Mock console.error to prevent test noise
      const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      
      // Mock Alert.alert to trigger the Delete callback
      const alertMock = jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
        const deleteButton = buttons?.find(btn => btn.text === "Delete");
        if (deleteButton && deleteButton.onPress) {
          deleteButton.onPress();
        }
      });

      const onPostDeleted = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <UserInfo {...mockProps} onPostDeleted={onPostDeleted} />
      );

      fireEvent.press(getByTestId("more-options-button"));
      fireEvent.press(getByTestId("delete-post"));

      // Let all promises resolve
      await act(async () => {
        jest.runAllTimers();
      });

      expect(errorSpy).toHaveBeenCalledWith("Error deleting post:", expect.any(Error));
      expect(onPostDeleted).not.toHaveBeenCalled();
      expect(queryByTestId("mocked-toast")).toHaveTextContent("Failed to delete post");

      errorSpy.mockRestore();
      alertMock.mockRestore();
    });

    it("handles errors during deletion preparation", async () => {
      // Mock console.error to check if it's called
      const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      
      // Mock Alert.alert to throw an error
      const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {
        throw new Error("Mocked alert error");
      });
      
      const { getByTestId } = render(<UserInfo {...mockProps} />);
      
      // Trigger deletion flow
      fireEvent.press(getByTestId("more-options-button"));
      fireEvent.press(getByTestId("delete-post"));
      
      // The error should be caught and logged
      expect(errorSpy).toHaveBeenCalledWith(
        "Error preparing deletion:", 
        expect.objectContaining({ message: "Mocked alert error" })
      );
      
      // Clean up mocks
      errorSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it("calls onPostDeleted callback after successful post deletion", async () => {
      // Mock successful API deletion
      (authenticatedDelete as jest.Mock).mockResolvedValue({ success: true });
      
      // Mock Alert.alert to trigger the Delete button callback immediately
      const alertMock = jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
        const deleteButton = buttons?.find(btn => btn.text === "Delete");
        if (deleteButton && deleteButton.onPress) {
          deleteButton.onPress();
        }
      });
      
      // Create a mock for onPostDeleted callback
      const mockOnPostDeleted = jest.fn();
      
      const { getByTestId } = render(
        <UserInfo 
          {...mockProps} 
          onPostDeleted={mockOnPostDeleted} 
        />
      );
      
      // Trigger the deletion flow
      fireEvent.press(getByTestId("more-options-button"));
      fireEvent.press(getByTestId("delete-post"));
      
      // Let all promises resolve
      await act(async () => {
        jest.runAllTimers();
      });
      
      // Verify the API call was made
      expect(authenticatedDelete).toHaveBeenCalledWith(
        `https://safetypin.ppl.cs.ui.ac.id/posts/${mockProps.postId}`
      );
      
      // Verify the callback was called exactly once
      expect(mockOnPostDeleted).toHaveBeenCalledTimes(1);
      
      // Clean up
      alertMock.mockRestore();
    });
  });
});
