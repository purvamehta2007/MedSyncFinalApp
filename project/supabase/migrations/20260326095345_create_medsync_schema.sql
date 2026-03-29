/*
  # MedSync Database Schema

  ## Overview
  Creates the complete database schema for MedSync - a medicine management and safety application.

  ## New Tables
  
  ### 1. `medicines`
  Stores medicine information for users
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text) - Medicine name
  - `description` (text) - Medicine description
  - `dosage` (text) - Dosage amount
  - `unit` (text) - Measurement unit (mg, ml, etc.)
  - `frequency` (text) - How often to take
  - `form` (text) - tablet, capsule, liquid, etc.
  - `manufacturer` (text) - Manufacturer name
  - `expiry_date` (timestamptz) - Expiration date
  - `instructions` (text) - How to take
  - `side_effects` (text) - Possible side effects
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `reminders`
  Manages medication reminders
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `medicine_id` (uuid, references medicines)
  - `reminder_times` (text[]) - Array of times (HH:MM format)
  - `frequency` (text) - daily, weekly, as_needed
  - `days_of_week` (int[]) - For weekly reminders (0-6)
  - `start_date` (timestamptz) - When reminder starts
  - `end_date` (timestamptz) - When reminder ends
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `intakes`
  Tracks medicine intake history
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `medicine_id` (uuid, references medicines)
  - `reminder_id` (uuid, references reminders)
  - `scheduled_time` (timestamptz) - When should be taken
  - `actual_time` (timestamptz) - When actually taken
  - `status` (text) - taken, missed, skipped
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `health_records`
  Stores user health information
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users, unique)
  - `allergies` (text[]) - List of allergies
  - `existing_conditions` (text[]) - Medical conditions
  - `medical_history` (text) - Medical history notes
  - `blood_type` (text) - Blood type
  - `height` (decimal) - Height in cm
  - `weight` (decimal) - Weight in kg
  - `emergency_notes` (text) - Emergency information
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `family_contacts`
  Emergency and family contacts
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text) - Contact name
  - `relationship` (text) - Relationship to user
  - `phone_number` (text) - Phone number
  - `email` (text) - Email address
  - `is_emergency_contact` (boolean) - Is emergency contact
  - `notify_on_missed_dose` (boolean) - Notify on missed doses
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `emergency_alerts`
  Emergency alert tracking
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `alert_type` (text) - Type of emergency
  - `message` (text) - Alert message
  - `location` (text) - Location information
  - `is_resolved` (boolean) - Resolution status
  - `resolved_at` (timestamptz) - When resolved
  - `notified_contacts` (text[]) - List of notified contact IDs
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to access only their own data
  - Separate policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  dosage text DEFAULT '',
  unit text DEFAULT '',
  frequency text DEFAULT '',
  form text DEFAULT '',
  manufacturer text DEFAULT '',
  expiry_date timestamptz,
  instructions text DEFAULT '',
  side_effects text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medicines"
  ON medicines FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medicines"
  ON medicines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medicines"
  ON medicines FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own medicines"
  ON medicines FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medicine_id uuid REFERENCES medicines(id) ON DELETE CASCADE NOT NULL,
  reminder_times text[] DEFAULT '{}',
  frequency text DEFAULT 'daily',
  days_of_week int[],
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create intakes table
CREATE TABLE IF NOT EXISTS intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medicine_id uuid REFERENCES medicines(id) ON DELETE CASCADE NOT NULL,
  reminder_id uuid REFERENCES reminders(id) ON DELETE SET NULL,
  scheduled_time timestamptz NOT NULL,
  actual_time timestamptz,
  status text DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own intakes"
  ON intakes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intakes"
  ON intakes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own intakes"
  ON intakes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own intakes"
  ON intakes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create health_records table
CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  allergies text[] DEFAULT '{}',
  existing_conditions text[] DEFAULT '{}',
  medical_history text DEFAULT '',
  blood_type text DEFAULT '',
  height decimal,
  weight decimal,
  emergency_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health records"
  ON health_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health records"
  ON health_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health records"
  ON health_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health records"
  ON health_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create family_contacts table
CREATE TABLE IF NOT EXISTS family_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  relationship text DEFAULT '',
  phone_number text DEFAULT '',
  email text DEFAULT '',
  is_emergency_contact boolean DEFAULT false,
  notify_on_missed_dose boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE family_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own family contacts"
  ON family_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own family contacts"
  ON family_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own family contacts"
  ON family_contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own family contacts"
  ON family_contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create emergency_alerts table
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_type text NOT NULL,
  message text DEFAULT '',
  location text DEFAULT '',
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  notified_contacts text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emergency alerts"
  ON emergency_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency alerts"
  ON emergency_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency alerts"
  ON emergency_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency alerts"
  ON emergency_alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(user_id);
CREATE INDEX IF NOT EXISTS idx_medicines_is_active ON medicines(is_active);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_medicine_id ON reminders(medicine_id);
CREATE INDEX IF NOT EXISTS idx_intakes_user_id ON intakes(user_id);
CREATE INDEX IF NOT EXISTS idx_intakes_medicine_id ON intakes(medicine_id);
CREATE INDEX IF NOT EXISTS idx_intakes_status ON intakes(status);
CREATE INDEX IF NOT EXISTS idx_family_contacts_user_id ON family_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_user_id ON emergency_alerts(user_id);
