const { getDriver } = require("../config/neo4j");

async function recordPurchaseInGraph(userId, productId) {
  const session = getDriver().session();
  try {
    await session.run(
      `
      MERGE (u:User {userId: $userId})
      MERGE (p:Product {productId: $productId})
      MERGE (u)-[:BOUGHT]->(p)
      `,
      { userId: String(userId), productId: String(productId) }
    );
  } finally {
    await session.close();
  }
}

async function getRecommendations(userId) {
  const session = getDriver().session();
  try {
    const result = await session.run(
      `
      MATCH (:User {userId: $userId})-[:BOUGHT]->(p:Product)<-[:BOUGHT]-(other:User)-[:BOUGHT]->(rec:Product)
      WHERE NOT (:User {userId: $userId})-[:BOUGHT]->(rec)
      RETURN rec.productId AS productId, count(*) AS score
      ORDER BY score DESC
      LIMIT 5
      `,
      { userId: String(userId) }
    );
    return result.records.map(r => ({
      productId: r.get("productId"),
      score: r.get("score").toNumber()
    }));
  } finally {
    await session.close();
  }
}

module.exports = { recordPurchaseInGraph, getRecommendations };