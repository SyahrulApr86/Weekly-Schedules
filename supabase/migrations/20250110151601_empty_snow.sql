/*
  # Fix column names consistency in schedules table

  1. Changes
    - Ensure consistent snake_case naming:
      - `starttime` -> `start_time`
      - `endtime` -> `end_time`
    
  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can insert own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can delete own schedules" ON schedules;

-- Rename columns to consistent snake_case
DO $$ 
BEGIN
  ALTER TABLE schedules RENAME COLUMN starttime TO start_time;
  ALTER TABLE schedules RENAME COLUMN endtime TO end_time;
EXCEPTION
  WHEN undefined_column THEN
    NULL;
END $$;

-- Recreate policies
CREATE POLICY "Users can read own schedules"
  ON schedules
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules"
  ON schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules"
  ON schedules
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);