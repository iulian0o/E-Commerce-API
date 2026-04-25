const express = require("express");
const router = express.Router();
const {
  getProductById,
  getTopSellingProducts,
  getRevenueByCategory,
} = require("../services/productService.js");

router.get("/top-selling", async (req, res) => {
  try {
    const data = await getTopSellingProducts();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/revenue-by-category", async (req, res) => {
  try {
    const data = await getRevenueByCategory();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
