import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Layout from "@/app/_layout";
import NavContainer from "@/components/displays/NavContainer";
import { usePathname } from "expo-router";

jest.mock("@/components/displays/NavContainer", () => {
  return jest.fn(({ onHomePress, onChatPress, onMapPress, onNotificationsPress, onProfilePress }) => {
    const { View, TouchableOpacity, Text } = require("react-native"); // Lazy import inside mock
    return (
      <View>
        <View testID="nav-container" />
        <TouchableOpacity onPress={onHomePress} testID="home-button">
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onChatPress} testID="chat-button">
          <Text>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onMapPress} testID="map-button">
          <Text>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNotificationsPress} testID="notifications-button">
          <Text>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onProfilePress} testID="profile-button">
          <Text>Profile</Text>
        </TouchableOpacity>
      </View>
    );
  });
});

jest.mock("expo-router", () => {
  const { View } = require("react-native"); // Lazy import
  return {
    usePathname: jest.fn(),
    Stack: jest.fn(() => <View testID="stack-component" />),
  };
});

describe("Layout", () => {
  it("renders Stack component", () => {
    (usePathname as jest.Mock).mockReturnValue("/home");
    const { getByTestId } = render(<Layout />);
    expect(getByTestId("stack-component")).toBeTruthy();
  });

  it("renders NavContainer when pathname is not in hideNavBarRoutes", () => {
    (usePathname as jest.Mock).mockReturnValue("/home");
    const { getByTestId } = render(<Layout />);
    expect(getByTestId("nav-container")).toBeTruthy();
  });

  it("hides NavContainer when pathname is in hideNavBarRoutes", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    const { queryByTestId } = render(<Layout />);
    expect(queryByTestId("nav-container")).toBeNull();
  });

  it("updates activeTab when Home button is pressed", () => {
    (usePathname as jest.Mock).mockReturnValue("/home");
    const { getByTestId } = render(<Layout />);
    fireEvent.press(getByTestId("home-button"));
    expect(NavContainer).toHaveBeenCalledWith(expect.objectContaining({ activeTab: "home" }), {});
  });

  it("updates activeTab when Chat button is pressed", () => {
    (usePathname as jest.Mock).mockReturnValue("/home");
    const { getByTestId } = render(<Layout />);
    fireEvent.press(getByTestId("chat-button"));
    expect(NavContainer).toHaveBeenCalledWith(expect.objectContaining({ activeTab: "chat" }), {});
  });

  it("updates activeTab when Map button is pressed", () => {
    (usePathname as jest.Mock).mockReturnValue("/home");
    const { getByTestId } = render(<Layout />);
    fireEvent.press(getByTestId("map-button"));
    expect(NavContainer).toHaveBeenCalledWith(expect.objectContaining({ activeTab: "map" }), {});
  });

  it("updates activeTab when Notifications button is pressed", () => {
    (usePathname as jest.Mock).mockReturnValue("/home");
    const { getByTestId } = render(<Layout />);
    fireEvent.press(getByTestId("notifications-button"));
    expect(NavContainer).toHaveBeenCalledWith(expect.objectContaining({ activeTab: "notifications" }), {});
  });

  it("updates activeTab when Profile button is pressed", () => {
    (usePathname as jest.Mock).mockReturnValue("/home");
    const { getByTestId } = render(<Layout />);
    fireEvent.press(getByTestId("profile-button"));
    expect(NavContainer).toHaveBeenCalledWith(expect.objectContaining({ activeTab: "profile" }), {});
  });
});
