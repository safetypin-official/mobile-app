import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import TagSelector from "@/components/inputs/TagSelector";

describe("TagSelector Component", () => {
  it("renders all tags correctly", () => {
    const { getByText } = render(
      <TagSelector selectedTags={[]} onTagChange={() => {}} />
    );

    const tags = [
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

    tags.forEach((tag) => {
      expect(getByText(tag)).toBeTruthy();
    });
  });
  
  it("displays selected tags with correct background color", () => {
    const { getByText } = render(
      <TagSelector selectedTags={["lost_item", "fire"]} onTagChange={() => {}} />
    );
  
    const lostItemTag = getByText("Lost Item").parent?.parent;
    const fireTag = getByText("Fire").parent?.parent;
  
    expect(lostItemTag?.props.style.backgroundColor).toBe("#9b2c2c");
    expect(fireTag?.props.style.backgroundColor).toBe("#e53e3e");
  });
  
  it("displays unselected tags with default background color", () => {
    const { getByText } = render(
      <TagSelector selectedTags={[]} onTagChange={() => {}} />
    );
  
    const theftTag = getByText("Theft").parent?.parent;
  
    expect(theftTag?.props.style.backgroundColor).toBe("#ddd");
  });  

  it("maintains multiple selected tags correctly", () => {
    const onTagChangeMock = jest.fn();
    const { getByText } = render(
      <TagSelector selectedTags={["lost_item"]} onTagChange={onTagChangeMock} />
    );

    const fireTag = getByText("Fire");

    // Select another tag
    fireEvent.press(fireTag);
    expect(onTagChangeMock).toHaveBeenCalledWith(["lost_item", "fire"]);
  });

  it("removes a tag from selection correctly", () => {
    const onTagChangeMock = jest.fn();
    const { getByText } = render(
      <TagSelector selectedTags={["lost_item", "fire"]} onTagChange={onTagChangeMock} />
    );

    const fireTag = getByText("Fire");

    // Deselect the tag
    fireEvent.press(fireTag);
    expect(onTagChangeMock).toHaveBeenCalledWith(["lost_item"]);
  });
});
