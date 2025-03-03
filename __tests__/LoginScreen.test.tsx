import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LoginScreen, {onGoogleAuth} from "@/app/index";
import { Alert } from "react-native";
import { router } from 'expo-router';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
        
jest.spyOn(Alert, "alert");

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  router: {
    push: jest.fn(),
  },
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    configure: jest.fn()
  }
}));

const mockedGoogleSignin = GoogleSignin as jest.Mocked<typeof GoogleSignin>;

console.log = jest.fn();

describe("LoginScreen", () => {
  it("renders the LoginForm component", () => {
    const { getByTestId } = render(<LoginScreen />);
    
    expect(getByTestId("login-screen")).toBeTruthy();
  });

  it("navigates to forgotPassword screen on button press", () => {
    const { getByText } = render(<LoginScreen />);
    
    fireEvent.press(getByText("Forgot password?"));
    
    expect(router.push).toHaveBeenCalledWith('/forgotPassword');
  });

  it("navigates to sign up screen when sign-up text is pressed", () => {
    const { getByTestId } = render(<LoginScreen />);
    
    fireEvent.press(getByTestId("signup-link"));
    expect(router.push).toHaveBeenCalledWith('/signUp');
  });

  it("shows error alert when email format is invalid", () => {
    const { getByTestId, getByPlaceholderText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText("Username/E-mail address"), "invalid-email");
    fireEvent.press(getByTestId("login-button"));
    
    expect(Alert.alert).toHaveBeenCalledWith("Invalid email format!");
  });

  it("triggers log in alert when a valid email is entered", () => {
    const { getByTestId, getByPlaceholderText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText("Username/E-mail address"), "user@example.com");
    fireEvent.press(getByTestId("login-button"));
    
    expect(Alert.alert).toHaveBeenCalledWith("Log In Pressed!");
  });

  it("triggers apple auth alert when the apple auth button is pressed", () => {
    const { getByTestId } = render(<LoginScreen />);
    
    fireEvent.press(getByTestId("apple-auth"));
    
    expect(Alert.alert).toHaveBeenCalledWith("Apple Auth Pressed!");
  });
});

describe("onGoogleAuth function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("successfully signs in with Google", async () => {
    const mockUserInfo = {
      data: { 
        email: "test@example.com", 
        name: "Test User" 
      }
    } as any;
    
    mockedGoogleSignin.hasPlayServices.mockResolvedValue(true);
    mockedGoogleSignin.signIn.mockResolvedValue(mockUserInfo);

    await onGoogleAuth();

    expect(mockedGoogleSignin.hasPlayServices).toHaveBeenCalledTimes(1);
    expect(mockedGoogleSignin.signIn).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("success");
  });

  it("handles errors during Google sign in", async () => {
    const mockError = new Error("Google Sign-In Error");
    
    mockedGoogleSignin.hasPlayServices.mockResolvedValue(true);
    mockedGoogleSignin.signIn.mockRejectedValue(mockError);

    await onGoogleAuth();

    expect(mockedGoogleSignin.hasPlayServices).toHaveBeenCalledTimes(1);
    expect(mockedGoogleSignin.signIn).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("error");
    expect(console.log).toHaveBeenCalledWith(mockError);
  });

  it("handles Play Services not available error", async () => {
    const mockError = new Error("Play Services not available");
    
    mockedGoogleSignin.hasPlayServices.mockRejectedValue(mockError);

    await onGoogleAuth();

    expect(mockedGoogleSignin.hasPlayServices).toHaveBeenCalledTimes(1);
    expect(mockedGoogleSignin.signIn).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("error");
    expect(console.log).toHaveBeenCalledWith(mockError);
  });
});