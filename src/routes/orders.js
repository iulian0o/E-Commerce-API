const express = require("express");
const router = express.Router();
const { createOrder } = require("../services/orderService");

router.post("/", async (req, res) => {
  try {
    const { userId, items } = req.body;
    if (!userId || !items || !items.length) {
      return res.status(400).json({ error: "userId and items are required" });
    }
    const order = await createOrder(userId, items);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;