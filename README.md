# Bricks Backend

REST API for the Bricks app, built with [Elysia.js](https://elysiajs.com/) and [Bun](https://bun.sh/).

## Tech Stack

- **Runtime:** Bun
- **Framework:** Elysia.js
- **Database:** MongoDB (Atlas / local)
- **ODM:** Mongoose

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- MongoDB Atlas account or local MongoDB instance

### Installation

```bash
bun install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/klemmbaustein
PORT=3000
```

### Development

```bash
bun run dev
```

### Production

```bash
bun run start
```

## API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products |
| GET | `/products/owned` | Get owned products |
| GET | `/products/wishlist` | Get wishlist products |
| GET | `/products/:id` | Get product by ID |
| POST | `/products` | Create a new product |
| PUT | `/products/:id` | Update a product |
| DELETE | `/products/:id` | Delete a product |
