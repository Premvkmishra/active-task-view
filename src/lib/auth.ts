import jwt_decode from "jwt-decode";

export function getUserRole(): 'admin' | 'contributor' | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const decoded: any = jwt_decode(token);
    return decoded.is_staff ? 'admin' : 'contributor';
  } catch {
    return null;
  }
} 