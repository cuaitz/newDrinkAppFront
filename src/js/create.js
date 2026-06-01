import { apiRequest } from './api.js';
import { CONFIG } from './config.js';
import { clearSession, isAuthenticated } from './storage.js';
import { collectDrinkPayload, mountIngredientFields } from './forms.js';
import { setMessage } from './ui.js';

const form = document.querySelector('#drink-form');
const message = document.querySelector('#drink-form-message');
const ingredientFields = document.querySelector('#ingredient-fields');
const logoutButton = document.querySelector('#logout-button');

if (!isAuthenticated()) {
  window.location.replace(CONFIG.ROUTES.login);
}

logoutButton?.addEventListener('click', () => {
  clearSession();
  window.location.replace(CONFIG.ROUTES.login);
});

mountIngredientFields(ingredientFields, 'create');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage(message, 'Salvando bebida...');

  try {
    const payload = collectDrinkPayload(form);
    const drink = await apiRequest('api/drinks', {
      method: 'POST',
      body: payload
    });

    setMessage(message, 'Bebida criada. Redirecionando...', 'success');
    window.location.replace(`${CONFIG.ROUTES.drink}?id=${drink._id}`);
  } catch (error) {
    const errorText = String(error.message).toLowerCase();
    if (errorText.includes('token') || errorText.includes('authorization') || errorText.includes('unauthorized')) {
      clearSession();
      window.location.replace(CONFIG.ROUTES.login);
      return;
    }

    setMessage(message, error.message, 'error');
  }
});