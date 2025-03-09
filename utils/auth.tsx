import { Alert } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import axios from "axios";

const API_URL = Constants.expoConfig?.extra?.apiUrl || "http://10.0.2.2:8080";

// Configure Google Sign-In once at the top level of your app
GoogleSignin.configure({
  webClientId: '77998854438-h9gj1fsua39svfoh38gftrn2c7iro2r6.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
  scopes: ["profile", "email", "https://www.googleapis.com/auth/user.birthday.read", "openid"],
});

// Custom error types for more specific error handling
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class NetworkError extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
  }
}

// Constants for storage keys
const STORAGE_KEYS = {
  JWT_TOKEN: 'auth_jwt_token',
};

// Storage Functions
export const saveAuthData = async (token: string) => {
  try {
    const promises = [
      AsyncStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token)
    ];
    
    await Promise.all(promises);
    console.log('Authentication data saved successfully');
    return true;
  } catch (error: any) {
    console.error('Failed to save authentication data:', error.message);
    return false;
  }
};

export const getAuthData = async () => {
  try {
    const [token] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.JWT_TOKEN),
    ]);
    
    return {
      token,
    };
  } catch (error: any) {
    console.error('Failed to get authentication data:', error.message);
    return {
      token: null,
    };
  }
};

export const clearAuthData = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.JWT_TOKEN),
    ]);
    console.log('Authentication data cleared successfully');
    return true;
  } catch (error: any) {
    console.error('Failed to clear authentication data:', error.message);
    return false;
  }
};

// Google Authentication Helper Functions
const checkPlayServices = async () => {
  try {
    await GoogleSignin.hasPlayServices();
  } catch (error: any) {
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new AuthError('Google Play Services are not available on this device');
    }
    throw new AuthError(`Google Play Services error: ${error.message}`);
  }
};

const performGoogleSignIn = async () => {
  try {
    return await GoogleSignin.signIn();
  } catch (error: any) {
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        throw new AuthError('Google sign-in was cancelled');
      case statusCodes.IN_PROGRESS:
        throw new AuthError('Google sign-in is already in progress');
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        throw new AuthError('Google Play services are not available');
      default:
        throw new AuthError(`Google sign-in failed: ${error.message}`);
    }
  }
};

// Apple Authentication Helper Functions
const performAppleSignIn = async () => {
  try {
    return await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      throw new AuthError('Apple authentication was canceled');
    } else if (error.code === 'ERR_INVALID_RESPONSE') {
      throw new AuthError('Invalid response from Apple authentication');
    }
    throw new AuthError(`Apple authentication failed: ${error.message || 'Unknown error'}`);
  }
};

// Generic Network Functions
const sendApiRequest = async (url: string, payload: any) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new NetworkError(
        errorData?.message || `Server responded with status: ${response.status}`,
        response.status
      );
    }
    
    return response;
  } catch (error: any) {
    if (error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError(`Network request failed: ${error.message}`);
  }
};

const parseAndSaveAuthResponse = async (response: Response, authType: string) => {
  try {
    const data = await response.json();
    console.log(`Response from backend (${authType}):`, data);
    
    if (data.data) {
      await saveAuthData(data.data.tokenValue);
      console.log(`${authType} authentication data saved`);
    } else {
      console.warn('Token or userId missing in response');
    }
    
    Alert.alert(data.message || `${authType} authentication successful`);
    return data;
  } catch (error: any) {
    throw new NetworkError(`Failed to parse server response: ${error.message}`);
  }
};

// Handle Errors
const handleAuthError = (error: any) => {
  if (error instanceof AuthError || error instanceof NetworkError) {
    console.error(`${error.name}:`, error.message);
    Alert.alert('Authentication Error', error.message);
  } else {
    console.error("Unexpected error:", error.message, error.stack);
    Alert.alert('Authentication Error', 'An unexpected error occurred');
  }
  throw error;
};

// Main Authentication Functions
export const onGoogleAuth = async () => {
  try {
    await checkPlayServices();
    
    const userInfo = await performGoogleSignIn();
    
    const idToken = userInfo.data?.idToken;
    const serverAuthCode = userInfo.data?.serverAuthCode;
    
    if (!idToken) {
      throw new AuthError('No ID token received from Google');
    }
    
    console.log('Google authentication successful');
    
    const response = await sendApiRequest(
      "http://10.0.2.2:8080/api/auth/google", 
      { idToken, serverAuthCode }
    );
    
    return await parseAndSaveAuthResponse(response, 'Google');
  } catch (error: any) {
    return handleAuthError(error);
  }
};

export const onAppleIDAuth = async () => {
  try {
    const credential = await performAppleSignIn();
    
    if (!credential.identityToken) {
      throw new AuthError('No identity token received from Apple');
    }
    
    console.log('Apple authentication successful');
    
    const response = await sendApiRequest(
      "http://10.0.2.2:8080/api/auth/apple",
      {
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
      }
    );
    
    const data = await parseAndSaveAuthResponse(response, 'Apple');
    return { credential, serverData: data };
  } catch (error: any) {
    return handleAuthError(error);
  }
};

// Utility to validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Email/Password Login Function
export const loginWithEmail = async (email: string, password: string) => {
  try {
    // Using URL parameters with axios
    const response = await axios.post(
      `${API_URL}/api/auth/login-email?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    );
    
    // Save token to secure storage or context
    const { tokenValue } = response.data.data;

    saveAuthData(tokenValue);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || "Login failed. Please try again.";
      Alert.alert("Login Error", errorMsg);
    } else {
      Alert.alert("Login Error", "An unexpected error occurred. Please try again.");
    }
    throw error;
  }
};

export const registerEmailPassword = async (email: string, password: string, name: string, birthdate: string) => {
  try {
    const response = await sendApiRequest(
      `${API_URL}/api/auth/register`,
      {
        email,
        password,
        name,
        birthdate,
      }
    );
    
    const data = await parseAndSaveAuthResponse(response, 'Email');
    console.log('Registration successful');
    return data;
  } catch (error: any) {
    if (error instanceof NetworkError) {
      Alert.alert('Registration Error', error.message);
    } else {
      Alert.alert('Registration Error', 'An unexpected error occurred during registration');
      console.error('Registration error:', error);
    }
    throw error;
  }
};