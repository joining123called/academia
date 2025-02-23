/*
  # Support Ticketing System Schema

  1. New Tables
    - `support_tickets`
      - `id` (uuid, primary key)
      - `ticket_number` (text, unique)
      - `user_id` (uuid, references auth.users)
      - `subject` (text)
      - `description` (text)
      - `status` (text)
      - `priority` (text)
      - `category` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `closed_at` (timestamptz)
      - `assigned_to` (uuid, references auth.users)
    
    - `ticket_messages`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references support_tickets)
      - `user_id` (uuid, references auth.users)
      - `message` (text)
      - `created_at` (timestamptz)
      - `is_internal` (boolean)
      - `attachments` (jsonb)

    - `ticket_status_history`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references support_tickets)
      - `old_status` (text)
      - `new_status` (text)
      - `changed_by` (uuid, references auth.users)
      - `changed_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for ticket access and management
*/

-- Create enum types for ticket status and priority
CREATE TYPE ticket_status AS ENUM (
  'Open',
  'In Progress',
  'Answered',
  'On Hold',
  'Closed'
);

CREATE TYPE ticket_priority AS ENUM (
  'Low',
  'Medium',
  'High',
  'Critical'
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status ticket_status NOT NULL DEFAULT 'Open',
  priority ticket_priority NOT NULL DEFAULT 'Medium',
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  assigned_to uuid REFERENCES auth.users,
  CONSTRAINT valid_ticket_number CHECK (ticket_number ~ '^TKT-\d{6}$')
);

-- Create ticket_messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_internal boolean DEFAULT false,
  attachments jsonb DEFAULT '[]'::jsonb
);

-- Create ticket_status_history table
CREATE TABLE IF NOT EXISTS ticket_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets ON DELETE CASCADE NOT NULL,
  old_status ticket_status,
  new_status ticket_status NOT NULL,
  changed_by uuid REFERENCES auth.users NOT NULL,
  changed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies for support_tickets
CREATE POLICY "Users can view their own tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can create tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create policies for ticket_messages
CREATE POLICY "Users can view messages for their tickets"
  ON ticket_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_id
      AND (
        t.user_id = auth.uid() OR
        t.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE id = auth.uid()
          AND raw_user_meta_data->>'role' = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can create messages"
  ON ticket_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_id
      AND (
        t.user_id = auth.uid() OR
        t.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE id = auth.uid()
          AND raw_user_meta_data->>'role' = 'admin'
        )
      )
    )
  );

-- Create policies for ticket_status_history
CREATE POLICY "Users can view status history for their tickets"
  ON ticket_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_id
      AND (
        t.user_id = auth.uid() OR
        t.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE id = auth.uid()
          AND raw_user_meta_data->>'role' = 'admin'
        )
      )
    )
  );

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text AS $$
DECLARE
  new_number text;
  max_attempts int := 100;
  attempt_count int := 0;
BEGIN
  LOOP
    EXIT WHEN attempt_count >= max_attempts;
    
    -- Generate 6-digit number
    new_number := 'TKT-' || LPAD(floor(random() * 999999 + 1)::text, 6, '0');
    
    -- Check if number is already used
    IF NOT EXISTS (
      SELECT 1 FROM support_tickets WHERE ticket_number = new_number
    ) THEN
      RETURN new_number;
    END IF;
    
    attempt_count := attempt_count + 1;
  END LOOP;
  
  RAISE EXCEPTION 'Could not generate unique ticket number after % attempts', max_attempts;
END;
$$ LANGUAGE plpgsql;

-- Function to handle ticket status changes
CREATE OR REPLACE FUNCTION handle_ticket_status_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ticket_status_history (
      ticket_id,
      old_status,
      new_status,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid()
    );
    
    -- Update closed_at timestamp if status changes to Closed
    IF NEW.status = 'Closed' THEN
      NEW.closed_at := now();
    END IF;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for ticket status changes
CREATE TRIGGER on_ticket_status_change
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION handle_ticket_status_change();

-- Create indexes for better performance
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_status_history_ticket_id ON ticket_status_history(ticket_id);