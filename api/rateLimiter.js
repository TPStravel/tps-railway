// api/rateLimiter.js
const rateLimitMap = new Map();

export default function simpleRateLimit(ip, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, timestamp: now };

  if (now - entry.timestamp > windowMs) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (entry.count >= limit) return true;

  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return false;
}
