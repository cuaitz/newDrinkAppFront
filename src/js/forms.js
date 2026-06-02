const fieldIndexes = Array.from({ length: 15 }, (_, index) => index + 1);

const ingredientMarkup = (prefix = 'drink') =>
  fieldIndexes
    .map(
      (index) => `
        <div class="ingredient-grid">
          <label class="input-stack">
            <span>Ingrediente ${index}</span>
            <input class="field-input" type="text" name="strIngredient${index}" data-field="strIngredient${index}" data-prefix="${prefix}">
          </label>
          <label class="input-stack">
            <span>Medida ${index}</span>
            <input class="field-input" type="text" name="strMeasure${index}" data-field="strMeasure${index}" data-prefix="${prefix}">
          </label>
        </div>`
    )
    .join('');

export const mountIngredientFields = (container, prefix = 'drink') => {
  if (!container) return;
  container.innerHTML = ingredientMarkup(prefix);
};

export const collectDrinkPayload = async (form) => {
  const formData = new FormData(form);
  const payload = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.name) {
      payload[key] = await fileToBase64(value);
    } else {
      const normalized =
        typeof value === 'string' ? value.trim() : value;

      payload[key] = normalized ? normalized : null;
    }
  }

  return payload;
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });

export const fillDrinkForm = (form, drink = {}) => {
  if (!form) return;

  Array.from(form.elements).forEach((element) => {
    if (!element.name) return;

    if (element.type === 'file') return;
    
    element.value = drink[element.name] ?? '';
  });
};