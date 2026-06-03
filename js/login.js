import { apiRequest } from './api.js';
import { CONFIG } from './config.js';
import { saveSession, isAuthenticated } from './storage.js';
import { setMessage } from './ui.js';

const form = document.querySelector('#login-form');
const message = document.querySelector('#login-message');

if (isAuthenticated()) {
  window.location.replace(CONFIG.ROUTES.dashboard);
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage(message, 'Entrando...');

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await apiRequest('api/users/login', {
      method: 'POST',
      auth: false,
      body: payload
    });

    saveSession({ token: response.token, id: response.id });
    setMessage(message, 'Login bem-sucedido. Redirecionando...', 'success');
    window.location.replace(CONFIG.ROUTES.dashboard);
  } catch (error) {
    setMessage(message, error.message, 'error');
  }
});