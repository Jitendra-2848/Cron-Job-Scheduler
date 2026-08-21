import { config } from "dotenv";

config({ path: "../.env" });

import { Queue } from "bullmq";
import IORedis from "ioredis";

const redis_url = process.env.REDIS_URI;

if (!redis_url) {
    throw new Error("REDIS_URI is not defined");
}

const connection = new IORedis(redis_url, {
    maxRetriesPerRequest: null,
});

const queue = new Queue("HTTP", {
    connection,
});

// =====================================
// GET
// =====================================

await queue.add("GET", {
    name: "Get Product",
    method: "GET",
    url: "https://dummyjson.com/products/1",
});

// =====================================
// GET ALL
// =====================================

await queue.add("GET ALL", {
    name: "Get All Products",
    method: "GET",
    url: "https://dummyjson.com/products",
});

// =====================================
// POST
// =====================================

await queue.add(
    "POST",
    {
        name: "Create Product",
        method: "POST",
        url: "https://dummyjson.com/products/add",

        payload: {
            title: "My New Product",
            price: 100,
            category: "electronics",
        },
    },
    {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
    }
);

// =====================================
// PUT
// =====================================

await queue.add(
    "PUT",
    {
        name: "Update Product",
        method: "PUT",
        url: "https://dummyjson.com/products/1",

        payload: {
            title: "Updated Product",
            price: 200,
        },
    },
    {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
    }
);

// =====================================
// PATCH
// =====================================

await queue.add(
    "PATCH",
    {
        name: "Patch Product",
        method: "PATCH",
        url: "https://dummyjson.com/products/1",

        payload: {
            price: 300,
        },
    },
    {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
    }
);

// =====================================
// DELETE
// =====================================

await queue.add("DELETE", {
    name: "Delete Product",
    method: "DELETE",
    url: "https://dummyjson.com/products/1",
});

console.log("All jobs added!");

await queue.close();
await connection.quit();