import "../config/env.js";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URI;
const isLocalhost = connectionString?.includes("localhost") || connectionString?.includes("127.0.0.1") || connectionString?.includes("postgres:5432");

export const pool = new Pool({
    connectionString,
    ssl: !isLocalhost ? { rejectUnauthorized: false } : undefined,
});

pool.on("connect", () => {
    console.log("Scheduler database connected");
});

export async function _init_db() {
    try {
        const client = await pool.connect();
        console.log("Scheduler database connection established.");
        client.release();
    } catch (err: any) {
        console.error("Scheduler database connection error:", err.message);
    }
}

pool.on("error", (error) => {
    console.error("Scheduler database pool error:", error.message);
});
