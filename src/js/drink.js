import { apiRequest } from './api.js';
import { CONFIG } from './config.js';
import { clearSession, getUserId, isAuthenticated } from './storage.js';
import { collectDrinkPayload, fillDrinkForm, mountIngredientFields } from './forms.js';
import { escapeHtml, getDrinkImage, renderIngredientsList, setMessage } from './ui.js';

const title = document.querySelector('#drink-title');
const detail = document.querySelector('#drink-detail');
const editCard = document.querySelector('#drink-edit-card');
const editForm = document.querySelector('#drink-edit-form');
const editMessage = document.querySelector('#drink-edit-message');
const deleteButton = document.querySelector('#delete-drink-button');
const editIngredientFields = document.querySelector('#edit-ingredient-fields');
const logoutButton = document.querySelector('#logout-button');

if (!isAuthenticated()) {
  window.location.replace(CONFIG.ROUTES.login);
}

const currentUserId = getUserId();
const params = new URLSearchParams(window.location.search);
const drinkId = params.get('id');

logoutButton?.addEventListener('click', () => {
  clearSession();
  window.location.replace(CONFIG.ROUTES.login);
});

if (!drinkId) {
  if (detail) detail.innerHTML = '<div class="empty-state">ID da bebida não informado.</div>';
  if (editCard) editCard.hidden = true;
} else {
  mountIngredientFields(editIngredientFields, 'edit');
}

const renderDrink = (drink) => {
  if (title) title.textContent = drink?.strDrink || 'Detalhes da bebida';

  if (detail) {
    detail.innerHTML = `
      <div class="detail_hero">
        <div class="detail_image">
          <img src="${escapeHtml(getDrinkImage(drink))}" alt="${escapeHtml(drink?.strDrink || 'Imagem da bebida')}">
        </div>
        <div class="detail_content">
          <div>
            <div class="badge">${escapeHtml(drink?.strCategory || 'Sem categoria')}</div>
            <h2>${escapeHtml(drink?.strDrink || 'Bebida sem título')}</h2>
            <p class="muted">${String(drink?.user_id || '') === String(currentUserId) ? 'Propriedade: você' : 'Propriedade: outro usuário'}</p>
          </div>
          <div>
            <h3>Instruções</h3>
            <p>${escapeHtml(drink?.strInstructions || 'Nenhuma instrução fornecida.')}</p>
          </div>
        </div>
      </div>
      <div>
        <h3>Ingredientes</h3>
        ${renderIngredientsList(drink)}
      </div>
    `;
  }
};

const loadDrink = async () => {
  if (!drinkId) return;

  try {
    const drink = await apiRequest(`api/drinks/${drinkId}`);
    renderDrink(drink);

    const isOwner = String(drink?.user_id || '') === String(currentUserId);
    if (editCard) editCard.hidden = !isOwner;

    if (isOwner && editForm) {
      fillDrinkForm(editForm, drink);
      if (deleteButton) deleteButton.disabled = false;

      editForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setMessage(editMessage, 'Atualizando bebida...');

        try {
          const payload = collectDrinkPayload(editForm);
          await apiRequest(`api/drinks/${drinkId}`, {
            method: 'PUT',
            body: payload
          });

          setMessage(editMessage, 'Bebida atualizada com sucesso.', 'success');
          const updatedDrink = await apiRequest(`api/drinks/${drinkId}`);
          renderDrink(updatedDrink);
          fillDrinkForm(editForm, updatedDrink);
        } catch (error) {
          const errorText = String(error.message).toLowerCase();
          if (errorText.includes('token') || errorText.includes('authorization') || errorText.includes('unauthorized')) {
            clearSession();
            window.location.replace(CONFIG.ROUTES.login);
            return;
          }

          setMessage(editMessage, error.message, 'error');
        }
      }, { once: false });

      deleteButton?.addEventListener('click', async () => {
        const confirmed = window.confirm('Excluir esta bebida? Esta ação não pode ser desfeita.');
        if (!confirmed) return;

        try {
          await apiRequest(`api/drinks/${drinkId}`, {
            method: 'DELETE'
          });

          window.location.replace(CONFIG.ROUTES.dashboard);
        } catch (error) {
          const errorText = String(error.message).toLowerCase();
          if (errorText.includes('token') || errorText.includes('authorization') || errorText.includes('unauthorized')) {
            clearSession();
            window.location.replace(CONFIG.ROUTES.login);
            return;
          }

          setMessage(editMessage, error.message, 'error');
        }
      });
    }
  } catch (error) {
    if (detail) detail.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    if (editCard) editCard.hidden = true;
  }
};

loadDrink();