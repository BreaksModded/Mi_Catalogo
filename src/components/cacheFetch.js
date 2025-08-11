// Utilidad sencilla para cachear peticiones fetch en memoria (por sesión)
// Uso: cacheFetch(url, options, ttlMs)
const cache = {};

export default async function cacheFetch(url, options = {}, ttlMs = 60000) {
  const now = Date.now();
  if (cache[url] && (now - cache[url].ts < ttlMs)) {
    return cache[url].response;
  }
  
  const response = await fetch(url, options);
  
  // Si es 401 (no autenticado), retornar array vacío sin error
  if (response.status === 401) {
    return [];
  }
  
  // Para otros errores, arrojar error
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  cache[url] = { response: data, ts: now };
  return data;
}
