const { getDb } = require("../config/mongo");
const { ObjectId } = require("mongodb");

// Generates a 3D vector from product fields
function generateEmbedding(category, price) {
  const categoryMap = {
    Electronics: 1.0,
    Accessories: 0.5,
    Sports: 0.2,
    Clothing: 0.3,
    Books: 0.1,
  };

  const categoryCode = categoryMap[category] ?? 0.4;
  const subCode = 0.0;
  const normalizedPrice = Math.min(price / 200, 1.0);

  return [categoryCode, subCode, normalizedPrice];
}

// Find products similar to a given productId using Atlas Vector Search
async function getSimilarProducts(productId) {
  const db = getDb();

  const source = await db.collection("products").findOne({
    _id: new ObjectId(productId),
  });

  if (!source) throw new Error("Product not found");
  if (!source.embedding) throw new Error("Product has no embedding vector");

  const results = await db
    .collection("products")
    .aggregate([
      {
        $vectorSearch: {
          index: "vector_index", 
          path: "embedding", 
          queryVector: source.embedding, 
          numCandidates: 10, 
          limit: 4, 
        },
      },
      {
        $addFields: {
          similarityScore: { $meta: "vectorSearchScore" },
        },
      },
      {
        $match: {
          _id: { $ne: new ObjectId(productId) },
        },
      },
      {
        $project: {
          name: 1,
          category: 1,
          price: 1,
          similarityScore: 1,
        },
      },
    ])
    .toArray();

  return {
    sourceProduct: {
      id: source._id,
      name: source.name,
      category: source.category,
      price: source.price,
    },
    similarProducts: results,
  };
}

module.exports = { getSimilarProducts, generateEmbedding };