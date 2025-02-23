/*
  # Update User ID Format

  1. Changes
    - Update prefix format for different user roles
    - Modify ID generation function to handle new prefix format
    - Update existing records with new prefix format
  
  2. Security
    - Maintain existing RLS policies
    - Ensure unique constraints
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_new_user_with_id() CASCADE;
DROP FUNCTION IF EXISTS generate_unique_user_id(boolean) CASCADE;

-- Update prefix column to handle longer prefixes
ALTER TABLE user_ids ALTER COLUMN prefix TYPE varchar(10);

-- Update existing records with new prefix format
UPDATE user_ids 
SET prefix = CASE 
  WHEN is_admin THEN 'Adm-'
  ELSE 'Cli-' -- Default to client prefix for existing records
END;

-- Create function to generate prefixed numeric ID
CREATE FUNCTION generate_unique_user_id(user_role text)
RETURNS TABLE (numeric_id bigint, prefix text) AS $$
DECLARE
  new_id bigint;
  id_prefix text;
  max_attempts int := 100;
  attempt_count int := 0;
BEGIN
  -- Set prefix based on user role
  id_prefix := CASE 
    WHEN user_role = 'admin' THEN 'Adm-'
    WHEN user_role = 'writer' THEN 'Writer-'
    ELSE 'Cli-'
  END;
  
  LOOP
    EXIT WHEN attempt_count >= max_attempts;
    
    -- Generate 6-digit number for all users
    new_id := floor(random() * (999999 - 100000 + 1) + 100000)::bigint;
    
    -- Check if ID is already used
    IF NOT EXISTS (
      SELECT 1 
      FROM user_ids 
      WHERE numeric_id = new_id 
      AND prefix = id_prefix
    ) THEN
      RETURN QUERY SELECT new_id, id_prefix;
      RETURN;
    END IF;
    
    attempt_count := attempt_count + 1;
  END LOOP;
  
  RAISE EXCEPTION 'Could not generate unique ID after % attempts', max_attempts;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user creation
CREATE FUNCTION handle_new_user_with_id()
RETURNS trigger AS $$
DECLARE
  generated_id record;
  user_role text;
BEGIN
  -- Get user role
  user_role := new.raw_user_meta_data->>'role';
  
  -- Generate and assign unique ID with prefix
  SELECT * INTO generated_id FROM generate_unique_user_id(user_role);
  
  INSERT INTO user_ids (numeric_id, prefix, user_id, is_admin)
  VALUES (
    generated_id.numeric_id,
    generated_id.prefix,
    new.id,
    user_role = 'admin'
  );
  
  -- Create profile
  INSERT INTO public.profiles (user_id, role, full_name)
  VALUES (
    new.id,
    user_role,
    new.raw_user_meta_data->>'full_name'
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger for user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_with_id();

-- Ensure unique constraint for prefix + numeric_id combination
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_prefixed_id'
  ) THEN
    ALTER TABLE user_ids
    ADD CONSTRAINT unique_prefixed_id UNIQUE (prefix, numeric_id);
  END IF;
END $$;