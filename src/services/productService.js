const { getDb } = require("../config/mongo");
const { getRedis } = require("../config/redis");
const { ObjectId } = require("mongodb");

// Get single product, Redis cache first, fallback to MongoDB
async function getProductById(id) {
  const redis = getRedis();

  const cached = await redis.get(`product:${id}`);
  if (cached) {
    console.log("Cache hit");
    return JSON.parse(cached);
  }

  const db = getDb();
  const product = await db
    .collection("products")
    .findOne({ _id: new ObjectId(id) });
  if (product) {
    await redis.set(`product:${id}`, JSON.stringify(product), "EX", 3600);
  }
  return product;
}

// Aggregation Pipeline 1: Top selling products
async function getTopSellingProducts() {
  const db = getDb();
  return db
    .collection("orders")
    .aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $project: { name: "$product.name", totalSold: 1 } },
    ])
    .toArray();
}

// Aggregation Pipeline 2: Revenue per category
async function getRevenueByCategory() {
  const db = getDb();
  return db
    .collection("orders")
    .aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category", // Group by: $arrayElementAt
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ])
    .toArray();
}

module.exports = {
  getProductById,
  getTopSellingProducts,
  getRevenueByCategory,
};
