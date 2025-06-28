import { jwtDecode } from "jwt-decode";

export function getUserRole(): 'admin' | 'contributor' | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    return decoded.is_staff ? 'admin' : 'contributor';
  } catch {
    return null;
  }
} 