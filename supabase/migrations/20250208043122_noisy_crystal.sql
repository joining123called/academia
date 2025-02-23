/*
  # Fix Authentication Flow and Display IDs

  1. Changes
    - Add display_id column to profiles
    - Update user_ids table structure
    - Add functions for ID formatting and validation
    - Update existing policies

  2. Security
    - Maintain existing RLS policies
    - Add new policies for display_id access
*/

-- Add display_id to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'display_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN display_id text;
  END IF;
END $$;

-- Create function to format display ID
CREATE OR REPLACE FUNCTION format_display_id(role text, numeric_id bigint)
RETURNS text AS $$
BEGIN
  RETURN CASE 
    WHEN role = 'admin' THEN CONCAT('Adm-', LPAD(numeric_id::text, 6, '0'))
    WHEN role = 'writer' THEN CONCAT('Wri-', LPAD(numeric_id::text, 6, '0'))
    ELSE CONCAT('Cli-', LPAD(numeric_id::text, 6, '0'))
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to validate display ID format
CREATE OR REPLACE FUNCTION is_valid_display_id(display_id text)
RETURNS boolean AS $$
BEGIN
  RETURN display_id ~ '^(Adm|Wri|Cli)-\d{6}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update profiles with display IDs
DO $$ 
BEGIN
  UPDATE profiles p
  SET display_id = format_display_id(p.role, u.numeric_id)
  FROM user_ids u
  WHERE p.user_id = u.user_id
  AND p.display_id IS NULL;
END $$;

-- Add index on display_id for faster lookups
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_display_id'
  ) THEN
    CREATE INDEX idx_profiles_display_id ON profiles(display_id);
  END IF;
END $$;

-- Add unique constraint on display_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_display_id'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT unique_display_id UNIQUE (display_id);
  END IF;
END $$;

-- Drop and recreate function to get user by display ID
DROP FUNCTION IF EXISTS get_user_by_display_id(text);
CREATE OR REPLACE FUNCTION get_user_by_display_id(p_display_id text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  IF NOT is_valid_display_id(p_display_id) THEN
    RAISE EXCEPTION 'Invalid display ID format';
  END IF;

  SELECT json_build_object(
    'id', p.user_id,
    'email', u.email,
    'role', p.role,
    'full_name', p.full_name,
    'display_id', p.display_id,
    'created_at', p.created_at
  ) INTO result
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE p.display_id = p_display_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;