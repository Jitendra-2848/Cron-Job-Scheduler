-- 1. Create Users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Migrations for existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 2. Create Jobs table if not exists
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  method VARCHAR(10) DEFAULT 'GET',
  cron_expression VARCHAR(100) NOT NULL,
  next_run_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB DEFAULT '{}',
  retries INT DEFAULT 3,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Migrations for existing jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS user_id INT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS method VARCHAR(10) DEFAULT 'GET';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cron_expression VARCHAR(100);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS next_run_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS retries INT DEFAULT 3;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 3. Create Executions table if not exists
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

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status_next_run ON jobs(status, next_run_at);
CREATE INDEX IF NOT EXISTS idx_executions_job_created ON executions(job_id, created_at DESC);
