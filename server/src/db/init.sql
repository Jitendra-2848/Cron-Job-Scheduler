CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  method VARCHAR(10) DEFAULT 'GET',
  cron_expression VARCHAR(100) NOT NULL,
  payload JSONB DEFAULT '{}',
  retries INT DEFAULT 3, 
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

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