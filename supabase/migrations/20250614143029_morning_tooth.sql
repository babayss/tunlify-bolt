/*
  # Remove target_ip and target_port requirements for ngrok-style tunneling

  1. Changes
    - Make target_ip and target_port nullable (optional)
    - These will be specified by the client when connecting
    - Tunnel creation only needs subdomain and location

  2. Security
    - Maintain existing RLS policies
    - No changes to authentication or authorization
*/

-- Make target_ip and target_port nullable for ngrok-style tunneling
DO $$
BEGIN
  -- Remove NOT NULL constraint from target_ip if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tunnels' 
    AND column_name = 'target_ip' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tunnels ALTER COLUMN target_ip DROP NOT NULL;
  END IF;

  -- Remove NOT NULL constraint from target_port if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tunnels' 
    AND column_name = 'target_port' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tunnels ALTER COLUMN target_port DROP NOT NULL;
  END IF;
END $$;

-- Add comment to explain the change
COMMENT ON COLUMN tunnels.target_ip IS 'Target IP address - nullable for ngrok-style tunneling where client specifies local address';
COMMENT ON COLUMN tunnels.target_port IS 'Target port - nullable for ngrok-style tunneling where client specifies local port';