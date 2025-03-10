import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NavContainer from "@/components/displays/NavContainer";
import NavButton from "@/components/buttons/NavButton";
import MapButton from "@/components/buttons/MapButton";

jest.mock("@/components/buttons/NavButton", () => {
    const { TouchableOpacity } = require("react-native");
    return jest.fn(({ onPress, type }: { onPress?: () => void; type: string }) => (
      <TouchableOpacity testID={`nav-button-${type}`} onPress={onPress} />
    ));
  });
  
jest.mock("@/components/buttons/MapButton", () => {
    const { TouchableOpacity } = require("react-native");
    return jest.fn(({ onPress }: { onPress?: () => void }) => (
      <TouchableOpacity testID="map-button" onPress={onPress} />
    ));
  });
  

describe("NavContainer", () => {
  it("renders correctly with default props", () => {
    const { getByTestId } = render(<NavContainer />);
    expect(getByTestId("nav-container")).toBeTruthy();
  });

  it("renders all navigation buttons", () => {
    render(<NavContainer />);
    
    const expectedTypes = ["home", "chat", "notifications", "profile"];
    
    expectedTypes.forEach((type) => {
      expect(NavButton).toHaveBeenCalledWith(
        expect.objectContaining({ type }),
        {}
      );
    });
  
    expect(MapButton).toHaveBeenCalledWith(
        expect.objectContaining({ active: expect.any(Boolean) }),
        {}
    );
  });  

  it("sets the correct active tab", () => {
    render(<NavContainer activeTab="chat" />);
    expect(NavButton).toHaveBeenCalledWith(
      expect.objectContaining({ type: "chat", active: true }),
      {}
    );
  });

  it("defaults to 'home' when given an invalid activeTab", () => {
    render(<NavContainer activeTab="invalid-tab" />);
    expect(NavButton).toHaveBeenCalledWith(expect.objectContaining({ type: "home", active: true }), {});
  });

  it("defaults to 'home' when no activeTab is provided", () => {
    render(<NavContainer />);
    expect(NavButton).toHaveBeenCalledWith(expect.objectContaining({ type: "home", active: true }), {});
  });

  it("calls onHomePress when Home button is pressed", () => {
    const onHomePress = jest.fn();
    const { getByTestId } = render(<NavContainer onHomePress={onHomePress} />);
    
    fireEvent.press(getByTestId("nav-button-home"));
    expect(onHomePress).toHaveBeenCalled();
  });
  
  it("calls onChatPress when Chat button is pressed", () => {
    const onChatPress = jest.fn();
    const { getByTestId } = render(<NavContainer onChatPress={onChatPress} />);
    
    fireEvent.press(getByTestId("nav-button-chat"));
    expect(onChatPress).toHaveBeenCalled();
  });
  
  it("calls onMapPress when Map button is pressed", () => {
    const onMapPress = jest.fn();
    const { getByTestId } = render(<NavContainer onMapPress={onMapPress} />);
    
    fireEvent.press(getByTestId("map-button"));
    expect(onMapPress).toHaveBeenCalled();
  });
  
  it("calls onNotificationsPress when Notifications button is pressed", () => {
    const onNotificationsPress = jest.fn();
    const { getByTestId } = render(<NavContainer onNotificationsPress={onNotificationsPress} />);
    
    fireEvent.press(getByTestId("nav-button-notifications"));
    expect(onNotificationsPress).toHaveBeenCalled();
  });
  
  it("calls onProfilePress when Profile button is pressed", () => {
    const onProfilePress = jest.fn();
    const { getByTestId } = render(<NavContainer onProfilePress={onProfilePress} />);
    
    fireEvent.press(getByTestId("nav-button-profile"));
    expect(onProfilePress).toHaveBeenCalled();
  });
  
});
