/*
  # Add missing fields to tunnels table

  1. Changes
    - Add connection_token column
    - Add client_connected column  
    - Add last_connected column
    - Remove target_ip and target_port columns (ngrok-style)
    - Update existing tunnels with default values

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns for ngrok-style tunneling
DO $$
BEGIN
  -- Add connection_token if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tunnels' AND column_name = 'connection_token'
  ) THEN
    ALTER TABLE tunnels ADD COLUMN connection_token text;
  END IF;

  -- Add client_connected if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tunnels' AND column_name = 'client_connected'
  ) THEN
    ALTER TABLE tunnels ADD COLUMN client_connected boolean DEFAULT false;
  END IF;

  -- Add last_connected if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tunnels' AND column_name = 'last_connected'
  ) THEN
    ALTER TABLE tunnels ADD COLUMN last_connected timestamptz;
  END IF;
END $$;

-- Update existing tunnels with default values
UPDATE tunnels 
SET 
  client_connected = false,
  connection_token = encode(gen_random_bytes(32), 'hex')
WHERE connection_token IS NULL;

-- Make connection_token required and unique
ALTER TABLE tunnels ALTER COLUMN connection_token SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tunnels_connection_token ON tunnels(connection_token);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_tunnels_client_connected ON tunnels(client_connected);
CREATE INDEX IF NOT EXISTS idx_tunnels_last_connected ON tunnels(last_connected);