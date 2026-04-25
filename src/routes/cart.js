const express = require("express");
const router = express.Router();
const { addToCart, getCart, clearCart, checkRateLimit } = require("../services/cartService");

// Rate limiting middleware
router.use(async (req, res, next) => {
  const ip = req.ip;
  const allowed = await checkRateLimit(ip);
  if (!allowed) return res.status(429).json({ error: "Too many requests" });
  next();
});

router.post("/:userId/add", async (req, res) => {
  const { productId, quantity, price } = req.body;
  const cart = await addToCart(req.params.userId, productId, quantity, price);
  res.json(cart);
});

router.get("/:userId", async (req, res) => {
  const cart = await getCart(req.params.userId);
  res.json(cart);
});

router.delete("/:userId", async (req, res) => {
  await clearCart(req.params.userId);
  res.json({ message: "Cart cleared" });
});

module.exports = router;