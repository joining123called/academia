/*
  # Add Display ID and User Management Functions

  1. Changes
    - Add display_id column to profiles table
    - Add functions for ID formatting and validation
    - Add functions for user management
    - Add proper indexes and constraints

  2. Security
    - Enable RLS on all tables
    - Add proper policies for data access
    - Set proper search paths for functions
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
$$ LANGUAGE plpgsql IMMUTABLE
SET search_path = public;

-- Create function to validate display ID format
CREATE OR REPLACE FUNCTION is_valid_display_id(display_id text)
RETURNS boolean AS $$
BEGIN
  RETURN display_id ~ '^(Adm|Wri|Cli)-\d{6}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE
SET search_path = public;

-- Create function to generate unique numeric ID
CREATE OR REPLACE FUNCTION generate_unique_numeric_id()
RETURNS bigint AS $$
DECLARE
  new_id bigint;
  max_attempts int := 100;
  attempt_count int := 0;
BEGIN
  LOOP
    EXIT WHEN attempt_count >= max_attempts;
    
    -- Generate 6-digit number
    new_id := floor(random() * (999999 - 100000 + 1) + 100000)::bigint;
    
    -- Check if ID is already used
    IF NOT EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE display_id LIKE '%' || LPAD(new_id::text, 6, '0')
    ) THEN
      RETURN new_id;
    END IF;
    
    attempt_count := attempt_count + 1;
  END LOOP;
  
  RAISE EXCEPTION 'Could not generate unique ID after % attempts', max_attempts;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Create function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS trigger AS $$
BEGIN
  -- Delete profile first
  DELETE FROM public.profiles WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Create trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_deletion();

-- Update user creation function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  numeric_id bigint;
  user_role text;
  formatted_id text;
BEGIN
  -- Get user role with validation
  user_role := LOWER(new.raw_user_meta_data->>'role');
  
  -- Validate role
  IF user_role NOT IN ('admin', 'writer', 'client') THEN
    RAISE EXCEPTION 'Invalid user role: %', user_role;
  END IF;
  
  -- Generate numeric ID
  numeric_id := generate_unique_numeric_id();
  
  -- Format the display ID
  formatted_id := format_display_id(user_role, numeric_id);
  
  -- Create profile with display_id
  BEGIN
    INSERT INTO public.profiles (
      user_id,
      role,
      full_name,
      display_id,
      created_at
    )
    VALUES (
      new.id,
      user_role,
      new.raw_user_meta_data->>'full_name',
      formatted_id,
      now()
    );
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'Failed to create user profile';
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger for user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add index on display_id for faster lookups if it doesn't exist
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

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to get user by display ID
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;