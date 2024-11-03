-- NOTE:
-- - This is from a real task
-- - The schema has been simplified
-- - Organizations and regions data are imported separately

-- CREATE TABLES:
CREATE TABLE organizations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20) NOT NULL
)

CREATE TABLE regions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    zip_codes VARCHAR(20)[]
)

-- INSERT SAMPLE DATA:
-- See seed.sql (don't spend too much time on it)

-- QUERY: 
-- (select all fields of organization plus the region name)
EXPLAIN ANALYZE SELECT o.*, r.name as region
FROM organizations o
JOIN regions r ON o.zip_code = ANY(r.zip_codes)
ORDER BY o.id
LIMIT 100
OFFSET 1000;
-- Summary:
-- - Index Scan using organizations_pkey on organizations o
-- - Seq Scan on regions r (nested)
-- - Planning Time: 0.429ms
-- - Execution Time: 9282.530 ms

-- OPTIMIZE ATTEMPT:
-- Create an inverted index on zip_codes field of regions table
CREATE INDEX idx_zip_codes ON regions USING GIN (zip_codes);

-- RE-RUN QUERY: 
EXPLAIN ANALYZE SELECT o.*, r.name as region
FROM organizations o
JOIN regions r ON o.zip_code = ANY(r.zip_codes)
ORDER BY o.id
LIMIT 100
OFFSET 1000;

-- Summary: Seq Scan on regions r
-- -> not use index
-- -> maybe it because the size of regions table is too small

-- => SOLUTION: De-normalization
-- Add a region_id column to organizations table
ALTER TABLE organizations
ADD COLUMN region_id BIGINT;

-- Populate data
UPDATE organizations o
SET region_id = r.id
FROM regions r
WHERE o.region_id IS NULL 
AND o.zip_code = ANY(r.zip_codes);
-- - Seq Scan on organizations o 
-- - Seq Scan on regions r (nested)
-- - Planning Time: 0.158 ms
-- - Execution Time: 551013.056 ms (9.18 minutes)

-- OBSERVATION:
-- - This took quite a bit of time :)
-- - In exchange, we don't need to join and scan regions table anymore.
-- - Organizations don't get inserted so often (a few times each year).
--   Regions data is quite stable (almost doesn't change at all).
--   So I think this is acceptable
-- - Note that this need to be run every time there are new organizations or regions

-- UPDATED QUERY
-- (join with region id, not zip code)
EXPLAIN ANALYZE SELECT o.*, r.name as region
FROM organizations o
JOIN regions r ON o.region_id = r.id
ORDER BY o.id
LIMIT 100
OFFSET 1000;
-- Index Scan using organizations_pkey on organizations o 
-- Index Scan using regions_pkey on regions r (nested)
-- Planning Time: 0.363 ms
-- Execution Time: 2.604 ms

-- ONE MORE THING (optional):
-- When there are new organizations, region_ids are not populated yet.
-- What if there are requests at this point?
-- (Note: there are zip codes that do not belong to any region in our DB)

-- ...
-- This is getting too details, so I will stop here
