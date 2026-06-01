import { CONFIG } from './config.js';

export const getToken = () => localStorage.getItem(CONFIG.STORAGE_KEYS.token);

export const getUserId = () => localStorage.getItem(CONFIG.STORAGE_KEYS.userId);

export const saveSession = ({ token, id }) => {
  if (token) localStorage.setItem(CONFIG.STORAGE_KEYS.token, token);
  if (id) localStorage.setItem(CONFIG.STORAGE_KEYS.userId, id);
};

export const clearSession = () => {
  localStorage.removeItem(CONFIG.STORAGE_KEYS.token);
  localStorage.removeItem(CONFIG.STORAGE_KEYS.userId);
};

export const isAuthenticated = () => Boolean(getToken());