import { getAuthData, clearAuthData, updateAuthData } from './auth';
import { router } from 'expo-router';

// Add this at the top of your file
let refreshPromise: Promise<boolean> | null = null;

export type ApiResponse<T = any> = {
  number: number;
  last: boolean;
  content: never[];
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
      
      // If there's already a refresh in progress, wait for it instead of starting a new one
      if (refreshPromise) {
        console.log('Another refresh is in progress, waiting for it to complete...');
        const refreshSucceeded = await refreshPromise;
        
        if (refreshSucceeded) {
          // If refresh succeeded, retry with new token
          return authenticatedFetch(url, options, true);
        } else {
          // If refresh failed, redirect to login
          console.log("Token refresh failed, clearing auth data and redirecting to login");
          await clearAuthData();
          
          throw new Error('Session expired. Please login again.');
        }
      }
      
      // Create a new refresh promise
      refreshPromise = (async () => {
        try {
          const refreshResponse = await fetch(`https://safetypin.ppl.cs.ui.ac.id/api/auth/refresh-token?token=${encodeURIComponent(refreshToken)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          
          const refreshData = await refreshResponse.json();

          console.log('Refresh response:', refreshData);
          
          if (!refreshResponse.ok || !refreshData.success) {
            throw new Error('Token refresh failed');
          }
          
          // Update stored tokens with new values
          await updateAuthData({
            token: refreshData.data.accessToken,
            refreshToken: refreshData.data.refreshToken ?? refreshToken,
          });
          
          console.log('Authentication data updated successfully');
          return true;
        } catch (error: any) {
          console.error('Error refreshing token:', error.message);
          return false;
        } finally {
          // Clear the promise when done
          refreshPromise = null;
        }
      })();
      
      // Wait for the refresh to complete
      const refreshSucceeded = await refreshPromise;
      
      if (refreshSucceeded) {
        // If refresh succeeded, retry with new token
        return authenticatedFetch(url, options, true);
      } else {
        // If refresh failed, throw error
        throw new Error('Session expired. Please login again.');
      }
    } else if (response.status === 401) {
      // If we already tried refreshing or no refresh token is available
      console.log('Received 401 Unauthorized response, clearing auth data and redirecting to login');
      await clearAuthData();
      router.replace('/');
      throw new Error('Session expired or invalid. Please login again.');
    }
    
    // Check if response is empty (204 No Content or empty body)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {
        success: true,
        data: null as T,
        message: null,
        content: [] as never[],
        last: true,
        number: 0,
        url: null
      };
    }

    // Then parse JSON for responses with content
    const data = await response.json();
    
    console.log('API response:', data);

    // Handle other non-successful responses
    if (!response.ok) {
      throw new Error(data.message ?? `Request failed with status ${response.status}`);
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