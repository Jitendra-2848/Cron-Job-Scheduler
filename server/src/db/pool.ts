// import type { tryCatch } from "bullmq";
import { config } from "dotenv";
import { Pool } from "pg";
config({path: ".env"});
export const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
})

pool.on("connect", () => {
    console.log("Database connected");
})

export async function _init_db() {
    try {
        // if(!process.env.DATABASE_URI){
        //     console.log("URI is not defined");
        //     return;
        // }
        const client = await pool.connect();
        console.log("Database is connected.");
        client.release();
    } catch (err:any) {
        console.error('❌ Database connection error:', err.message);
        process.exit(1);
    }
}


pool.on("error", (error) => {
    console.log(error.message);
})