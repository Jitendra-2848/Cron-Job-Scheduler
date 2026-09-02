import "../config/env.js";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URI;
const isLocalhost = connectionString?.includes("localhost") || connectionString?.includes("127.0.0.1") || connectionString?.includes("postgres:5432");

export const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" && !isLocalhost
        ? { rejectUnauthorized: false }
        : undefined,
});

pool.on("connect", () => {
    console.log("Database connected");
});

export async function _init_db() {
    try {
        const client = await pool.connect();
        console.log("Database is connected.");
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE,
                password TEXT,
                email VARCHAR(255) UNIQUE,
                refresh_token TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );

            ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
            ALTER TABLE users ALTER COLUMN name DROP NOT NULL;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255);
            ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                user_id INT,
                name VARCHAR(255) NOT NULL,
                url TEXT NOT NULL,
                method VARCHAR(10) DEFAULT 'GET',
                cron_expression VARCHAR(100) NOT NULL,
                payload JSONB DEFAULT '{}',
                retries INT DEFAULT 3,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT NOW()
            );

            ALTER TABLE jobs ADD COLUMN IF NOT EXISTS user_id INT;
            ALTER TABLE jobs ADD COLUMN IF NOT EXISTS name VARCHAR(255);
            ALTER TABLE jobs ADD COLUMN IF NOT EXISTS url TEXT;
            ALTER TABLE jobs ADD COLUMN IF NOT EXISTS method VARCHAR(10) DEFAULT 'GET';
            ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cron_expression VARCHAR(100);
            ALTER TABLE jobs ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}';
            ALTER TABLE jobs ADD COLUMN IF NOT EXISTS retries INT DEFAULT 3;
            ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
            ALTER TABLE jobs ADD COLUMN IF NOT EXISTS next_run_at TIMESTAMP DEFAULT NOW();
            ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

            CREATE TABLE IF NOT EXISTS executions (
                id SERIAL PRIMARY KEY,
                job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
                status VARCHAR(20) NOT NULL,
                response_code INT,
                response_body TEXT,
                response_time_ms INT,
                error_message TEXT,
                attempt_number INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("Database schema & columns (users, jobs, executions) verified successfully.");
        client.release();
    } catch (err: any) {
        console.error("Database connection error:", err.message);
    }
}

pool.on("error", (error) => {
    console.error("PostgreSQL pool error:", error.message);
});
