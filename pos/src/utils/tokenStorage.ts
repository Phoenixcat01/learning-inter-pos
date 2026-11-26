import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'pos_auth_token';

/**
 * Retrieve auth token from storage.
 * Uses window.localStorage on Web, and AsyncStorage on Native.
 */
export async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(TOKEN_KEY);
      }
      return null;
    }
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (err) {
    console.error('Error reading auth token:', err);
    return null;
  }
}

/**
 * Save auth token to storage.
 */
export async function saveToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(TOKEN_KEY, token);
      }
      return;
    }
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.error('Error saving auth token:', err);
  }
}

/**
 * Remove auth token from storage.
 */
export async function removeToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(TOKEN_KEY);
      }
      return;
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('Error removing auth token:', err);
  }
}
