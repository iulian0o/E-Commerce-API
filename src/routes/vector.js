const express = require("express");
const router = express.Router();
const { getSimilarProducts } = require("../services/vectoreServices");

router.get("/:productId", async (req, res) => {
  try {
    const result = await getSimilarProducts(req.params.productId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;