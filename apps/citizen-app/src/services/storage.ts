import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'civicpulse_access_token';
const REFRESH_KEY = 'civicpulse_refresh_token';
const USER_KEY = 'civicpulse_user_profile';

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
  getAccessToken: () => getItem(ACCESS_KEY),
  getRefreshToken: () => getItem(REFRESH_KEY),
  getUserJson: () => getItem(USER_KEY),
  setTokens: async (accessToken: string, refreshToken: string) => {
    await Promise.all([setItem(ACCESS_KEY, accessToken), setItem(REFRESH_KEY, refreshToken)]);
  },
  setUserJson: (userJson: string) => setItem(USER_KEY, userJson),
  clearAll: async () => {
    await Promise.all([deleteItem(ACCESS_KEY), deleteItem(REFRESH_KEY), deleteItem(USER_KEY)]);
  },
};
