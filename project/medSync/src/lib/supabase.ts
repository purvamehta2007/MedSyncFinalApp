import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Medicine {
  id: string;
  user_id: string;
  name: string;
  description: string;
  dosage: string;
  unit: string;
  frequency: string;
  form: string;
  manufacturer: string;
  expiry_date: string | null;
  instructions: string;
  side_effects: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  medicine_id: string;
  reminder_times: string[];
  frequency: string;
  days_of_week: number[] | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Intake {
  id: string;
  user_id: string;
  medicine_id: string;
  reminder_id: string | null;
  scheduled_time: string;
  actual_time: string | null;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  user_id: string;
  allergies: string[];
  existing_conditions: string[];
  medical_history: string;
  blood_type: string;
  height: number | null;
  weight: number | null;
  emergency_notes: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone_number: string;
  email: string;
  is_emergency_contact: boolean;
  notify_on_missed_dose: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmergencyAlert {
  id: string;
  user_id: string;
  alert_type: string;
  message: string;
  location: string;
  is_resolved: boolean;
  resolved_at: string | null;
  notified_contacts: string[];
  created_at: string;
  updated_at: string;
}
