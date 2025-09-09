import 'package:flutter/foundation.dart';

class EnvConfig {
  // Production değerler - sadece build time'da set edilir
  static const String _supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://vwhwufnckpqirxptwncw.supabase.co',
  );
  
  static const String _supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aHd1Zm5ja3BxaXJ4cHR3bmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODI5MjAsImV4cCI6MjA1NDk1ODkyMH0.Wjw8MAnsBrHxB6-J-bNGObgDQ4fl3zPYrgYI5tOrcKo',
  );

  static String get supabaseUrl {
    // Debug modda da production URL'yi kullan
    return _supabaseUrl;
  }

  static String get supabaseAnonKey {
    // Debug modda da production key'i kullan
    return _supabaseAnonKey;
  }
}
