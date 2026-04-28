const Redis = require("ioredis");

let client;

function connectRedis() {
  client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        console.error("Redis failed to connect after 3 retries — check your REDIS_URL and password");
        return null;
      }
      return Math.min(times * 500, 2000);
    }
  });

  client.on("connect", () => console.log("Redis connected"));
  client.on("error", (err) => console.error("Redis error:", err.message));
}

function getRedis() {
  if (!client) throw new Error("Redis not connected");
  return client;
}

module.exports = { connectRedis, getRedis };