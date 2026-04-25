require("dotenv").config();
const neo4j = require("neo4j-driver");
const Redis = require("ioredis");
const { MongoClient, ObjectId } = require("mongodb");

async function seed() {

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

}

seed().catch(console.error);