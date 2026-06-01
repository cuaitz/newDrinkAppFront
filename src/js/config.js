const fallbackApiBaseUrl =
  typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
    ? window.location.origin
    : 'http://localhost:3000';

const appConfig = window._APP_CONFIG_ || {};

export const CONFIG = {
  APP_NAME: appConfig.APP_NAME || 'DrinkApp',
  API_BASE_URL: String(appConfig.API_BASE_URL || fallbackApiBaseUrl).replace(/\/$/, ''),
  STORAGE_KEYS: {
    token: 'drinkHub.token',
    userId: 'drinkHub.userId'
  },
  ROUTES: {
    login: 'login.html',
    register: 'register.html',
    dashboard: 'dashboard.html',
    profile: 'profile.html',
    create: 'create.html',
    drink: 'drink.html'
  }
};