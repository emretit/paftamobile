import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user.dart' as app_models;

class AuthService {
  final SupabaseClient _supabase = Supabase.instance.client;

  app_models.User? get currentUser {
    final user = _supabase.auth.currentUser;
    if (user == null) return null;
    
    return app_models.User(
      id: user.id,
      email: user.email ?? '',
      fullName: user.userMetadata?['full_name'],
    );
  }

  bool get isAuthenticated => currentUser != null;

  Future<bool> signInWithEmail(String email, String password) async {
    try {
      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );
      return response.user != null;
    } catch (e) {
      print('Auth error: $e');
      return false;
    }
  }

  Future<void> signOut() async {
    await _supabase.auth.signOut();
  }
}
