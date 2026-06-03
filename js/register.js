import { apiRequest } from './api.js';
import { CONFIG } from './config.js';
import { saveSession, isAuthenticated } from './storage.js';
import { setMessage } from './ui.js';

const form = document.querySelector('#register-form');
const message = document.querySelector('#register-message');

if (isAuthenticated()) {
  window.location.replace(CONFIG.ROUTES.dashboard);
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage(message, 'Criando conta...');

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const response = await apiRequest('api/users/register', {
      method: 'POST',
      auth: false,
      body: payload
    });

    saveSession({ token: response.token, id: response.id });
    setMessage(message, 'Conta criada. Redirecionando...', 'success');
    window.location.replace(CONFIG.ROUTES.dashboard);
  } catch (error) {
    setMessage(message, error.message, 'error');
  }
});