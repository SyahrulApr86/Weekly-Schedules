/*
  # Create schedules table with proper column names

  1. New Tables
    - `schedules`
      - `id` (uuid, primary key) - Unique identifier for each schedule
      - `user_id` (uuid) - References auth.users for ownership
      - `day` (text) - Day of the week
      - `start_time` (text) - Schedule start time
      - `end_time` (text) - Schedule end time
      - `activity` (text) - Name of the scheduled activity
      - `color` (text) - Color theme for the schedule item
      - `created_at` (timestamptz) - Timestamp of creation

  2. Security
    - Enable RLS on schedules table
    - Add policies for:
      - Reading own schedules
      - Inserting own schedules
      - Deleting own schedules
*/

-- Drop existing table if it exists to ensure clean state
DROP TABLE IF EXISTS schedules;

-- Create schedules table
CREATE TABLE schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  day text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  activity text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own schedules" ON schedules;
  DROP POLICY IF EXISTS "Users can insert own schedules" ON schedules;
  DROP POLICY IF EXISTS "Users can delete own schedules" ON schedules;
END $$;

-- Create new policies
CREATE POLICY "Users can read own schedules"
ON schedules FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules"
ON schedules FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules"
ON schedules FOR DELETE
TO authenticated
USING (auth.uid() = user_id);