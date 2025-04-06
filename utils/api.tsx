import { getAuthData } from './auth';

export type ApiResponse<T = any> = {
  success: boolean;
  message: string | null;
  data: T;
};

/**
 * Makes an authenticated API request with the JWT token in the Authorization header
 * @param url The URL to fetch
 * @param options Optional fetch options
 * @returns Promise with the response
 */
export const authenticatedFetch = async <T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    // Get the auth token from storage
    const { token } = await getAuthData();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    // Merge the Authorization header with existing headers
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Make the request with the auth header
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Parse the JSON response
    const data = await response.json();
    
    // Handle non-successful responses
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