import { isAuthenticated } from './storage.js';
import { CONFIG } from './config.js';

if (isAuthenticated()) {
  window.location.replace(CONFIG.ROUTES.dashboard);
}