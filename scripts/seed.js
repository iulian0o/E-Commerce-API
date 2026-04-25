require("dotenv").config();
const neo4j = require("neo4j-driver");
const Redis = require("ioredis");
const { MongoClient, ObjectId } = require("mongodb");

async function seed() {
  // Neo4j
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  );
  const session = driver.session();
  await session.run("MATCH (n) DETACH DELETE n");

  // Mongo
  const purchases = [
    { userId: "user1", productId: "PASTE_P1_ID_HERE" },
    { userId: "user2", productId: "PASTE_P1_ID_HERE" },
    { userId: "user2", productId: "PASTE_P2_ID_HERE" },
    { userId: "user3", productId: "PASTE_P2_ID_HERE" },
    { userId: "user3", productId: "PASTE_P3_ID_HERE" }
  ];

  for (const { userId, productId } of purchases) {
    await session.run(
      `MERGE (u:User {userId: $userId})
       MERGE (p:Product {productId: $productId})
       MERGE (u)-[:BOUGHT]->(p)`,
      { userId, productId }
    );
  }
  console.log("Neo4j seeded");
  await session.close();
  await driver.close();

  // Redis

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