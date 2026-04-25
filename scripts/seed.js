require("dotenv").config();
const Redis = require("ioredis");
async function seed() {
  const redis = new Redis(process.env.REDIS_URL);
  await redis.del("cart:user1");
  await redis.hset("cart:user1",
    "PASTE_P3_ID_HERE",
    JSON.stringify({ quantity: 1, price: 39.99 })
  );
  await redis.expire("cart:user1", 604800);
  console.log(" Redis seeded");
  await redis.quit();
}

seed().catch(console.error);