const { getRedis } = require("../config/redis");

// Add item to cart (stored as a Hash)
async function addToCart(userId, productId, quantity, price) {
  const redis = getRedis();
  const key = `cart:${userId}`;
  await redis.hset(key, productId, JSON.stringify({ quantity, price }));
  await redis.expire(key, 60 * 60 * 24 * 7); // expire cart after 7 days
  return getCart(userId);
}

// Get full cart
async function getCart(userId) {
  const redis = getRedis();
  const raw = await redis.hgetall(`cart:${userId}`);
  if (!raw) return {};
  return Object.fromEntries(
    Object.entries(raw).map(([productId, val]) => [productId, JSON.parse(val)])
  );
}

// Remove entire cart (called after order is placed)
async function clearCart(userId) {
  const redis = getRedis();
  await redis.del(`cart:${userId}`);
}

// Rate limiting — max 30 requests per minute per IP
async function checkRateLimit(ip) {
  const redis = getRedis();
  const key = `rate:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60); // start 60s window on first hit
  return count <= 30;
}

module.exports = { addToCart, getCart, clearCart, checkRateLimit };