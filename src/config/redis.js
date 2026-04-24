const Redis = require("ioredis");

let client;

function connectRedis() {
  client = new Redis(process.env.REDIS_URL);
  client.on("connect", () => console.log("Redis connected"));
  client.on("error", (err) => console.error("Redis error:", err));
}

function getRedis() {
  if (!client) throw new Error("Redis not connected");
  return client;
}

module.exports = { connectRedis, getRedis };