import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ReportContent from "../../../components/displays/ReportContent";
import ReportTags from "../../../components/displays/ReportTags";
import type { ReportContentProps, TagKey } from "../../../components/displays/ReportContent";

jest.mock("@expo/vector-icons/FontAwesome", () => ({
  __esModule: true,
  default: "MockedFontAwesome",
}));

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => ({
  __esModule: true,
  default: "MockedMaterialCommunityIcons",
}));

const mockReport: ReportContentProps = {
  title: "Test Report",
  content: "This is a test report",
  likeCount: 10,
  dislikeCount: 2,
  selectedTags: ["Lost Item"] as TagKey[],
};

test("renders ReportContent correctly", () => {
  const { getByText } = render(<ReportContent {...mockReport} />);
  expect(getByText("Test Report")).toBeTruthy();
  expect(getByText("This is a test report")).toBeTruthy();
  expect(getByText("2")).toBeTruthy();
});

test("handles like and dislike toggling correctly", () => {
  const { getByTestId, getByText } = render(<ReportContent {...mockReport} />);

  const likeButton = getByTestId("like-button");
  const dislikeButton = getByTestId("dislike-button");

  // case: press dislike first, then like
  fireEvent.press(dislikeButton);
  expect(getByText("3")).toBeTruthy();
  fireEvent.press(likeButton);
  expect(getByText("11")).toBeTruthy();

  // case: press like first, then dislike
  fireEvent.press(likeButton);
  expect(getByText("10")).toBeTruthy();
  fireEvent.press(dislikeButton);
  expect(getByText("3")).toBeTruthy();

  // undo dislike
  fireEvent.press(dislikeButton);
  expect(getByText("2")).toBeTruthy();
});

test("toggles bookmark correctly", () => {
  const { getByTestId } = render(<ReportContent {...mockReport} />);

  const bookmarkButton = getByTestId("bookmark-button");
  fireEvent.press(bookmarkButton);
  fireEvent.press(bookmarkButton);
});

test("renders ReportTags with default empty selectedTags", () => {
  const { getByTestId } = render(<ReportTags selectedTags={[]} />);

  expect(getByTestId("tags-container")).toBeTruthy();
});

test("removes like when pressing dislike (Covers Lines 72-73)", () => {
    const { getByTestId, getByText } = render(<ReportContent {...mockReport} />);
  
    const likeButton = getByTestId("like-button");
    const dislikeButton = getByTestId("dislike-button");
  
    fireEvent.press(likeButton);
    expect(getByText("11")).toBeTruthy();
  
    fireEvent.press(dislikeButton);
    
    expect(getByText("10")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
  });
  
  test("renders ReportTags with default empty selectedTags (Covers Line 36)", () => {
    const { getByTestId } = render(<ReportTags />);
  
    expect(getByTestId("tags-container")).toBeTruthy();
  });
  