import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NavButton from "@/components/buttons/NavButton";
import { SvgXml } from "react-native-svg";

jest.mock("react-native-svg", () => ({
  SvgXml: jest.fn(() => null),
}));

jest.mock("@/assets/icons", () => ({
  homeIcon: "<svg>home</svg>",
  homeIconActive: "<svg>home-active</svg>",
  chatIcon: "<svg>chat</svg>",
  chatIconActive: "<svg>chat-active</svg>",
  bellIcon: "<svg>bell</svg>",
  bellIconActive: "<svg>bell-active</svg>",
  userIcon: "<svg>user</svg>",
  userIconActive: "<svg>user-active</svg>",
}));

describe("NavButton", () => {
  const types = ["home", "chat", "notifications", "profile"];

  it("renders correctly for each type", () => {
    types.forEach((type) => {
      const { getByTestId } = render(<NavButton type={type} />);
      expect(getByTestId(`nav-button-${type}`)).toBeTruthy();
    });
  });

  it("renders active icon and text when active is true", () => {
    const { getByTestId, getByText } = render(<NavButton type="home" active />);
    
    expect(SvgXml).toHaveBeenCalledWith(
      expect.objectContaining({ xml: "<svg>home-active</svg>" }),
      expect.any(Object)
    );
    
    expect(getByText("Home")).toBeTruthy();
  });

  it("renders home button when type is invalid", () => {
    const { getByTestId, getByText } = render(<NavButton type="invalid" active />);
    
    expect(SvgXml).toHaveBeenCalledWith(
      expect.objectContaining({ xml: "<svg>home-active</svg>" }),
      expect.any(Object)
    );
    
    expect(getByText("Home")).toBeTruthy();
  });

  it("renders home button when type is not provided", () => {
    const { getByTestId, getByText } = render(<NavButton active />);
    
    expect(SvgXml).toHaveBeenCalledWith(
      expect.objectContaining({ xml: "<svg>home-active</svg>" }),
      expect.any(Object)
    );
    
    expect(getByText("Home")).toBeTruthy();
  });

  it("renders inactive icon when active is false", () => {
    const { getByTestId } = render(<NavButton type="chat" active={false} />);
    expect(SvgXml).toHaveBeenCalledWith(
      expect.objectContaining({ xml: "<svg>chat</svg>" }),
      expect.any(Object)
    );
  });

  it("calls onPress when clicked", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<NavButton type="profile" onPress={onPressMock} />);
    fireEvent.press(getByTestId("nav-button-profile"));
    expect(onPressMock).toHaveBeenCalled();
  });

});
