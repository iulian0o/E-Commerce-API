// use ecommerce //

// Clear existing data
db.products.deleteMany({})
db.users.deleteMany({})
db.orders.deleteMany({})

// Insert products
db.products.insertMany([
  { name: "Wireless Headphones", category: "Electronics", price: 79.99,  stock: 50  },
  { name: "Mechanical Keyboard", category: "Electronics", price: 129.99, stock: 30  },
  { name: "Laptop Stand",        category: "Accessories", price: 39.99,  stock: 100 }
])

// Grab auto-generated IDs
const p1 = db.products.findOne({ name: "Wireless Headphones" })._id
const p2 = db.products.findOne({ name: "Mechanical Keyboard" })._id
const p3 = db.products.findOne({ name: "Laptop Stand" })._id

// Insert users
db.users.insertMany([
  { userId: "user1", name: "Alice", email: "alice@example.com" },
  { userId: "user2", name: "Bob",   email: "bob@example.com"   },
  { userId: "user3", name: "Carol", email: "carol@example.com" }
])

// Insert orders
db.orders.insertMany([
  {
    userId: "user1",
    items: [{ productId: p1, quantity: 1, price: 79.99 }],
    total: 79.99,
    status: "confirmed",
    createdAt: new Date()
  },
  {
    userId: "user2",
    items: [
      { productId: p1, quantity: 1, price: 79.99  },
      { productId: p2, quantity: 1, price: 129.99 }
    ],
    total: 209.98,
    status: "confirmed",
    createdAt: new Date()
  },
  {
    userId: "user3",
    items: [
      { productId: p2, quantity: 1, price: 129.99 },
      { productId: p3, quantity: 2, price: 39.99  }
    ],
    total: 209.97,
    status: "confirmed",
    createdAt: new Date()
  }
])

// Add vector embeddings
db.products.updateOne(
  { name: "Wireless Headphones" },
  { $set: { embedding: [1.0, 0.0, 0.40] } }
)
db.products.updateOne(
  { name: "Mechanical Keyboard" },
  { $set: { embedding: [1.0, 0.0, 0.65] } }
)
db.products.updateOne(
  { name: "Laptop Stand" },
  { $set: { embedding: [0.5, 1.0, 0.20] } }
)

// Verify
print("=== PRODUCTS ==="); db.products.find().forEach(printjson)
print("=== USERS ===");    db.users.find().forEach(printjson)
print("=== ORDERS ===");   db.orders.find().forEach(printjson)