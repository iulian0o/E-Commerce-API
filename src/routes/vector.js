const express = require("express");
const router = express.Router();
const { getSimilarProducts, getSimilarProductsByImage } = require("../services/vectorService.js");

router.post("/by-image", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: "description is required" });
    }
    const result = await getSimilarProductsByImage(description);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:productId", async (req, res) => {
  try {
    const result = await getSimilarProducts(req.params.productId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;