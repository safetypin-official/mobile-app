import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Layout from "@/app/_layout";
import NavContainer from "@/components/displays/NavContainer";
import { usePathname, router } from "expo-router";

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
    router: {
      push: jest.fn(),
      replace: jest.fn()
    }
  };
});

describe("Layout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    expect(router.replace).toHaveBeenCalledWith("/feedScreen");
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
    
    // Clear previous calls
    (router.replace as jest.Mock).mockClear();
    
    fireEvent.press(getByTestId("map-button"));
    expect(NavContainer).toHaveBeenCalledWith(expect.objectContaining({ activeTab: "map" }), {});
  });

  it("navigates to post screen when Map button is pressed while already on map tab", () => {
    (usePathname as jest.Mock).mockReturnValue("/map");
    const { getByTestId } = render(<Layout />);
    
    // NavContainer will already be rendered with map as the active tab
    expect(NavContainer).toHaveBeenCalledWith(expect.objectContaining({ activeTab: "map" }), {});
    
    // Clear previous calls to NavContainer and router methods
    (NavContainer as jest.Mock).mockClear();
    (router.push as jest.Mock).mockClear();
    
    // Press map button while already on map tab
    fireEvent.press(getByTestId("map-button"));
    
    // Verify router.push was called with "/post"
    expect(router.push).toHaveBeenCalledWith("/post");
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

  it("initializes with activeTab set to 'map'", () => {
    (usePathname as jest.Mock).mockReturnValue("/someOtherRoute");
    render(<Layout />);
    expect(NavContainer).toHaveBeenCalledWith(expect.objectContaining({ activeTab: "map" }), {});
  });

  it("updates activeTab to 'map' when pathname is '/map'", () => {
    (usePathname as jest.Mock).mockReturnValue("/map");
    render(<Layout />);
    expect(NavContainer).toHaveBeenCalledWith(expect.objectContaining({ activeTab: "map" }), {});
  });

  it("updates activeTab to 'home' when pathname is '/feedScreen'", () => {
    (usePathname as jest.Mock).mockReturnValue("/feedScreen");
    render(<Layout />);
    expect(NavContainer).toHaveBeenCalledWith(expect.objectContaining({ activeTab: "home" }), {});
  });

  it("doesn't render NavContainer for other routes in hideNavBarRoutes", () => {
    const hideNavBarRoutes = [
      "/forgotPassword", 
      "/forgotPassword/newPasswordScreen", 
      "/forgotPassword/otpVerificationScreen", 
      "/signUp", 
      "/signUp/otp"
    ];
    
    hideNavBarRoutes.forEach(route => {
      (usePathname as jest.Mock).mockReturnValue(route);
      const { queryByTestId } = render(<Layout />);
      expect(queryByTestId("nav-container")).toBeNull();
    });
  });

  it("navigates to map screen and sets activeTab to map when Map button is pressed while not on map tab", () => {
    // Mock the pathname to be something other than /map
    (usePathname as jest.Mock).mockReturnValue("/feedScreen");
    
    // Render the component
    const { getByTestId } = render(<Layout />);
    
    // Clear previous calls to NavContainer and router methods
    (NavContainer as jest.Mock).mockClear();
    (router.replace as jest.Mock).mockClear();
    
    // Press the map button
    fireEvent.press(getByTestId("map-button"));
    
    // Verify NavContainer was called with the correct activeTab
    expect(NavContainer).toHaveBeenCalledWith(
      expect.objectContaining({ activeTab: "map" }), 
      {}
    );
    
    // Verify router.replace was called with "/map"
    expect(router.replace).toHaveBeenCalledWith("/map");
  });
});