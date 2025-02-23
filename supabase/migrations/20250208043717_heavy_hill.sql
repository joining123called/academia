/*
  # Fix Authentication Functions and Security

  1. Changes
    - Add search_path settings to all functions
    - Fix user deletion cascade
    - Update authentication functions
    - Add proper security contexts

  2. Security
    - Set explicit search paths
    - Add proper security barriers
    - Fix function permissions
*/

-- Set proper search path for all functions
ALTER FUNCTION format_display_id(text, bigint) 
SET search_path = public;

ALTER FUNCTION is_valid_display_id(text) 
SET search_path = public;

ALTER FUNCTION get_user_by_display_id(text) 
SET search_path = public, auth;

ALTER FUNCTION handle_new_user_with_id() 
SET search_path = public, auth;

ALTER FUNCTION generate_unique_user_id(text) 
SET search_path = public;

-- Add cascade delete trigger
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS trigger AS $$
BEGIN
  -- Delete from user_ids first (due to foreign key)
  DELETE FROM public.user_ids WHERE user_id = OLD.id;
  
  -- Delete from profiles
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
CREATE OR REPLACE FUNCTION handle_new_user_with_id()
RETURNS trigger AS $$
DECLARE
  generated_id record;
  user_role text;
  formatted_id text;
BEGIN
  -- Get user role with validation
  user_role := LOWER(new.raw_user_meta_data->>'role');
  
  -- Validate role
  IF user_role NOT IN ('admin', 'writer', 'client') THEN
    RAISE EXCEPTION 'Invalid user role: %', user_role;
  END IF;
  
  -- Generate and assign unique ID with prefix
  SELECT * INTO generated_id FROM generate_unique_user_id(user_role);
  
  -- Format the display ID
  formatted_id := format_display_id(user_role, generated_id.numeric_id);
  
  -- Insert into user_ids with error handling
  BEGIN
    INSERT INTO public.user_ids (numeric_id, prefix, user_id, is_admin)
    VALUES (
      generated_id.numeric_id,
      generated_id.prefix,
      new.id,
      user_role = 'admin'
    );
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'Failed to generate unique user ID';
  END;
  
  -- Create profile with display_id
  BEGIN
    INSERT INTO public.profiles (user_id, role, full_name, display_id)
    VALUES (
      new.id,
      user_role,
      new.raw_user_meta_data->>'full_name',
      formatted_id
    );
  EXCEPTION WHEN unique_violation THEN
    -- Clean up user_ids entry if profile creation fails
    DELETE FROM public.user_ids WHERE user_id = new.id;
    RAISE EXCEPTION 'Failed to create user profile';
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Update RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add function to safely delete user
CREATE OR REPLACE FUNCTION delete_user(user_id uuid)
RETURNS boolean AS $$
DECLARE
  success boolean;
BEGIN
  -- Begin transaction
  BEGIN
    -- Delete auth user (this will trigger cascade delete)
    DELETE FROM auth.users WHERE id = user_id;
    success := true;
  EXCEPTION WHEN OTHERS THEN
    success := false;
  END;
  
  RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;