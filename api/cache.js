// api/cache.js
const cacheMap = new Map();

export function getCachedResponse(key) {
  const entry = cacheMap.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > 60000) { // 60초 유효
    cacheMap.delete(key);
    return null;
  }

  return entry.value;
}

export function setCachedResponse(key, value) {
  cacheMap.set(key, { value, timestamp: Date.now() });
}
