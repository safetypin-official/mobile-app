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
  searchIcon: "<svg>search</svg>",
  searchIconActive: "<svg>search-active</svg>",
  bellIcon: "<svg>bell</svg>",
  bellIconActive: "<svg>bell-active</svg>",
  userIcon: "<svg>user</svg>",
  userIconActive: "<svg>user-active</svg>",
}));

describe("NavButton", () => {
  const types = ["home", "search", "notifs", "profile"];

  it("renders correctly for each type", () => {
    types.forEach((type) => {
      const { getByTestId } = render(<NavButton type={type} />);
      expect(getByTestId(`nav-button-${type}`)).toBeTruthy();
    });
  });

  it("renders active icon and text when active is true", () => {
    const { getByText } = render(<NavButton type="home" active />);
    
    expect(SvgXml).toHaveBeenCalledWith(
      expect.objectContaining({ xml: "<svg>home-active</svg>" }),
      expect.any(Object)
    );
    
    expect(getByText("Home")).toBeTruthy();
  });

  it("renders home button when type is invalid", () => {
    const { getByText } = render(<NavButton type="invalid" active />);
    
    expect(SvgXml).toHaveBeenCalledWith(
      expect.objectContaining({ xml: "<svg>home-active</svg>" }),
      expect.any(Object)
    );
    
    expect(getByText("Home")).toBeTruthy();
  });

  it("renders home button when type is not provided", () => {
    const { getByText } = render(<NavButton active />);
    
    expect(SvgXml).toHaveBeenCalledWith(
      expect.objectContaining({ xml: "<svg>home-active</svg>" }),
      expect.any(Object)
    );
    
    expect(getByText("Home")).toBeTruthy();
  });

  it("renders inactive icon when active is false", () => {
    render(<NavButton type="search" active={false} />);
    expect(SvgXml).toHaveBeenCalledWith(
      expect.objectContaining({ xml: "<svg>search</svg>" }),
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
