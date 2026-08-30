import { pool } from "../db/pool.js";
import { CronExpressionParser } from "cron-parser";

const seed = async () => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const users = [
            ["Rahul Sharma", "rahul@example.com", "password123"],
            ["Priya Singh", "priya@example.com", "password123"],
            ["Amit Kumar", "amit@example.com", "password123"],
            ["Sneha Patel", "sneha@example.com", "password123"],
            ["Arjun Verma", "arjun@example.com", "password123"],
            ["Neha Gupta", "neha@example.com", "password123"],
            ["Rohan Mehta", "rohan@example.com", "password123"],
            ["Ananya Joshi", "ananya@example.com", "password123"],
            ["Vikram Rao", "vikram@example.com", "password123"],
            ["Kavya Nair", "kavya@example.com", "password123"]
        ];

        for (const [name, email, password] of users) {
            await client.query(
                `
                INSERT INTO users (name, email, password)
                VALUES ($1, $2, $3)
                ON CONFLICT (email) DO NOTHING
                `,
                [name, email, password]
            );
        }

        const userResult = await client.query(
            `
            SELECT id, email
            FROM users
            WHERE email = ANY($1)
            `,
            [users.map((user) => user[1])]
        );

        const userMap = new Map();

        for (const user of userResult.rows) {
            userMap.set(user.email, user.id);
        }

        const jobs = [
            {
                email: "rahul@example.com",
                name: "World Time",
                url: "http://localhost:9000/get",
                method: "GET",
                cron: "*/1 * * * *",
                payload: {},
                retries: 3,
                status: "active"
            },
            {
                email: "priya@example.com",
                name: "Bitcoin Price",
                url: "http://localhost:9000/get",
                method: "GET",
                cron: "*/2 * * * *",
                payload: {},
                retries: 3,
                status: "active"
            },
            {
                email: "amit@example.com",
                name: "Random User",
                url: "http://localhost:9000/get",
                method: "GET",
                cron: "*/3 * * * *",
                payload: {},
                retries: 5,
                status: "active"
            },
            {
                email: "sneha@example.com",
                name: "Exchange Rates",
                url: "http://localhost:9000/get",
                method: "GET",
                cron: "*/5 * * * *",
                payload: {},
                retries: 5,
                status: "active"
            },
            {
                email: "arjun@example.com",
                name: "GitHub Repository",
                url: "http://localhost:9000/get",
                method: "GET",
                cron: "*/5 * * * *",
                payload: {},
                retries: 2,
                status: "active"
            },
            {
                email: "neha@example.com",
                name: "JSONPlaceholder Post",
                url: "http://localhost:9000/get",
                method: "GET",
                cron: "*/2 * * * *",
                payload: {},
                retries: 3,
                status: "active"
            },
            {
                email: "rohan@example.com",
                name: "HTTP Test",
                url: "http://localhost:9000/get",
                method: "GET",
                cron: "*/1 * * * *",
                payload: {},
                retries: 3,
                status: "active"
            },
            {
                email: "ananya@example.com",
                name: "JSONPlaceholder User",
                url: "http://localhost:9000/get/:id",
                method: "GET",
                cron: "*/3 * * * *",
                payload: {},
                retries: 4,
                status: "active"
            },
            {
                email: "vikram@example.com",
                name: "GitHub Issues",
                url: "http://localhost:9000/get",
                method: "GET",
                cron: "*/5 * * * *",
                payload: {},
                retries: 3,
                status: "active"
            },
            {
                email: "kavya@example.com",
                name: "HTTP JSON",
                url: "http://localhost:9000/get",
                method: "GET",
                cron: "*/2 * * * *",
                payload: {},
                retries: 3,
                status: "active"
            },
            {
                email: "rahul@example.com",
                name: "Random Number",
                url: "http://localhost:9000/get",
                method: "GET",
                cron: "*/1 * * * *",
                payload: {},
                retries: 5,
                status: "active"
            },
            {
                email: "priya@example.com",
                name: "India Country Data",
                url: "http://localhost:9000/get",
                method: "GET",
                cron: "*/5 * * * *",
                payload: {},
                retries: 2,
                status: "active"
            },
            {
                email: "amit@example.com",
                name: "POST Test",
                url: "http://localhost:9000/post",
                method: "POST",
                cron: "*/2 * * * *",
                payload: {
                    source: "scheduler",
                    message: "Hello from cron job"
                },
                retries: 3,
                status: "active"
            },
            {
                email: "sneha@example.com",
                name: "DELETE Test",
                url: "http://localhost:9000/delete",
                method: "DELETE",
                cron: "*/5 * * * *",
                payload: {
                    test: true
                },
                retries: 2,
                status: "active"
            },
            {
                email: "vikram@example.com",
                name: "DELETE With ID Test",
                url: "http://localhost:9000/delete/123",
                method: "DELETE",
                cron: "*/5 * * * *",
                payload: {},
                retries: 2,
                status: "active"
            },
            {
                email: "kavya@example.com",
                name: "UPDATE Test",
                url: "http://localhost:9000/update",
                method: "POST",
                cron: "*/3 * * * *",
                payload: {
                    id: 1,
                    newStatus: "completed"
                },
                retries: 3,
                status: "active"
            },
            {
                email: "arjun@example.com",
                name: "Failure Test",
                url: "http://localhost:9000/get",
                method: "GET",
                cron: "*/5 * * * *",
                payload: {},
                retries: 3,
                status: "active"
            }
        ];

        for (const job of jobs) {
            const userId = userMap.get(job.email);

            if (!userId) {
                throw new Error(
                    `User not found for email: ${job.email}`
                );
            }

            let nextRunAt = null;

            if (job.status === "active") {
                nextRunAt = CronExpressionParser
                    .parse(job.cron, {
                        currentDate: new Date(),
                        tz: "Asia/Kolkata"
                    })
                    .next()
                    .toDate();
            }

            await client.query(
                `
                INSERT INTO jobs
                (
                    user_id,
                    name,
                    url,
                    method,
                    cron_expression,
                    payload,
                    retries,
                    status,
                    next_run_at
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                `,
                [
                    userId,
                    job.name,
                    job.url,
                    job.method,
                    job.cron,
                    JSON.stringify(job.payload),
                    job.retries,
                    job.status,
                    nextRunAt
                ]
            );
        }
        await client.query("COMMIT");

        console.log("✅ Seed completed successfully");
        console.log(`👤 Users: ${users.length}`);
        console.log(`⚙️ Jobs: ${jobs.length}`);

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("❌ Seed failed:", error);

        process.exitCode = 1;
    } finally {
        client.release();
    }
};

seed();