# E-Commerce API with Smart Recommendations

A backend REST API using MongoDB Atlas, Neo4j, and Redis Cloud running in Docker.

---

## Prerequisites

- Docker Desktop installed and running
- MongoDB Atlas account
- Neo4j AuraDB account 
- Redis Cloud account

---

## Setup

**1. Clone the repo**
```bash
git clone https://github.com/yourteam/ecommerce-api.git
cd ecommerce-api
```

**2. Configure environment**
```bash
cp .env.example .env
```
Open `.env` and fill in your credentials:
```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
NEO4J_URI=neo4j+s://<your-instance>.databases.neo4j.io
NEO4J_USER=<your-username>
NEO4J_PASSWORD=<your-password>
REDIS_URL=redis://:<password>@<host>:<port>
```

**3. Seed MongoDB**

Open MongoDB Compass → connect to your Atlas cluster → open the MongoShell tab at the bottom and paste the contents of `scripts/seed.mongo.js`, then press Enter.

**4. Generate product embeddings**
```bash
npm install
node ./scripts/generateEmbeddings.js
```

**5. Seed Neo4j and Redis**
```bash
node ./scripts/seed.js
```

**6. Start the API**
```bash
docker compose up --build
```

API runs at `http://localhost:3000`

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /products/:id | Get product (Redis cache then MongoDB) |
| GET | /products/top-selling | Top 5 products by units sold |
| GET | /products/revenue-by-category | Revenue grouped by category |
| GET | /home | Home page data, cached 5 mins in Redis |
| POST | /orders | Place an order |
| GET | /recommendations/:userId | Neo4j graph recommendations |
| GET | /similar/:productId | Similar products by vector search |
| POST | /similar/by-image | Similar products from a text description |
| GET | /cart/:userId | Get cart |
| POST | /cart/:userId/add | Add item to cart |
| DELETE | /cart/:userId | Clear cart |

---

## Example Requests

**Place an order**
```json
POST /orders
{
  "userId": "user1",
  "items": [
    { "productId": "<productId>", "quantity": 1, "price": 79.99 }
  ]
}
```

**Add to cart**
```json
POST /cart/user1/add
{
  "productId": "<productId>",
  "quantity": 2,
  "price": 39.99
}
```

**Search by image description**
```json
POST /similar/by-image
{
  "description": "wireless audio device for music"
}
```

---

## Stop the API

```bash
docker compose down
```
