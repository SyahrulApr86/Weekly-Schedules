/*
  # Remove default schedule concept

  1. Changes
    - Remove is_default column from schedule_groups
    - Remove unique_default_per_user constraint
    - Update existing data to work without defaults

  2. Security
    - No changes to RLS policies needed
*/

-- Remove the unique constraint first
ALTER TABLE schedule_groups DROP CONSTRAINT IF EXISTS unique_default_per_user;

-- Remove the is_default column
ALTER TABLE schedule_groups DROP COLUMN IF EXISTS is_default;

-- Update the table to ensure data consistency
UPDATE schedule_groups
SET name = CASE 
  WHEN name = 'Default Schedule' THEN 'My Schedule'
  ELSE name
END;