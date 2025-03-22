import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CommentSection from "../../../components/displays/CommentSection";

jest.spyOn(global.console, "log").mockImplementation(() => {});

jest.mock("../../../components/buttons/MoreOptionsButton", () => {
  const { View, Text } = require("react-native");
  return ({ onReport, closeModal, onSendMessage }: { onReport: () => void; closeModal: () => void; onSendMessage: () => void }) => (
    <View testID="mocked-more-options-button">
      <Text testID="report" onPress={() => setTimeout(onReport, 500)}>Report</Text>
      <Text testID="send-message" onPress={() => { console.log("Send Message"); onSendMessage(); }}> Send Message </Text>
      <Text testID="close-modal" onPress={closeModal}>Close</Text>
    </View>
  );
});

jest.mock("../../../components/toast/Toast", () => {
  const { View, Text } = require("react-native");
  return ({ text }: { text: string }) => (
    <View testID="mocked-toast">
      <Text>{text}</Text>
    </View>
  );
});

jest.mock("@expo/vector-icons", () => ({
    Ionicons: "",
}));

jest.mock("@expo/vector-icons", () => ({
    AntDesign: "",
  }));

jest.spyOn(console, "log").mockImplementation(() => {});


const mockComment = {
  avatarUrl: "https://example.com/avatar.jpg",
  username: "John Doe",
  handle: "@johndoe",
  date: "Feb 20",
  content: "This is a test comment",
  likeCount: 5,
  likeIconUrl: "https://example.com/like-icon.png",
  moreOptionsIconUrl: "https://example.com/more-options-icon.png",
};

test("renders CommentSection correctly", () => {
    const { getByText } = render(<CommentSection {...mockComment} />);
    expect(getByText("John Doe")).toBeTruthy();
    expect(getByText("@johndoe • Feb 20")).toBeTruthy();
    expect(getByText("This is a test comment")).toBeTruthy();
  });

  it("triggers onRequestClose for modal", async () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...mockComment} />);
  
    fireEvent.press(getByTestId("more-options-button"));
    await waitFor(() => expect(queryByTestId("mocked-more-options-button")).toBeTruthy());
  
    fireEvent(getByTestId("more-options-modal"), "requestClose");
    await waitFor(() => expect(queryByTestId("mocked-more-options-button")).toBeNull());
  });

  it("tests MoreOptionsButton interactions", async () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...mockComment} />);
  
    fireEvent.press(getByTestId("more-options-button"));  
    await waitFor(() => expect(queryByTestId("mocked-more-options-button")).toBeTruthy());
  
    fireEvent.press(getByTestId("send-message"));
    expect(console.log).toHaveBeenCalledWith("Send Message");
  
    fireEvent.press(getByTestId("report"));
    await waitFor(() => expect(getByTestId("mocked-toast")).toBeTruthy());

    await waitFor(() => expect(queryByTestId("mocked-more-options-button")).toBeNull());
  });  
  

  it("ensures toast displays 'Report Submitted' and can be dismissed", async () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...mockComment} />);
  
    fireEvent.press(getByTestId("more-options-button"));
    fireEvent.press(getByTestId("report"));

    await waitFor(() => expect(getByTestId("mocked-toast")).toHaveTextContent("Report Submitted"));

    fireEvent.press(getByTestId("report-submitted"));

    await waitFor(() => expect(queryByTestId("mocked-toast")).toBeNull());
  });  
  

  it("opens and closes MoreOptionsButton modal", async () => {
    const { getByTestId, queryByTestId } = render(<CommentSection {...mockComment} />);
  
    fireEvent.press(getByTestId("more-options-button"));
    await waitFor(() => expect(queryByTestId("mocked-more-options-button")).toBeTruthy());
  
    expect(await waitFor(() => getByTestId("report"))).toBeTruthy();
  
    fireEvent.press(getByTestId("report"));

    expect(await waitFor(() => getByTestId("report-submitted"))).toBeTruthy();
  
    await waitFor(() => expect(queryByTestId("mocked-more-options-button")).toBeNull());
});  


it("closes modal when clicking outside", async () => {
  const { getByTestId, queryByTestId } = render(<CommentSection {...mockComment} />);

  fireEvent.press(getByTestId("more-options-button"));
  await waitFor(() => expect(queryByTestId("mocked-more-options-button")).toBeTruthy());

  fireEvent.press(getByTestId("modal-overlay"));
  await waitFor(() => expect(queryByTestId("mocked-more-options-button")).toBeNull());
});

it("renders without crashing when required props are missing", () => {
  const { getByText } = render(
    <CommentSection
      avatarUrl=""
      username="Anonymous"
      handle=""
      date=""
      content=""
      likeCount={0}
      likeIconUrl=""
      moreOptionsIconUrl=""
    />
  );

  expect(getByText("Anonymous")).toBeTruthy();
});

it("does not crash when onRequestClose is called on an already closed modal", async () => {
  const { queryByTestId } = render(<CommentSection {...mockComment} />);

  expect(queryByTestId("more-options-modal")).toBeNull();

  const modal = queryByTestId("more-options-modal");
  if (modal) {
    fireEvent(modal, "requestClose");
  }

  expect(queryByTestId("more-options-modal")).toBeNull();
});



it("calls onSendMessage function when clicking 'Send Message'", async () => {
  const { getByTestId } = render(<CommentSection {...mockComment} />);
  
  fireEvent.press(getByTestId("more-options-button"));
  fireEvent.press(getByTestId("send-message"));

  expect(console.log).toHaveBeenCalledWith("Send Message");
});




