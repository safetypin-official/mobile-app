import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Tag from "@/components/displays/post/Tags";
import {
  lostItemTag,
  foundItemTag,
  theftTag,
  harassmentTag,
  floodTag,
  assaultTag,
  fireTag,
  otherDisasterTag,
  earthquakeTag,
  otherCrimeTag
} from '../../../assets/tags';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    SvgXml: ({ xml, style }) => (
      <View data-xml={xml} style={style} />
    ),
  };
});

const tagTypes = [
  { type: "lost-item", xml: lostItemTag },
  { type: "found-item", xml: foundItemTag },
  { type: "theft", xml: theftTag },
  { type: "harassment", xml: harassmentTag },
  { type: "flood", xml: floodTag },
  { type: "assault", xml: assaultTag },
  { type: "fire", xml: fireTag },
  { type: "other-disaster", xml: otherDisasterTag },
  { type: "earthquake", xml: earthquakeTag },
  { type: "other-crime", xml: otherCrimeTag },
];

describe("Tag Component", () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  test("renders default tag (other-crime) when no type is provided", () => {
    const { UNSAFE_getByProps } = render(<Tag onPress={mockOnPress} />);
    const svgElement = UNSAFE_getByProps({ 'data-xml': otherCrimeTag });
    expect(svgElement).toBeTruthy();
    expect(svgElement.props.style).toEqual({ width: 6, height: 6 });
  });

  tagTypes.forEach(({ type, xml }) => {
    test(`renders correct tag for type "${type}"`, () => {
      const { UNSAFE_getByProps } = render(<Tag type={type} onPress={mockOnPress} />);
      const svgElement = UNSAFE_getByProps({ 'data-xml': xml });
      expect(svgElement).toBeTruthy();
    });
  });

  test("renders default tag (other-crime) when an invalid type is provided", () => {
    const { UNSAFE_getByProps } = render(<Tag type="invalid-type" onPress={mockOnPress} />);
    const svgElement = UNSAFE_getByProps({ 'data-xml': otherCrimeTag });
    expect(svgElement).toBeTruthy();
  });
});