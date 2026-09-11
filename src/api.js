export const API_BASE = import.meta.env.PROD
  ? 'https://junda-united-fc.onrender.com/api'
  : 'http://localhost:5000/api';

export async function fetchJson(path, signal) {
  const response = await fetch(`${API_BASE}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
