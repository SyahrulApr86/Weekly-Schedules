/*
  # Fix column names in schedules table

  1. Changes
    - Rename columns to use snake_case:
      - `startTime` -> `starttime`
      - `endTime` -> `endtime`
    
  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can insert own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can delete own schedules" ON schedules;

-- Rename columns to use snake_case
DO $$ 
BEGIN
  ALTER TABLE schedules RENAME COLUMN "startTime" TO starttime;
  ALTER TABLE schedules RENAME COLUMN "endTime" TO endtime;
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