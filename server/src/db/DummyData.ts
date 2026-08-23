import { pool } from "./pool.js";

const userData = async () => {
    try {
        await pool.query(`
            INSERT INTO users (name, email, password) VALUES
                ('Rahul Sharma', 'rahul@example.com', 'password123'),
                ('Priya Singh', 'priya@example.com', 'password123'),
                ('Amit Kumar', 'amit@example.com', 'password123'),
                ('Sneha Patel', 'sneha@example.com', 'password123'),
                ('Arjun Verma', 'arjun@example.com', 'password123'),
                ('Neha Gupta', 'neha@example.com', 'password123'),
                ('Rohan Mehta', 'rohan@example.com', 'password123'),
                ('Ananya Joshi', 'ananya@example.com', 'password123'),
                ('Vikram Rao', 'vikram@example.com', 'password123'),
                ('Kavya Nair', 'kavya@example.com', 'password123');`
        );
    } catch (error: any) {
        console.log(error.message);
    }
}
const jobData = async () => {
    try {
        await pool.query(`
            INSERT INTO jobs
                (user_id, name, url, method, cron_expression, payload, retries, status)
                VALUES
                (1, 'Health Check API', 'https://api.example.com/health', 'GET', '*/5 * * * *', '{}', 3, 'active'),
                (2, 'Daily Report', 'https://api.example.com/reports', 'POST', '0 9 * * *', '{"format":"pdf"}', 3, 'active'),
                (3, 'Sync Users', 'https://api.example.com/users', 'POST', '*/15 * * * *', '{"fullSync":true}', 5, 'active'),
                (4, 'Database Backup', 'https://api.example.com/backup', 'POST', '0 2 * * *', '{"compression":true}', 5, 'active'),
                (5, 'Cleanup Logs', 'https://api.example.com/logs', 'DELETE', '0 0 * * 0', '{"olderThanDays":30}', 2, 'paused'),
                (6, 'Refresh Cache', 'https://api.example.com/cache', 'POST', '*/30 * * * *', '{"cache":"all"}', 3, 'active'),
                (7, 'Payment Status', 'https://api.example.com/payment', 'GET', '*/10 * * * *', '{}', 3, 'active'),
                (8, 'Send Notifications', 'https://api.example.com/notify', 'POST', '0 */2 * * *', '{"channel":"email"}', 4, 'active'),
                (9, 'Generate Analytics', 'https://api.example.com/analytics', 'POST', '0 6 * * *', '{"range":"24h"}', 3, 'active'),
                (10, 'Update Exchange Rates', 'https://api.example.com/currency', 'GET', '0 * * * *', '{"currencies":["USD","EUR","INR"]}', 3, 'active'),
                (11, 'Process Orders', 'https://api.example.com/orders', 'POST', '*/10 * * * *', '{"status":"pending"}', 5, 'active'),
                (1, 'Archive Notifications', 'https://api.example.com/archive', 'POST', '0 1 * * *', '{"olderThanDays":90}', 2, 'paused');`
        );
    } catch (error: any) {
        console.log(error.message);
    }
}

userData();
jobData();
