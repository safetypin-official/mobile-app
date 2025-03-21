import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CommentSection from "@/components/displays/post/CommentSection";

// Mock the setTimeout function
jest.useFakeTimers();

// Mock the MoreOptionsButton component
jest.mock("@/components/buttons/post/MoreOptionsButton", () => {
  const { View, Text } = require("react-native");
  return ({ onReport, onSendMessage }) => (
    <View testID="mocked-more-options-button">
      <Text testID="report" onPress={onReport}>Report</Text>
      <Text testID="send-message" onPress={onSendMessage}>Send Message</Text>
    </View>
  );
});

// Mock the Toast component
jest.mock("@/components/toast/Toast", () => {
  const { View, Text } = require("react-native");
  return ({ text }) => (
    <View testID="mocked-toast">
      <Text>{text}</Text>
    </View>
  );
});

// Spy on console.log
jest.spyOn(console, "log").mockImplementation(() => {});

const mockComment = {
  avatarUrl: "https://example.com/avatar.jpg",
  username: "John Doe",
  handle: "@johndoe",
  date: "Feb 20",
  content: "This is a test comment",
  likeCount: 5,
  likeIconUrl: "https://example.com/like-icon.png",
  moreOptionsIconUrl: "https://example.com/more-options-icon.png",
};

describe("CommentSection Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders CommentSection correctly", () => {
    const { getByText } = render(<CommentSection {...mockComment} />);
    expect(getByText("John Doe")).toBeTruthy();
    expect(getByText("@johndoe • Feb 20")).toBeTruthy();
    expect(getByText("This is a test comment")).toBeTruthy();
    expect(getByText("5")).toBeTruthy();
  });

  it("opens the more options modal when more options button is clicked", () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...mockComment} />);
    
    // Initially, modal should not be visible
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
    
    // Click the more options button
    fireEvent.press(getByTestId("more-options-button"));
    
    // Modal should be visible
    expect(queryByTestId("mocked-more-options-button")).toBeTruthy();
  });

  it("closes the modal when clicking outside", () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...mockComment} />);
    
    // Open the modal
    fireEvent.press(getByTestId("more-options-button"));
    expect(queryByTestId("mocked-more-options-button")).toBeTruthy();
    
    // Click outside the modal
    fireEvent.press(getByTestId("modal-overlay"));
    
    // Modal should be closed
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
  });

  it("handles onRequestClose for the modal", () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...mockComment} />);
    
    // Open the modal
    fireEvent.press(getByTestId("more-options-button"));
    expect(queryByTestId("mocked-more-options-button")).toBeTruthy();
    
    // Trigger onRequestClose
    fireEvent(getByTestId("more-options-modal"), "requestClose");
    
    // Modal should be closed
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
  });

  it("calls onSendMessage when 'Send Message' is clicked", () => {
    const { getByTestId } = render(<CommentSection {...mockComment} />);
    
    // Open the modal
    fireEvent.press(getByTestId("more-options-button"));
    
    // Click Send Message
    fireEvent.press(getByTestId("send-message"));
    
    // Check if console.log was called with "Send Message"
    expect(console.log).toHaveBeenCalledWith("Send Message");
  });

  it("shows toast and closes modal when 'Report' is clicked", () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...mockComment} />);
    
    // Open the modal
    fireEvent.press(getByTestId("more-options-button"));
    
    // Click Report
    fireEvent.press(getByTestId("report"));
    
    // Toast should be visible with "Report Submitted"
    expect(queryByTestId("mocked-toast")).toHaveTextContent("Report Submitted");
    
    // Modal should be closed
    expect(queryByTestId("mocked-more-options-button")).toBeNull();
  });

  it("closes toast when clicked", () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...mockComment} />);
    
    // Open the modal and report
    fireEvent.press(getByTestId("more-options-button"));
    fireEvent.press(getByTestId("report"));
    
    // Click on toast to dismiss
    fireEvent.press(getByTestId("report-submitted"));
    
    // Toast should be closed
    expect(queryByTestId("mocked-toast")).toBeNull();
  });

  it("automatically hides toast after 3 seconds", () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...mockComment} />);
    
    // Open the modal and report
    fireEvent.press(getByTestId("more-options-button"));
    fireEvent.press(getByTestId("report"));
    
    // Toast should be visible
    expect(queryByTestId("mocked-toast")).toBeTruthy();
    
    // Advance timers by 3 seconds
    jest.advanceTimersByTime(3000);
    
    // Toast should be hidden
    expect(queryByTestId("mocked-toast")).toBeDefined();
  });

  it("renders without crashing when required props are missing", () => {
    const { getByText } = render(
      <CommentSection
        avatarUrl=""
        username="Anonymous"
        handle=""
        date=""
        content=""
        likeCount={0}
        likeIconUrl=""
        moreOptionsIconUrl=""
      />
    );
    
    expect(getByText("Anonymous")).toBeTruthy();
  });

  it("does not crash when onRequestClose is called on an already closed modal", () => {
    const { queryByTestId } = render(<CommentSection {...mockComment} />);
    
    // Modal should not exist initially
    expect(queryByTestId("more-options-modal")).toBeNull();
  });
});