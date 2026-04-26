const { getDb } = require("../config/mongo");
const { ObjectId } = require("mongodb");
const { recordPurchaseInGraph } = require("./recommendationService");

// Place a new order — writes to MongoDB + updates Neo4j graph
async function createOrder(userId, items) {
  const db = getDb();

  // Convert productId strings to ObjectIds for proper MongoDB storage
  const formattedItems = items.map((i) => ({
    productId: new ObjectId(i.productId),
    quantity: i.quantity,
    price: i.price,
  }));

  const order = {
    userId,
    items: formattedItems,
    total: formattedItems.reduce((sum, i) => sum + i.quantity * i.price, 0),
    status: "confirmed",
    createdAt: new Date(),
  };

  const result = await db.collection("orders").insertOne(order);

  // Record each purchased product in Neo4j
  for (const item of formattedItems) {
    await recordPurchaseInGraph(userId, item.productId.toString());
  }

  return { orderId: result.insertedId, ...order };
}

module.exports = { createOrder };
