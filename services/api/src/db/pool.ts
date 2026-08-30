import "../config/env.js"
import { Pool } from "pg";

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.DATABASE_URI,
});

pool.on("connect", () => {
    console.log("Database connected");
});

export async function _init_db() {
    try {
        const client = await pool.connect();
        console.log("Database is connected.");
        client.release();
    } catch (err: any) {
        console.error('❌ Database connection error:', err.message);
        process.exit(1);
    }
}

pool.on("error", (error) => {
    console.log(error.message);
});
