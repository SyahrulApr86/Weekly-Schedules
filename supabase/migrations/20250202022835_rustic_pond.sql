/*
  # Add update policy for schedules table

  1. Changes
    - Add UPDATE policy for schedules table to allow users to update their own schedules
*/

CREATE POLICY "Users can update own schedules"
  ON schedules
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);