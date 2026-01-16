#!/bin/bash
# Export all Educafric data using psql COPY command

echo "-- EDUCAFRIC DATABASE EXPORT" > exports/full_export.sql
echo "-- Generated: $(date)" >> exports/full_export.sql
echo "" >> exports/full_export.sql

# Export using psql
psql "$DATABASE_URL" -c "\COPY (SELECT 'INSERT INTO schools (id, name, address) VALUES (' || id || ', ' || quote_literal(COALESCE(name, '')) || ', ' || quote_literal(COALESCE(address, '')) || ') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;' FROM schools ORDER BY id) TO STDOUT" >> exports/full_export.sql

echo "" >> exports/full_export.sql
echo "-- USERS" >> exports/full_export.sql

psql "$DATABASE_URL" -c "\COPY (SELECT 'INSERT INTO users (id, email, password, role, first_name, last_name, phone, school_id, is_active) VALUES (' || id || ', ' || quote_literal(COALESCE(email, '')) || ', ' || quote_literal(COALESCE(password, '')) || ', ' || quote_literal(role) || ', ' || quote_literal(COALESCE(first_name, '')) || ', ' || quote_literal(COALESCE(last_name, '')) || ', ' || quote_literal(COALESCE(phone, '')) || ', ' || COALESCE(school_id::text, 'NULL') || ', ' || COALESCE(is_active::text, 'true') || ') ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password = EXCLUDED.password, role = EXCLUDED.role, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, phone = EXCLUDED.phone, school_id = EXCLUDED.school_id, is_active = EXCLUDED.is_active;' FROM users ORDER BY id) TO STDOUT" >> exports/full_export.sql

echo "" >> exports/full_export.sql
echo "-- CLASSES" >> exports/full_export.sql

psql "$DATABASE_URL" -c "\COPY (SELECT 'INSERT INTO classes (id, name, school_id, level) VALUES (' || id || ', ' || quote_literal(COALESCE(name, '')) || ', ' || COALESCE(school_id::text, 'NULL') || ', ' || quote_literal(COALESCE(level, '')) || ') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, school_id = EXCLUDED.school_id, level = EXCLUDED.level;' FROM classes ORDER BY id) TO STDOUT" >> exports/full_export.sql

echo "Export complete!"
wc -l exports/full_export.sql
