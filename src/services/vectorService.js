const { getDb } = require("../config/mongo");
const { ObjectId } = require("mongodb");
const { pipeline } = require("@xenova/transformers");

let extractor = null;

async function getExtractor() {
  if (!extractor) {
    console.log("Loading embedding model...");
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("Embedding model loaded");
  }
  return extractor;
}

async function generateEmbeddingFromText(text) {
  const model = await getExtractor();
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

async function getSimilarProducts(productId) {
  const db = getDb();

  const source = await db.collection("products").findOne({
    _id: new ObjectId(productId)
  });

  if (!source) throw new Error("Product not found");
  if (!source.embedding) throw new Error("Product has no embedding vector");

  const results = await db.collection("products").aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: source.embedding,
        numCandidates: 10,
        limit: 4
      }
    },
    {
      $addFields: { similarityScore: { $meta: "vectorSearchScore" } }
    },
    {
      $match: { _id: { $ne: new ObjectId(productId) } }
    },
    {
      $project: { name: 1, category: 1, price: 1, similarityScore: 1 }
    }
  ]).toArray();

  return {
    sourceProduct: {
      id: source._id,
      name: source.name,
      category: source.category,
      price: source.price
    },
    similarProducts: results
  };
}

async function getSimilarProductsByImage(imageDescription) {
  const db = getDb();

  const queryVector = await generateEmbeddingFromText(imageDescription);

  const results = await db.collection("products").aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector,
        numCandidates: 10,
        limit: 3
      }
    },
    {
      $addFields: { similarityScore: { $meta: "vectorSearchScore" } }
    },
    {
      $project: { name: 1, category: 1, price: 1, similarityScore: 1 }
    }
  ]).toArray();

  return {
    query: imageDescription,
    similarProducts: results
  };
}

module.exports = { getSimilarProducts, getSimilarProductsByImage };