import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import UserInteraction from "../../../components/displays/post/UserInteraction";
import { likeIcon, dislikeIcon } from "@/assets/userInteractions";

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    SvgXml: ({ xml, width, height, fill, testID }) => (
      <View testID={testID} data-xml={xml} data-width={width} data-height={height} data-fill={fill} />
    ),
  };
});

describe("UserInteraction Component", () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  test("renders default like icon when no type is provided", () => {
    const { UNSAFE_getByProps } = render(<UserInteraction onPress={mockOnPress} />);
    const svgElement = UNSAFE_getByProps({ 'data-xml': likeIcon });
    expect(svgElement).toBeTruthy();
    expect(svgElement.props['data-width']).toBe(24); // Default width
    expect(svgElement.props['data-height']).toBe(24); // Default height
    expect(svgElement.props['data-fill']).toBe("#7F7574"); // Default fill
  });

  test("renders like icon with correct props", () => {
    const { UNSAFE_getByProps } = render(<UserInteraction type="like-icon" onPress={mockOnPress} />);
    const svgElement = UNSAFE_getByProps({ 'data-xml': likeIcon });
    expect(svgElement).toBeTruthy();
  });

  test("renders dislike icon with correct props", () => {
    const { UNSAFE_getByProps } = render(<UserInteraction type="dislike-icon" onPress={mockOnPress} />);
    const svgElement = UNSAFE_getByProps({ 'data-xml': dislikeIcon });
    expect(svgElement).toBeTruthy();
  });

  test("renders default like icon when an invalid type is provided", () => {
    const { UNSAFE_getByProps } = render(<UserInteraction type="invalid-type" onPress={mockOnPress} />);
    const svgElement = UNSAFE_getByProps({ 'data-xml': likeIcon });
    expect(svgElement).toBeTruthy();
  });

  test("applies custom width, height and fill props", () => {
    const { UNSAFE_getByProps } = render(
      <UserInteraction 
        type="like-icon" 
        onPress={mockOnPress} 
        width={32} 
        height={32} 
        fill="#FF0000" 
      />
    );
    const svgElement = UNSAFE_getByProps({ 'data-xml': likeIcon });
    expect(svgElement.props['data-width']).toBe(32);
    expect(svgElement.props['data-height']).toBe(32);
    expect(svgElement.props['data-fill']).toBe("#FF0000");
  });

});