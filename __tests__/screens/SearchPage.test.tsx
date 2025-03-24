import React from "react";
import { render } from "@testing-library/react-native";
import SearchPage from "@/app/search/index"; // Assuming the file is SearchPage.tsx

jest.mock("@expo/vector-icons", () => ({
  Feather: (props: Record<string, unknown>) => `Feather ${JSON.stringify(props)}`,
  FontAwesome: (props: Record<string, unknown>) => `FontAwesome ${JSON.stringify(props)}`,
  AntDesign: jest.fn(() => null),
}));

jest.mock('react-native-svg', () => ({
  SvgXml: jest.fn(() => null),
}));

describe("SearchPage Component", () => {
  it("renders correctly", () => {
    const { getByTestId } = render(<SearchPage />);
    
    // Check if SearchPage is rendered
    expect(getByTestId("search-page")).toBeTruthy();
  });

  it("renders SearchBarFilter inside SearchPage", () => {
    const { getByTestId } = render(<SearchPage />);
    
    // Ensure SearchBarFilter is rendered
    expect(getByTestId("search-bar-filter")).toBeTruthy();
  });

  it("contains a SafeAreaView", () => {
    const { getByTestId } = render(<SearchPage />);
    
    // Check if SafeAreaView exists and has the correct style
    const safeAreaView = getByTestId("search-page-safeAreaView");
    expect(safeAreaView).toBeTruthy();
    expect(safeAreaView.props.style).toEqual(expect.objectContaining({
      backgroundColor: "#ffffff",
      flex: 1,
    }));
  });

  it("contains a View with the correct style", () => {
    const { getByTestId } = render(<SearchPage />);
    
    // Check if the View inside the SearchPage exists and has the correct style
    const viewContainer = getByTestId("search-page");
    expect(viewContainer).toBeTruthy();
    expect(viewContainer.props.style).toEqual(expect.objectContaining({
      marginTop: "4%",
      justifyContent: "center",
      alignItems: "center",
    }));
  });
});
