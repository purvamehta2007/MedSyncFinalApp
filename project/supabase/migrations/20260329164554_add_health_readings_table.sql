/*
  # Add Health Readings Table

  ## Overview
  Creates the health_readings table for tracking daily health metrics like blood pressure, blood sugar, and temperature.

  ## New Tables

  ### health_readings
  Stores daily health metrics (BP, sugar, temperature).
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `reading_date` (date) - Date of the reading
  - `blood_pressure_systolic` (integer, nullable) - Systolic BP
  - `blood_pressure_diastolic` (integer, nullable) - Diastolic BP
  - `blood_sugar` (numeric, nullable) - Blood sugar level in mg/dL
  - `temperature` (numeric, nullable) - Body temperature in Celsius
  - `heart_rate` (integer, nullable) - Heart rate in BPM
  - `notes` (text) - Additional notes
  - `created_at`, `updated_at` (timestamps)

  ## Security
  - Row Level Security (RLS) enabled
  - Users can only access their own health readings
  - Separate policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Create health_readings table
CREATE TABLE IF NOT EXISTS health_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reading_date date DEFAULT CURRENT_DATE,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  blood_sugar numeric,
  temperature numeric,
  heart_rate integer,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE health_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health readings"
  ON health_readings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health readings"
  ON health_readings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health readings"
  ON health_readings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health readings"
  ON health_readings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_health_readings_user_id ON health_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_health_readings_date ON health_readings(user_id, reading_date DESC);