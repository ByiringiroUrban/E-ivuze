import axios from 'axios';

/**
 * Build auth headers for /api/search/global (authAny accepts token, dToken, aToken, hToken, pToken, lToken).
 */
export function getSearchAuthHeaders(tokens = {}) {
  const { token, aToken, dToken, hToken, pToken, lToken } = tokens;
  if (aToken) return { aToken };
  if (dToken) return { dToken };
  if (hToken) return { hToken };
  if (pToken) return { pToken };
  if (lToken) return { lToken };
  if (token) return { token };
  return {};
}

/**
 * GET /api/search/global?q=...
 */
export async function globalSearch(backendUrl, q, tokens) {
  const base = backendUrl || import.meta.env.VITE_BACKEND_URL || '';
  if (!q || String(q).trim().length < 2) {
    return { success: true, doctors: [], patients: [], records: [], appointments: [] };
  }
  const url = `${base.replace(/\/$/, '')}/api/search/global`;
  const headers = getSearchAuthHeaders(tokens);
  const { data } = await axios.get(url, {
    params: { q: String(q).trim() },
    headers
  });
  return data;
}
