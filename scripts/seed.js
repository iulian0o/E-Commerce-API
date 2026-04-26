require("dotenv").config();
const neo4j = require("neo4j-driver");
const Redis = require("ioredis");

async function seed() {

  // Neo4j
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  );
  const session = driver.session();

  // Mongo
  const P1 = "PASTE_P1_ID_HERE"   // Wireless Headphones_id
  const P2 = "PASTE_P2_ID_HERE"   // Mechanical Keyboard_id
  const P3 = "PASTE_P3_ID_HERE"   // Laptop Stand_id

  await session.run("MATCH (n) DETACH DELETE n");

  const purchases = [
    { userId: "user1", productId: P1 },
    { userId: "user2", productId: P1 },
    { userId: "user2", productId: P2 },
    { userId: "user3", productId: P2 },
    { userId: "user3", productId: P3 }
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
    P3,
    JSON.stringify({ quantity: 1, price: 39.99 })
  );
  await redis.expire("cart:user1", 604800);

  console.log("Redis seeded");
  await redis.quit();
}

seed().catch(console.error);