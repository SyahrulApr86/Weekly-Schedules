/*
  # Add details column to schedules table

  1. Changes
    - Add `details` column to `schedules` table
      - Type: text
      - Nullable: true
      - Default: null
      - Purpose: Store additional information about schedule items

  2. Notes
    - Column is optional to maintain backward compatibility
    - No data migration needed as this is a new column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'schedules' AND column_name = 'details'
  ) THEN
    ALTER TABLE schedules ADD COLUMN details text;
  END IF;
END $$;