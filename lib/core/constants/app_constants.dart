import '../config/env_config.dart';

class AppConstants {
  static const String appName = 'Pafta Mobile';
  static const String appVersion = '1.0.0';
  
  // Supabase Configuration - Environment variables kullanılıyor
  static String get supabaseUrl => EnvConfig.supabaseUrl;
  static String get supabaseAnonKey => EnvConfig.supabaseAnonKey;
  
  // API Endpoints
  static const String baseUrl = 'https://api.pafta.com';
  
  // Storage Keys
  static const String userTokenKey = 'user_token';
  static const String userDataKey = 'user_data';
  static const String settingsKey = 'app_settings';
  
  // UI Constants
  static const double defaultPadding = 16.0;
  static const double defaultRadius = 8.0;
  static const double defaultElevation = 2.0;
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
}
