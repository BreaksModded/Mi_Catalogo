// Utilidad sencilla para cachear peticiones fetch en memoria (por sesión)
// Uso: cacheFetch(url, options, ttlMs)
const cache = {};

export default async function cacheFetch(url, options = {}, ttlMs = 60000) {
  const now = Date.now();
  if (cache[url] && (now - cache[url].ts < ttlMs)) {
    return cache[url].response;
  }
  const response = await fetch(url, options);
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  cache[url] = { response: data, ts: now };
  return data;
}
