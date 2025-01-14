/*
  # Add support for multiple schedules per user

  1. New Tables
    - `schedule_groups`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `created_at` (timestamptz)
      - `is_default` (boolean)

  2. Changes to Existing Tables
    - Add `group_id` to `schedules` table
    - Add foreign key constraint to `schedule_groups`

  3. Security
    - Enable RLS on `schedule_groups`
    - Add policies for CRUD operations
*/

-- Create schedule_groups table
CREATE TABLE schedule_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_default boolean DEFAULT false,
  CONSTRAINT unique_default_per_user UNIQUE (user_id, is_default)
);

-- Enable RLS
ALTER TABLE schedule_groups ENABLE ROW LEVEL SECURITY;

-- Add group_id to schedules
ALTER TABLE schedules 
ADD COLUMN group_id uuid REFERENCES schedule_groups(id) ON DELETE CASCADE;

-- Create default groups for existing users
DO $$ 
BEGIN
  INSERT INTO schedule_groups (user_id, name, is_default)
  SELECT DISTINCT user_id, 'Default Schedule', true
  FROM schedules;

  -- Update existing schedules to use the default group
  UPDATE schedules s
  SET group_id = sg.id
  FROM schedule_groups sg
  WHERE s.user_id = sg.user_id AND sg.is_default = true;
END $$;

-- Make group_id NOT NULL after migration
ALTER TABLE schedules ALTER COLUMN group_id SET NOT NULL;

-- Create policies for schedule_groups
CREATE POLICY "Users can read own schedule groups"
  ON schedule_groups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedule groups"
  ON schedule_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedule groups"
  ON schedule_groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedule groups"
  ON schedule_groups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);