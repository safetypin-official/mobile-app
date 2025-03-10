import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CommentInput from "../components/CommentInput";
import { Platform } from "react-native";

describe("CommentInput Component", () => {
  it("renders correctly", () => {
    const { getByPlaceholderText } = render(<CommentInput />);
    expect(getByPlaceholderText("Post a Comment")).toBeTruthy();
  });

  it("updates text input state", () => {
    const { getByPlaceholderText } = render(<CommentInput />);
    const input = getByPlaceholderText("Post a Comment");

    fireEvent.changeText(input, "Hello, world!");
    expect(input.props.value).toBe("Hello, world!");
  });

  it("handles empty input error and clears it on valid input", () => {
    const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
      <CommentInput maxLength={10} />
    );

    const input = getByPlaceholderText("Post a Comment");
    const submitButton = getByTestId("submit-button");

    fireEvent.changeText(input, "   ");
    fireEvent.press(submitButton);
    expect(getByText("Comment cannot be empty")).toBeTruthy();

    fireEvent.changeText(input, "Valid comment");
    fireEvent.press(submitButton);
    expect(queryByText("Comment cannot be empty")).toBeNull();
  });

  it("handles max length validation", () => {
    const maxLength = 5;
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <CommentInput maxLength={maxLength} />
    );

    const input = getByPlaceholderText("Post a Comment");
    const submitButton = getByTestId("submit-button");

    fireEvent.changeText(input, "Too long comment");
    fireEvent.press(submitButton);
    expect(getByText(`Comment must be less than ${maxLength} characters`)).toBeTruthy();
  });

  it("calls onSubmit and resets input on valid submission", () => {
    const mockSubmit = jest.fn();
    const { getByPlaceholderText, getByTestId } = render(<CommentInput onSubmit={mockSubmit} />);
    const input = getByPlaceholderText("Post a Comment");
    const submitButton = getByTestId("submit-button");

    fireEvent.changeText(input, "Valid comment");
    fireEvent.press(submitButton);

    expect(mockSubmit).toHaveBeenCalledWith("Valid comment");
    expect(input.props.value).toBe("");
  });

  it("resets input height when input is cleared", () => {
    const { getByPlaceholderText } = render(<CommentInput />);
    const input = getByPlaceholderText("Post a Comment");

    fireEvent.changeText(input, "Test");
    fireEvent.changeText(input, "");

    expect(input.props.style[1].height).toBe(40);
  });

  it("does not allow input height to exceed MAX_HEIGHT", () => {
    const { getByPlaceholderText } = render(<CommentInput />);
    const input = getByPlaceholderText("Post a Comment");

    fireEvent(input, "contentSizeChange", {
      nativeEvent: { contentSize: { height: 200 } },
    });

    expect(input.props.style[1].height).toBe(120);
  });
});