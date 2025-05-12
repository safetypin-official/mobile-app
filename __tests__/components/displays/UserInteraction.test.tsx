import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import UserInteraction from "@/components/displays/post/UserInteraction";

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    SvgXml: ({ xml, width, height, fill, testID }) => (
      <View 
        testID={testID} 
        width={width} 
        height={height} 
        fill={fill} 
        data-type="svg-mock" 
        data-xml={xml}
      />
    ),
  };
});

describe("UserInteraction Component", () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  test("renders default like icon when no type is provided", () => {
    const { getByTestId } = render(<UserInteraction onPress={mockOnPress} />);
    const svgElement = getByTestId("svg-icon");
    expect(svgElement).toBeTruthy();
    expect(svgElement.props.width).toBe(24); // Default width
    expect(svgElement.props.height).toBe(24); // Default height
  });

  test("renders like icon with correct props", () => {
    const { getByTestId } = render(<UserInteraction type="like-icon" onPress={mockOnPress} />);
    const svgElement = getByTestId("svg-icon");
    expect(svgElement).toBeTruthy();
    // Verify it contains the like icon SVG data
    expect(svgElement.props["data-xml"]).toContain("M5.49311 12.012");
  });

  test("renders dislike icon with correct props", () => {
    const { getByTestId } = render(<UserInteraction type="dislike-icon" onPress={mockOnPress} />);
    const svgElement = getByTestId("svg-icon");
    expect(svgElement).toBeTruthy();
    // Verify it contains the dislike icon SVG data
    expect(svgElement.props["data-xml"]).toContain("M5.4928 0.0119629");
  });

  test("renders default like icon when an invalid type is provided", () => {
    const { getByTestId } = render(<UserInteraction type="invalid-type" onPress={mockOnPress} />);
    const svgElement = getByTestId("svg-icon");
    expect(svgElement).toBeTruthy();
    // Verify it contains the like icon SVG data (default case)
    expect(svgElement.props["data-xml"]).toContain("M5.49311 12.012");
  });

  test("applies custom width, height and fill props", () => {
    const { getByTestId } = render(
      <UserInteraction 
        type="like-icon" 
        onPress={mockOnPress} 
        width={32} 
        height={32} 
        fill="#FF0000" 
        testID="custom-test-id"
      />
    );
    const svgElement = getByTestId("custom-test-id");
    expect(svgElement.props.width).toBe(32);
    expect(svgElement.props.height).toBe(32);
    // Verify custom fill color is applied
    expect(svgElement.props["data-xml"]).toContain('fill="#FF0000"');
  });

  test("calls onPress when pressed", () => {
    const { getByTestId } = render(<UserInteraction onPress={mockOnPress} />);
    const touchable = getByTestId("svg-icon").parent;
    fireEvent.press(touchable);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
  
  // Tests for the fallback testID branches
  
  test("sets proper testID for like-icon type with null testID prop", () => {
    // Custom test renderer to inspect what props are passed to SvgXml
    const { SvgXml } = require('react-native-svg');
    const originalImpl = SvgXml;
    
    // Create a spy to track what's passed to SvgXml
    let capturedProps = null;
    jest.spyOn(require('react-native-svg'), 'SvgXml').mockImplementationOnce(props => {
      capturedProps = props;
      return originalImpl(props);
    });
    
    // Pass null explicitly instead of undefined to test the || operator
    render(<UserInteraction type="like-icon" onPress={mockOnPress} testID={null} />);
    
    // Check that the iconTestID logic defaulted to 'like-icon'
    expect(capturedProps.testID).toBe('like-icon'); // Default from destructuring
  });
  
  test("sets proper testID for dislike-icon type with null testID prop", () => {
    // Custom test renderer to inspect what props are passed to SvgXml
    const { SvgXml } = require('react-native-svg');
    const originalImpl = SvgXml;
    
    // Create a spy to track what's passed to SvgXml
    let capturedProps = null;
    jest.spyOn(require('react-native-svg'), 'SvgXml').mockImplementationOnce(props => {
      capturedProps = props;
      return originalImpl(props);
    });
    
    // Pass null explicitly instead of undefined to test the || operator
    render(<UserInteraction type="dislike-icon" onPress={mockOnPress} testID={null} />);
    
    // Check the branching logic for dislike-icon
    expect(capturedProps.testID).toBe('dislike-icon'); // Default from destructuring
  });
  
  test("sets proper testID for invalid type with null testID prop", () => {
    // Custom test renderer to inspect what props are passed to SvgXml
    const { SvgXml } = require('react-native-svg');
    const originalImpl = SvgXml;
    
    // Create a spy to track what's passed to SvgXml
    let capturedProps = null;
    jest.spyOn(require('react-native-svg'), 'SvgXml').mockImplementationOnce(props => {
      capturedProps = props;
      return originalImpl(props);
    });
    
    // Pass null explicitly instead of undefined to test the || operator
    render(<UserInteraction type="invalid-type" onPress={mockOnPress} testID={null} />);
    
    // Check the branching logic for default case
    expect(capturedProps.testID).toBe('default-icon'); // Default from destructuring
  });
});