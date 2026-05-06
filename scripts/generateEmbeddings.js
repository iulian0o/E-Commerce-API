require("dotenv").config();
const { MongoClient } = require("mongodb");
const { pipeline } = require("@xenova/transformers");

async function generateEmbeddings() {
  console.log("Loading embedding model (first run downloads ~25MB)...");

  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"  
  );

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db("ecommerce");

  const products = await db.collection("products").find({}).toArray();

  for (const product of products) {
    const text = `${product.name} ${product.category} price ${product.price}`;

    const output = await extractor(text, { pooling: "mean", normalize: true });
    const embedding = Array.from(output.data); 

    await db.collection("products").updateOne(
      { _id: product._id },
      { $set: { embedding } }
    );

    console.log(`Embedding generated for: ${product.name}`);
  }

  console.log("All product embeddings updated");
  await client.close();
}

generateEmbeddings().catch(console.error);