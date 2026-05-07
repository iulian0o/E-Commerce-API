const express = require("express");
const router = express.Router();
const { getRedis } = require("../config/redis");
const { getTopSellingProducts, getRevenueByCategory } = require("../services/productService");

router.get("/", async (req, res) => {
  const redis = getRedis();
  const cacheKey = "home:page";

  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log("Cache hit - home page");
    return res.json({ source: "cache", ...JSON.parse(cached) });
  }

  const [topSelling, revenueByCategory] = await Promise.all([
    getTopSellingProducts(),
    getRevenueByCategory()
  ]);

  const homeData = { topSelling, revenueByCategory };


  await redis.set(cacheKey, JSON.stringify(homeData), "EX", 300);
  console.log("Home page cached");

  res.json({ source: "mongodb", ...homeData });
});

module.exports = router;