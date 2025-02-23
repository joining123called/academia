/*
  # User ID System Implementation

  1. New Tables
    - `user_ids`
      - `id` (uuid, primary key)
      - `numeric_id` (bigint, unique) - The unique 6-digit ID
      - `user_id` (uuid) - Reference to auth.users
      - `created_at` (timestamptz)
      - `is_admin` (boolean) - Flag to identify admin accounts
      
  2. Security
    - Enable RLS on `user_ids` table
    - Add policies for secure access
    
  3. Functions
    - Function to generate unique numeric ID
    - Function to assign ID on user creation
*/

-- Create user_ids table
CREATE TABLE IF NOT EXISTS user_ids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numeric_id bigint UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_admin boolean DEFAULT false,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_ids ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own ID"
  ON user_ids
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to generate unique numeric ID
CREATE OR REPLACE FUNCTION generate_unique_user_id(is_admin_account boolean)
RETURNS bigint AS $$
DECLARE
  new_id bigint;
  max_attempts int := 100;
  attempt_count int := 0;
BEGIN
  LOOP
    EXIT WHEN attempt_count >= max_attempts;
    
    -- For admin accounts, use a fixed length 6-digit number
    IF is_admin_account THEN
      new_id := floor(random() * (999999 - 100000 + 1) + 100000)::bigint;
    ELSE
      -- For regular users, use a number between 100000 and 80,000,000,000,000,000,000,00
      new_id := floor(random() * (80000000000000000000000 - 100000 + 1) + 100000)::bigint;
    END IF;
    
    -- Check if ID is already used
    IF NOT EXISTS (SELECT 1 FROM user_ids WHERE numeric_id = new_id) THEN
      RETURN new_id;
    END IF;
    
    attempt_count := attempt_count + 1;
  END LOOP;
  
  RAISE EXCEPTION 'Could not generate unique ID after % attempts', max_attempts;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation and ID assignment
CREATE OR REPLACE FUNCTION handle_new_user_with_id()
RETURNS trigger AS $$
BEGIN
  -- Check if user is admin
  DECLARE
    is_admin_account boolean := new.raw_user_meta_data->>'role' = 'admin';
  BEGIN
    -- Generate and assign unique ID
    INSERT INTO user_ids (numeric_id, user_id, is_admin)
    VALUES (
      generate_unique_user_id(is_admin_account),
      new.id,
      is_admin_account
    );
    
    -- Create profile
    INSERT INTO public.profiles (user_id, role, full_name)
    VALUES (
      new.id,
      new.raw_user_meta_data->>'role',
      new.raw_user_meta_data->>'full_name'
    );
    
    RETURN new;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger for user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_with_id();