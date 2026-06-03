import { apiRequest } from './api.js';
import { CONFIG } from './config.js';
import { clearSession, getUserId, isAuthenticated } from './storage.js';
import { emptyState, escapeHtml, renderDrinkCard, setMessage } from './ui.js';

const summary = document.querySelector('#dashboard-summary');
const allDrinksGrid = document.querySelector('#all-drinks-grid');
const myDrinksGrid = document.querySelector('#my-drinks-grid');
const allDrinksCount = document.querySelector('#all-drinks-count');
const myDrinksCount = document.querySelector('#my-drinks-count');
const logoutButton = document.querySelector('#logout-button');

if (!isAuthenticated()) {
  window.location.replace(CONFIG.ROUTES.login);
}

const currentUserId = getUserId();

logoutButton?.addEventListener('click', () => {
  clearSession();
  window.location.replace(CONFIG.ROUTES.login);
});

  const renderSummary = (user, drinks) => {
    if (!summary) return;
    summary.innerHTML = `
    <div class="badge">Logado como ${escapeHtml(user?.name || user?.email || 'Usuário')}</div>
    <div class="grid" style="margin-top: 1rem;">
      <div class="card" style="padding: 1rem; background: rgba(255,255,255,0.03);">
        <p class="muted">Perfil</p>
        <h3>${escapeHtml(user?.name || 'Desconhecido')}</h3>
        <p class="muted">${escapeHtml(user?.email || '')}</p>
      </div>
      <div class="card" style="padding: 1rem; background: rgba(255,255,255,0.03);">
        <p class="muted">Suas bebidas</p>
        <h3>${drinks.length}</h3>
        <p class="muted">Receitas vinculadas à sua conta</p>
      </div>
    </div>
  `;
};

const renderCollection = (container, drinks, emptyMessage, allowEdit = false) => {
  if (!container) return;
  container.innerHTML = drinks.length
    ? drinks.map((drink) => renderDrinkCard(drink, { currentUserId, allowEdit })).join('')
    : emptyState(emptyMessage);
};

const loadDashboard = async () => {
  try {
    const [user, allDrinks, ownDrinks] = await Promise.all([
      apiRequest('api/users/me'),
      apiRequest('api/drinks'),
      apiRequest('api/drinks/user')
    ]);

    renderSummary(user, ownDrinks);
    renderCollection(allDrinksGrid, allDrinks, 'Nenhuma bebida disponível ainda. Crie a primeira.', true);
    renderCollection(myDrinksGrid, ownDrinks, 'Você ainda não criou nenhuma bebida.', true);

    if (allDrinksCount) allDrinksCount.textContent = `${allDrinks.length} bebidas`;
    if (myDrinksCount) myDrinksCount.textContent = `${ownDrinks.length} bebidas`;
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

loadDashboard();