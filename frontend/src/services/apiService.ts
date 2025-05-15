import { auth } from './firebase'; // Assuming firebase service is used for getting auth token

// Get the API base URL from environment variables, with a fallback for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface ApiOptions extends RequestInit {
  // Add any custom options here if needed
}

/**
 * Helper function to get the Firebase auth token
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (user) {
      console.log("Getting auth token for user:", user.uid);
      const token = await user.getIdToken(true); // Force refresh to get latest claims
      return token;
    }
    console.warn("No authenticated user found when trying to get auth token");
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Generic API request function
 * @param endpoint The API endpoint (e.g., '/orders', '/users/profile')
 * @param method The HTTP method (GET, POST, PUT, DELETE)
 * @param options Fetch options (headers, body, etc.)
 * @returns Promise resolving with the JSON response
 */
const apiRequest = async <T>(
  endpoint: string,
  method: string,
  options: ApiOptions = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}), // Cast options.headers to Record<string, string>
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    ...options,
    // Add a timeout signal to avoid hanging requests
    signal: AbortSignal.timeout(15000), // 15 seconds timeout
  };

  // If the method is GET or HEAD, remove the body
  if (['GET', 'HEAD'].includes(method.toUpperCase())) {
    delete config.body;
  }

  try {
    const response = await fetch(url, config);
    
    console.log(`API ${method} ${endpoint} response status:`, response.status);

    // Handle non-OK responses
    if (!response.ok) {
      let errorData = null;
      try {
        // Attempt to parse error response body
        errorData = await response.json();
        console.error(`API Error Response (${response.status}):`, errorData);
      } catch (parseError) {
        // If parsing fails, use the status text
        console.error(`API Error (${response.status}) with unparseable response:`, response.statusText);
        errorData = { message: response.statusText };
      }
      
      const errorMessage = errorData.message || `API request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      
      // Attach status and error data to the error object
      (error as any).status = response.status;
      (error as any).data = errorData;
      
      // Log authentication related errors more verbosely
      if (response.status === 401) {
        console.error("Authentication error - check if:", 
          "1. User is logged in", 
          "2. Token is valid and not expired",
          "3. Token is properly sent in the request"
        );
      } else if (response.status === 403) {
        console.error("Authorization error - check if user has required role/permissions");
      }
      
      throw error;
    }

    // Handle successful responses with no content (e.g., 204 No Content)
    if (response.status === 204) {
        return null as T; // Return null for no content
    }

    // Parse and return JSON response
    return await response.json() as T;

  } catch (error) {
    console.error(`API request error [${method} ${url}]:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
};

// Export specific HTTP method functions
export const apiGet = <T>(endpoint: string, options?: ApiOptions): Promise<T> =>
  apiRequest<T>(endpoint, 'GET', options);

export const apiPost = <T>(endpoint: string, body: any, options?: ApiOptions): Promise<T> =>
  apiRequest<T>(endpoint, 'POST', { ...options, body: JSON.stringify(body) });

export const apiPut = <T>(endpoint: string, body: any, options?: ApiOptions): Promise<T> =>
  apiRequest<T>(endpoint, 'PUT', { ...options, body: JSON.stringify(body) });

export const apiDelete = <T>(endpoint: string, options?: ApiOptions): Promise<T> =>
  apiRequest<T>(endpoint, 'DELETE', options);

export const apiPatch = <T>(endpoint: string, body: any, options?: ApiOptions): Promise<T> =>
  apiRequest<T>(endpoint, 'PATCH', { ...options, body: JSON.stringify(body) });

// Add other methods like PATCH if needed
