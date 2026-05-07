const { getDb } = require("../config/mongo");
const { getRedis } = require("../config/redis");
const { ObjectId } = require("mongodb");

// Get single product — Redis HASH first, fallback to MongoDB
async function getProductById(id) {
  const redis = getRedis();
  const hashKey = `product:${id}`;

  // Check Redis hash
  const cached = await redis.hgetall(hashKey);
  if (cached && Object.keys(cached).length > 0) {
    console.log("Cache hit - product hash");
    return {
      _id: cached._id,
      name: cached.name,
      category: cached.category,
      price: parseFloat(cached.price),
      stock: parseInt(cached.stock)
    };
  }

  // Fallback to MongoDB
  const db = getDb();
  const product = await db.collection("products").findOne({
    _id: new ObjectId(id)
  });

  if (product) {
    // Store as Redis HASH instead of string
    await redis.hset(hashKey,
      "_id",      product._id.toString(),
      "name",     product.name,
      "category", product.category,
      "price",    product.price.toString(),
      "stock",    product.stock.toString()
    );
    await redis.expire(hashKey, 3600); // 1 hour
  }

  return product;
}

// Aggregation Pipeline 1: Top selling products — cached in Redis for 5 mins
async function getTopSellingProducts() {
  const redis = getRedis();
  const cacheKey = "agg:top-selling";

  // Check Redis cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log("Cache hit - top selling aggregation");
    return JSON.parse(cached);
  }

  // Run MongoDB aggregation
  const db = getDb();
  const result = await db.collection("orders").aggregate([
    { $unwind: "$items" },
    { $group: { _id: "$items.productId", totalSold: { $sum: "$items.quantity" } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    { $project: { name: "$product.name", totalSold: 1 } }
  ]).toArray();

  // Cache result for 5 minutes
  await redis.set(cacheKey, JSON.stringify(result), "EX", 300);
  console.log("Aggregation cached - top selling");

  return result;
}

// Aggregation Pipeline 2: Revenue per category — cached in Redis for 5 mins
async function getRevenueByCategory() {
  const redis = getRedis();
  const cacheKey = "agg:revenue-by-category";

  // Check Redis cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log("Cache hit - revenue aggregation");
    return JSON.parse(cached);
  }

  // Run MongoDB aggregation
  const db = getDb();
  const result = await db.collection("orders").aggregate([
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "productInfo"
      }
    },
    { $unwind: "$productInfo" },
    {
      $group: {
        _id: "$productInfo.category",
        totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]).toArray();

  // Cache result for 5 minutes
  await redis.set(cacheKey, JSON.stringify(result), "EX", 300);
  console.log("Aggregation cached - revenue by category");

  return result;
}

module.exports = { getProductById, getTopSellingProducts, getRevenueByCategory };