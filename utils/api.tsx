import { getAuthData, clearAuthData, updateAuthData } from './auth';
import { router } from 'expo-router';

export type ApiResponse<T = any> = {
  url: string | PromiseLike<string | null> | null;
  success: boolean;
  message: string | null;
  data: T;
};

/**
 * Makes an authenticated API request with the JWT token in the Authorization header
 * @param url The URL to fetch
 * @param options Optional fetch options
 * @param retrying Flag to prevent infinite refresh loops
 * @returns Promise with the response
 */
export const authenticatedFetch = async <T = any>(
  url: string, 
  options: RequestInit = {},
  retrying = false // Flag to prevent infinite refresh loops
): Promise<ApiResponse<T>> => {
  try {
    // Get the auth token from storage
    const { token, refreshToken } = await getAuthData();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    // Merge the Authorization header with existing headers
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Log the request details
    console.log('Making request to:', url, 'with options:', options);

    // Make the request with the auth header
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Check specifically for 401 Unauthorized response
    if (response.status === 401 && !retrying && refreshToken) {
      console.log('Token expired, attempting to refresh...');
      try {
        // Replace with your actual refresh endpoint
        const refreshResponse = await fetch('https://safetypin.ppl.cs.ui.ac.id/refresh-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        
        const refreshData = await refreshResponse.json();

        console.log('Refresh response:', refreshData);
        
        if (!refreshResponse.ok) {
          throw new Error('Token refresh failed');
        }
        
        // Update stored tokens with new values
        await updateAuthData({
          token: refreshData.accessToken,
          refreshToken: refreshData.refreshToken || refreshToken,
          // Include any other auth data that needs to be preserved
        });
        
        // Retry the original request with the new token
        return authenticatedFetch(url, options, true);
      } catch (refreshError) {
        console.log('Token refresh failed, redirecting to login');
        // If refresh fails, clear auth and redirect to login
        await clearAuthData();
        router.replace('/');
        throw new Error('Session expired. Please login again.');
      }
    } else if (response.status === 401) {
      // If we already tried refreshing or no refresh token is available
      console.log('Received 401 Unauthorized response, clearing auth data and redirecting to login');
      await clearAuthData();
      router.replace('/');
      throw new Error('Session expired or invalid. Please login again.');
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    console.log('API response:', data);

    // Handle other non-successful responses
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    
    return data;
  } catch (error: any) {
    console.error('API request failed:', error.message);
    throw error;
  }
};

/**
 * Makes a POST request with authentication
 */
export const authenticatedPost = async <T = any>(
  url: string,
  body: any,
  options: Omit<RequestInit, 'body' | 'method'> = {}
): Promise<ApiResponse<T>> => {
  return authenticatedFetch<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/**
 * Makes a GET request with authentication
 */
export const authenticatedGet = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  return authenticatedFetch<T>(url, {
    ...options,
    method: 'GET',
  });
};

/**
 * Makes a PUT request with authentication
 */
export const authenticatedPut = async <T = any>(
  url: string,
  body: any,
  options: Omit<RequestInit, 'body' | 'method'> = {}
): Promise<ApiResponse<T>> => {
  return authenticatedFetch<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

/**
 * Makes a DELETE request with authentication
 */
export const authenticatedDelete = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  return authenticatedFetch<T>(url, {
    ...options,
    method: 'DELETE',
  });
};