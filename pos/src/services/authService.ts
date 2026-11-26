import { apiFetch } from './api';
import { saveToken, removeToken, getToken } from '../utils/tokenStorage';

export interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export interface MeResponse {
  success: boolean;
  message?: string;
  user: User;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

/**
 * Authenticate user with email and password.
 * On success, saves token in storage and returns User.
 */
export async function login(email: string, password: string): Promise<User> {
  const res = await apiFetch<LoginResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (res.token) {
    await saveToken(res.token);
  }

  return res.user;
}

/**
 * Validate active session with backend (/api/me).
 * Returns User if token is valid, or null if unauthenticated/expired.
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = await getToken();
  if (!token) {
    return null;
  }

  try {
    const res = await apiFetch<MeResponse>('/api/me', {
      method: 'GET',
    });
    return res.user || null;
  } catch (err) {
    // If token invalid, apiFetch automatically removes token on 401
    return null;
  }
}

/**
 * Invalidate session on server and clear local token.
 */
export async function logout(): Promise<void> {
  try {
    await apiFetch<LogoutResponse>('/api/logout', {
      method: 'POST',
    });
  } catch (err) {
    console.warn('Logout API error:', err);
  } finally {
    await removeToken();
  }
}
