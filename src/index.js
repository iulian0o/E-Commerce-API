require("dotenv").config();

const express = require("express");
const { connectMongo } = require("./config/mongo");
const { connectNeo4j } = require("./config/neo4j");
const { connectRedis } = require("./config/redis");

const app = express();

app.use(express.json());
app.use("/products", require("./routes/products"));
app.use("/orders", require("./routes/orders"));
app.use("/cart", require("./routes/cart"));
app.use("/recommendations", require("./routes/recommendations"));

async function start() {
  await connectMongo();
  connectNeo4j();
  connectRedis();
  app.listen(process.env.PORT, () => {
    console.log(`API running on port ${process.env.PORT}`);
  });
}

start();