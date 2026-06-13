CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Tenant schemas jadvalini yaratish
CREATE TABLE IF NOT EXISTS django_tenants (
    id SERIAL PRIMARY KEY,
    schema_name VARCHAR(63) NOT NULL UNIQUE,
    created_on TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Public schema ruxsatlari
GRANT ALL ON SCHEMA public TO eduuser;
GRANT ALL ON ALL TABLES IN SCHEMA public TO eduuser;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO eduuser;

-- Indexlar
CREATE INDEX IF NOT EXISTS idx_django_tenants_schema ON django_tenants(schema_name);

-- Foydalanish statistikasi
CREATE TABLE IF NOT EXISTS usage_stats (
    id SERIAL PRIMARY KEY,
    schema_name VARCHAR(63),
    action VARCHAR(50),
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Vacuum settings
ALTER TABLE django_tenants SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE usage_stats SET (autovacuum_vacuum_scale_factor = 0.2);
