-- Test migration to verify SQL syntax
-- This file can be used to test the migrations before running them

-- Test basic table creation
CREATE TABLE IF NOT EXISTS test_table (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test enum types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'test_status') THEN
        CREATE TYPE test_status AS ENUM ('active', 'inactive');
    END IF;
END $$;

-- Test function creation
CREATE OR REPLACE FUNCTION test_function()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Hello World';
END;
$$ LANGUAGE plpgsql;

-- Test trigger creation
CREATE TRIGGER test_trigger
    BEFORE UPDATE ON test_table
    FOR EACH ROW EXECUTE FUNCTION test_function();

-- Clean up
DROP TRIGGER IF EXISTS test_trigger ON test_table;
DROP FUNCTION IF EXISTS test_function();
DROP TYPE IF EXISTS test_status;
DROP TABLE IF EXISTS test_table;