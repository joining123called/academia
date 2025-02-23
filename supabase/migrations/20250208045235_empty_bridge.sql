/*
  # Fix Authentication Issues

  1. Changes
    - Add proper error handling for profile fetching
    - Update profile queries to use maybeSingle()
    - Add missing indexes for performance
    - Update RLS policies for better security

  2. Security
    - Ensure proper RLS policies
    - Add better error handling
*/

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update profile fetching function with better error handling
CREATE OR REPLACE FUNCTION get_profile_by_user_id(user_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
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
  WHERE p.user_id = user_id;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Update RLS policies for better security
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

-- Add policy for admin to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Function to safely get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE user_id = user_id;
  
  RETURN user_role;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;