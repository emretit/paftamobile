/**
 * Supabase Client - Centralized Supabase configuration
 * 
 * This module provides a single Supabase client instance for the entire application.
 * Uses environment variables for configuration and ensures type safety.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = "https://vwhwufnckpqirxptwncw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aHd1Zm5ja3BxaXJ4cHR3bmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODI5MjAsImV4cCI6MjA1NDk1ODkyMH0.Wjw8MAnsBrHxB6-J-bNGObgDQ4fl3zPYrgYI5tOrcKo";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);