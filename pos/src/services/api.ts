import { getToken, removeToken } from '../utils/tokenStorage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.belajarastrojs.workers.dev';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

/**
 * Centralized fetch wrapper for POS API calls.
 * Automatically injects Bearer token and Content-Type header.
 * Handles 401 Unauthorized by clearing local session.
 */
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Normalize URL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL.replace(/\/+$/, '')}${cleanEndpoint}`;

  // Headers setup
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Bearer token if present
  const token = await getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new Error(netErr.message || 'Gagal terhubung ke server backend');
  }

  // If 401 Unauthorized, automatically clear token
  if (response.status === 401) {
    await removeToken();
  }

  // Parse JSON response
  let data: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    const text = await response.text();
    data = { message: text };
  }

  if (!response.ok) {
    const errorMessage = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}
