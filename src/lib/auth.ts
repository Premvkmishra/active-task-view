import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL || '';

export function getUserRole(): 'admin' | 'contributor' | null {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.log('No access token found');
    return null;
  }
  
  try {
    const decoded: any = jwtDecode(token);
    console.log('JWT Token decoded:', decoded);
    console.log('is_staff field:', decoded.is_staff);
    return decoded.is_staff ? 'admin' : 'contributor';
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

export function getCurrentUser(): { id: number; username: string } | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  
  try {
    const decoded: any = jwtDecode(token);
    console.log('Current user from JWT:', decoded);
    return {
      id: decoded.user_id || decoded.id,
      username: decoded.username
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function isTokenValid(): boolean {
  const token = localStorage.getItem('access_token');
  if (!token) return false;
  
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token has expired
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('Token has expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token is invalid:', error);
    return false;
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    console.log('No refresh token found');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      console.log('Access token refreshed successfully');
      return true;
    } else {
      console.log('Failed to refresh token');
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}

export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('No access token available');
  }

  // Add authorization header
  const headers = {
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If token is invalid, try to refresh it
  if (response.status === 401) {
    console.log('Token expired, attempting to refresh...');
    const refreshSuccess = await refreshAccessToken();
    
    if (refreshSuccess) {
      // Retry the request with the new token
      const newToken = localStorage.getItem('access_token');
      const newHeaders = {
        'Authorization': `Bearer ${newToken}`,
        ...options.headers,
      };
      
      response = await fetch(url, {
        ...options,
        headers: newHeaders,
      });
    } else {
      // If refresh failed, redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  }

  return response;
} 