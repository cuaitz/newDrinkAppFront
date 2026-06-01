import { CONFIG } from './config.js';

export const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

export const setMessage = (element, message, status = '') => {
  if (!element) return;
  element.textContent = message || '';
  element.dataset.status = status;
};

export const emptyState = (message) => `<div class="empty-state">${escapeHtml(message)}</div>`;

export const getDrinkImage = (drink) => drink?.strDrinkThumb || 'https://images.unsplash.com/photo-1514361892635-e2e4f2b3c3d6?auto=format&fit=crop&w=1200&q=80';

export const getIngredientPairs = (drink) => {
  const items = [];
  for (let index = 1; index <= 15; index += 1) {
    const ingredient = drink?.[`strIngredient${index}`];
    const measure = drink?.[`strMeasure${index}`];
    if (ingredient || measure) {
      items.push({ ingredient, measure });
    }
  }
  return items;
};

export const renderDrinkCard = (drink, { currentUserId, allowEdit = false } = {}) => {
  const isOwner = currentUserId && String(drink?.user_id || '') === String(currentUserId);
  const actions = [`<a class="btn btn-ghost" href="${CONFIG.ROUTES.drink}?id=${escapeHtml(drink?._id)}">Ver</a>`];

  if (allowEdit && isOwner) {
    actions.push(`<a class="btn btn-primary" href="${CONFIG.ROUTES.drink}?id=${escapeHtml(drink?._id)}">Editar</a>`);
  }

  return `
    <article class="drink-card">
      <div class="drink-card_image">
        <img src="${escapeHtml(getDrinkImage(drink))}" alt="${escapeHtml(drink?.strDrink || 'Imagem da bebida')}">
      </div>
      <div class="drink-card_body">
        <div>
          <h3>${escapeHtml(drink?.strDrink || 'Bebida sem título')}</h3>
          <p class="drink-card_meta">${escapeHtml(drink?.strCategory || 'Sem categoria')}</p>
        </div>
        <p>${escapeHtml(drink?.strInstructions || 'Nenhuma instrução fornecida.')}</p>
        <div class="drink-card_actions">${actions.join('')}</div>
      </div>
    </article>
  `;
};

export const renderIngredientsList = (drink) => {
  const items = getIngredientPairs(drink);

  if (!items.length) {
    return emptyState('Nenhum ingrediente foi fornecido para esta bebida.');
  }

  return `<ul class="detail_list">${items
    .map(
      ({ ingredient, measure }) => `
        <li>
          <span>${escapeHtml(ingredient || 'Ingrediente')}</span>
          <strong>${escapeHtml(measure || '—')}</strong>
        </li>`
    )
    .join('')}</ul>`;
};