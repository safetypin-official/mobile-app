import React from "react";
import { render } from "@testing-library/react-native";
import ReportTags, { ReportTagsProps } from "../components/ReportTags";

jest.mock("@expo/vector-icons/FontAwesome", () => ({
    default: "MockedFontAwesome",
  }));
  
  jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => ({
    default: "MockedMaterialCommunityIcons",
  }));

const ALL_TAGS: ReportTagsProps["selectedTags"] = [
    "Lost Item",
    "Found Item",
    "Theft",
    "Harassment",
    "Flood",
    "Assault",
    "Fire",
    "Other Natural Disasters",
    "Earthquake",
    "Other Crime",
  ];
  
  describe("ReportTags Component", () => {
    it("renders correctly with all selected tags", () => {
      const { getByText } = render(<ReportTags selectedTags={ALL_TAGS} />);
  
      ALL_TAGS.forEach((tag) => {
        expect(getByText(tag)).toBeTruthy();
      });
    });
  
    it("renders only the provided selected tags", () => {
      const selectedTags: ReportTagsProps["selectedTags"] = ["Lost Item", "Flood"];
      const { getByText, queryByText } = render(<ReportTags selectedTags={selectedTags} />);
  
      selectedTags.forEach((tag) => {
        expect(getByText(tag)).toBeTruthy();
      });
  
      ALL_TAGS.filter((tag) => !selectedTags.includes(tag)).forEach((tag) => {
        expect(queryByText(tag)).toBeNull();
      });
    });
  
    it("renders no tags when given an empty array", () => {
      const { queryByText } = render(<ReportTags selectedTags={[]} />);
  
      ALL_TAGS.forEach((tag) => {
        expect(queryByText(tag)).toBeNull();
      });
    });
  
    it("renders icons correctly for each tag", () => {
        const { getByTestId } = render(<ReportTags selectedTags={ALL_TAGS} />);
        
        ALL_TAGS.forEach((tag) => {
          expect(getByTestId(`icon-${tag}`)).toBeTruthy();
        });
    });
  
    it("renders correctly when selectedTags is omitted (Covers Line 36)", () => {
      const { queryByText } = render(<ReportTags />);
    
      ALL_TAGS.forEach((tag) => {
        expect(queryByText(tag)).toBeNull();
      });
    });
         
  });