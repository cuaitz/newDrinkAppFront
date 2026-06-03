import { CONFIG } from './config.js';
import { getToken } from './storage.js';

const buildUrl = (path) => new URL(path.replace(/^\//, ''), `${CONFIG.API_BASE_URL.replace(/\/$/, '')}/`).toString();

export async function apiRequest(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const requestHeaders = { ...headers };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(payload?.message || payload || 'Falha na requisição');
  }

  return payload;
}