import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EditProfileForm from "@/components/forms/EditProfileForm";

jest.mock("@/components/inputs/InputField", () => {
    const React = require("react");
    const { TouchableOpacity, Text } = require("react-native");
  
    return ({ label, onChangeText, placeholder }: any) => {
      return (
        <>
          <Text>{label}</Text>
          <Text>{placeholder}</Text>
          <TouchableOpacity
            onPress={() => onChangeText(`${label.toLowerCase()}_user`)}
            testID={`input-${label.toLowerCase()}`}
          >
            <Text>Enter {label}</Text>
          </TouchableOpacity>
        </>
      );
    };
  });  

describe("EditProfileForm", () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnProfilePicChange = jest.fn();
  const mockOnProfileBannerChange = jest.fn();

  const initialData = {
    id: "1",
    role: "user",
    verified: true,
    instagram: "existing_ig",
    twitter: "existing_tw",
    profilePic: "https://example.com/pic.jpg",
    profileBanner: "https://example.com/banner.jpg",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with initial data", () => {
    const { getByText } = render(
      <EditProfileForm
        initialData={initialData}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onProfilePicChange={mockOnProfilePicChange}
        onProfileBannerChange={mockOnProfileBannerChange}
        testID="edit-profile-form"
      />
    );

    expect(getByText("Edit Profile")).toBeTruthy();
    expect(getByText("Close")).toBeTruthy();
    expect(getByText("Save")).toBeTruthy();
    expect(getByText("Instagram")).toBeTruthy();
    expect(getByText("existing_ig")).toBeTruthy();
    expect(getByText("Twitter")).toBeTruthy();
    expect(getByText("existing_tw")).toBeTruthy();
  });

  it("handles social link input changes and save", () => {
    const { getByTestId, getByText } = render(
      <EditProfileForm
        initialData={initialData}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onProfilePicChange={mockOnProfilePicChange}
        onProfileBannerChange={mockOnProfileBannerChange}
        testID="edit-profile-form"
      />
    );

    fireEvent.press(getByTestId("input-instagram"));
    fireEvent.press(getByTestId("input-twitter"));
    fireEvent.press(getByTestId("input-line"));
    fireEvent.press(getByTestId("input-tiktok"));
    fireEvent.press(getByTestId("input-discord"));

    fireEvent.press(getByText("Save"));

    expect(mockOnSave).toHaveBeenCalledWith({
      instagram: "instagram_user",
      twitter: "twitter_user",
      line: "line_user",
      tiktok: "tiktok_user",
      discord: "discord_user",
    });
  });

  it("calls onClose when Close button is pressed", () => {
    const { getByText } = render(
      <EditProfileForm
        initialData={initialData}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onProfilePicChange={mockOnProfilePicChange}
        onProfileBannerChange={mockOnProfileBannerChange}
        testID="edit-profile-form"
      />
    );

    fireEvent.press(getByText("Close"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onProfilePicChange when profile picture is pressed", () => {
    const { getByTestId } = render(
      <EditProfileForm
        initialData={initialData}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onProfilePicChange={mockOnProfilePicChange}
        onProfileBannerChange={mockOnProfileBannerChange}
        testID="edit-profile-form"
      />
    );

    fireEvent.press(getByTestId("profile-pic-button"));
    expect(mockOnProfilePicChange).toHaveBeenCalled();
  });

  it("calls onProfileBannerChange when banner is pressed", () => {
    const { getByTestId } = render(
      <EditProfileForm
        initialData={initialData}
        onSave={mockOnSave}
        onClose={mockOnClose}
        onProfilePicChange={mockOnProfilePicChange}
        onProfileBannerChange={mockOnProfileBannerChange}
        testID="edit-profile-form"
      />
    );

    fireEvent.press(getByTestId("profile-banner-button"));
    expect(mockOnProfileBannerChange).toHaveBeenCalled();
  });
});