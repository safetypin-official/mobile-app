import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import PostFormScreen from "@/app/post/index";
import { router } from "expo-router";

jest.mock("@expo/vector-icons", () => ({
    Entypo: () => null, // Mock Entypo to avoid crashing the test
  }));  

// Mock navigation
jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

// Mock Expo Location API
jest.mock("expo-location", () => ({
    requestForegroundPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: "granted" })
    ),
    getCurrentPositionAsync: jest.fn(() =>
      Promise.resolve({ coords: { latitude: 12.34, longitude: 56.78 } })
    ),
  }));
  

describe("PostFormScreen", () => {
  it("renders all input fields and labels", async () => {
    const { getByText, getByPlaceholderText } = render(<PostFormScreen />);

    expect(getByText("New Report")).toBeTruthy();
    expect(getByText("Location")).toBeTruthy();
    expect(getByText("Tags")).toBeTruthy();
    expect(getByText("Attachments")).toBeTruthy();
    expect(getByPlaceholderText("Enter title")).toBeTruthy();
    expect(getByPlaceholderText("Enter description")).toBeTruthy();
  });

  it("fetches and displays location correctly", async () => {
    const { getByText } = render(<PostFormScreen />);
  
    await act(async () => {
      await waitFor(() => {
        expect(getByText(/Latitude:/)).toBeTruthy();
        expect(getByText(/Longitude:/)).toBeTruthy();
      });
    });
  });

  it("handles title input correctly", () => {
    const { getByPlaceholderText, getByDisplayValue } = render(<PostFormScreen />);
    const titleInput = getByPlaceholderText("Enter title");
  
    fireEvent.changeText(titleInput, "Test Title");
  
    // Correct way to check the updated value in React Native tests
    expect(getByDisplayValue("Test Title")).toBeTruthy();
  });

  it("handles description input correctly", () => {
    const { getByPlaceholderText, getByDisplayValue } = render(<PostFormScreen />);
    const descriptionInput = getByPlaceholderText("Enter description");

    fireEvent.changeText(descriptionInput, "Test Description");

    // Correct way to check the updated value in React Native tests
    expect(getByDisplayValue("Test Description")).toBeTruthy();
  });

  it("handles tag selection correctly", () => {
    const { getByText } = render(<PostFormScreen />);
    const tag = getByText("Lost Item");

    fireEvent.press(tag);
    expect(tag.parent?.parent?.props.style.backgroundColor).toBe("#9b2c2c");
    
    fireEvent.press(tag);
    expect(tag.parent?.parent?.props.style.backgroundColor).toBe("#ddd");
  });

  it("navigates back when close button is pressed", () => {
    const { getByTestId } = render(<PostFormScreen />);
    fireEvent.press(getByTestId("close-button"));

    expect(router.push).toHaveBeenCalledWith("/map");
  });

  it("submits the form and navigates away", async () => {
    const { getByText, getByPlaceholderText } = render(<PostFormScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter title"), "Emergency Report");
    fireEvent.changeText(getByPlaceholderText("Enter description"), "Urgent help needed");
    fireEvent.press(getByText("Post"));

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith("/map");
    });
  });
});
