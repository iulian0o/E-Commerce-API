const { MongoClient } = require("mongodb");

let db;

async function connectMongo() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db("ecommerce");
  console.log("MongoDB connected");
}

function getDb() {
  if (!db) throw new Error("MongoDB not connected");
  return db;
}

module.exports = { connectMongo, getDb };