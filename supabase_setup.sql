-- 1. Create contacts table
CREATE TABLE contacts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create ratings table
CREATE TABLE ratings (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Allow anyone (public) to insert data
CREATE POLICY "Allow public insert contacts" ON contacts FOR
INSERT
    TO anon
WITH
    CHECK (true);

CREATE POLICY "Allow public insert ratings" ON ratings FOR
INSERT
    TO anon
WITH
    CHECK (true);

-- Allow authenticated users (admin) to view data
CREATE POLICY "Allow authenticated read contacts" ON contacts FOR
SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read ratings" ON ratings FOR
SELECT TO authenticated USING (true);