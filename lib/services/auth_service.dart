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

  // Kullanıcının company_id'sini profiles tablosundan çek
  Future<app_models.User?> getCurrentUserWithCompany() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return null;
    
    try {
      // Profiles tablosundan company_id'yi çek
      final profileResponse = await _supabase
          .from('profiles')
          .select('company_id, full_name')
          .eq('id', user.id)
          .maybeSingle();
      
      return app_models.User(
        id: user.id,
        email: user.email ?? '',
        fullName: profileResponse?['full_name'] ?? user.userMetadata?['full_name'],
        companyId: profileResponse?['company_id'],
      );
    } catch (e) {
      print('Profile getirme hatası: $e');
      // Hata durumunda company_id olmadan döndür
      return app_models.User(
        id: user.id,
        email: user.email ?? '',
        fullName: user.userMetadata?['full_name'],
      );
    }
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
