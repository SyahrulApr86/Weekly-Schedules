/*
  # Create schedules table and security policies

  1. New Tables
    - `schedules`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `day` (text)
      - `startTime` (text)
      - `endTime` (text)
      - `activity` (text)
      - `color` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `schedules` table
    - Add policies for authenticated users to:
      - Read their own schedules
      - Insert their own schedules
      - Delete their own schedules
*/

CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  day text NOT NULL,
  startTime text NOT NULL,
  endTime text NOT NULL,
  activity text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

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