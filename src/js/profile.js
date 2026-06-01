import { apiRequest } from './api.js';
import { CONFIG } from './config.js';
import { clearSession, getUserId, isAuthenticated } from './storage.js';
import { emptyState, escapeHtml, renderDrinkCard, setMessage } from './ui.js';

const summary = document.querySelector('#profile-summary');
const drinksGrid = document.querySelector('#profile-drinks-grid');
const drinksCount = document.querySelector('#profile-drinks-count');
const logoutButton = document.querySelector('#logout-button');

if (!isAuthenticated()) {
  window.location.replace(CONFIG.ROUTES.login);
}

const currentUserId = getUserId();

logoutButton?.addEventListener('click', () => {
  clearSession();
  window.location.replace(CONFIG.ROUTES.login);
});

const loadProfile = async () => {
  try {
    const [user, drinks] = await Promise.all([
      apiRequest('api/users/me'),
      apiRequest('api/drinks/user')
    ]);

    if (summary) {
      summary.innerHTML = `
        <div class="badge">Visão geral do perfil</div>
        <div class="grid" style="margin-top: 1rem;">
          <div class="card" style="padding: 1rem; background: rgba(255,255,255,0.03);">
            <p class="muted">Nome</p>
            <h3>${escapeHtml(user?.name || '')}</h3>
          </div>
          <div class="card" style="padding: 1rem; background: rgba(255,255,255,0.03);">
            <p class="muted">Email</p>
            <h3>${escapeHtml(user?.email || '')}</h3>
          </div>
          <div class="card" style="padding: 1rem; background: rgba(255,255,255,0.03);">
            <p class="muted">Bebidas criadas</p>
            <h3>${drinks.length}</h3>
          </div>
        </div>
      `;
    }

    if (drinksGrid) {
      drinksGrid.innerHTML = drinks.length
        ? drinks.map((drink) => renderDrinkCard(drink, { currentUserId, allowEdit: true })).join('')
        : emptyState('Você ainda não criou nenhuma bebida.');
    }

    if (drinksCount) drinksCount.textContent = `${drinks.length} bebidas`;
  } catch (error) {
    const errorText = String(error.message).toLowerCase();
    if (errorText.includes('token') || errorText.includes('authorization') || errorText.includes('unauthorized')) {
      clearSession();
      window.location.replace(CONFIG.ROUTES.login);
      return;
    }

    if (summary) setMessage(summary, error.message, 'error');
  }
};

loadProfile();