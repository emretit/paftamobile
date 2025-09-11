import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user.dart' as app_models;
import 'firebase_messaging_service.dart';

class AuthService {
  SupabaseClient get _supabase {
    try {
      return Supabase.instance.client;
    } catch (e) {
      print('Supabase henüz başlatılmamış: $e');
      throw Exception('Supabase başlatılmamış');
    }
  }

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
      
      if (response.user != null) {
        // Kullanıcı giriş yaptığında FCM token'ını kaydet
        await FirebaseMessagingService.saveTokenForCurrentUser();
        return true;
      }
      return false;
    } catch (e) {
      print('Auth error: $e');
      return false;
    }
  }

  Future<void> signOut() async {
    await _supabase.auth.signOut();
  }
}
