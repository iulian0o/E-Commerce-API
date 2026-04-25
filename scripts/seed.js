require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const neo4j = require("neo4j-driver");
const Redis = require("ioredis");

async function seed() {
  // --- MongoDB ---
  const mongo = new MongoClient(process.env.MONGO_URI);
  await mongo.connect();
  const db = mongo.db("ecommerce");

  await db.collection("products").deleteMany({});
  await db.collection("orders").deleteMany({});
  await db.collection("users").deleteMany({});

  const p1 = new ObjectId(), p2 = new ObjectId(), p3 = new ObjectId();
  const u1 = "user1", u2 = "user2", u3 = "user3";

  await db.collection("products").insertMany([
    { _id: p1, name: "Wireless Headphones", category: "Electronics", price: 79.99, stock: 50 },
    { _id: p2, name: "Mechanical Keyboard", category: "Electronics", price: 129.99, stock: 30 },
    { _id: p3, name: "Laptop Stand", category: "Accessories", price: 39.99, stock: 100 }
  ]);

  await db.collection("orders").insertMany([
    { userId: u1, items: [{ productId: p1, quantity: 1, price: 79.99 }], total: 79.99, status: "confirmed", createdAt: new Date() },
    { userId: u2, items: [{ productId: p1, quantity: 1, price: 79.99 }, { productId: p2, quantity: 1, price: 129.99 }], total: 209.98, status: "confirmed", createdAt: new Date() },
    { userId: u3, items: [{ productId: p2, quantity: 1, price: 129.99 }, { productId: p3, quantity: 2, price: 39.99 }], total: 209.97, status: "confirmed", createdAt: new Date() }
  ]);

  console.log("✅ MongoDB seeded");
  await mongo.close();

  // --- Neo4j ---
  const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));
  const session = driver.session();

  await session.run("MATCH (n) DETACH DELETE n"); // clear graph

  const graphData = [
    { userId: u1, productId: p1.toString() },
    { userId: u2, productId: p1.toString() },
    { userId: u2, productId: p2.toString() },
    { userId: u3, productId: p2.toString() },
    { userId: u3, productId: p3.toString() }
  ];

  for (const { userId, productId } of graphData) {
    await session.run(
      `MERGE (u:User {userId: $userId})
       MERGE (p:Product {productId: $productId})
       MERGE (u)-[:BOUGHT]->(p)`,
      { userId, productId }
    );
  }

  console.log("✅ Neo4j seeded");
  await session.close();
  await driver.close();

  // --- Redis ---
  const redis = new Redis(process.env.REDIS_URL);
  await redis.del("cart:user1");
  await redis.hset("cart:user1", p3.toString(), JSON.stringify({ quantity: 1, price: 39.99 }));
  await redis.expire("cart:user1", 604800);
  console.log("✅ Redis seeded");
  await redis.quit();
}

seed().catch(console.error);