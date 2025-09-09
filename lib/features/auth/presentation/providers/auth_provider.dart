import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Auth State
class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
  });

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    User? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Auth Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _init();
  }

  void _init() {
    // Listen to auth state changes
    Supabase.instance.client.auth.onAuthStateChange.listen((data) {
      state = state.copyWith(
        user: data.session?.user,
        isLoading: false,
        error: null,
      );
    });
  }

  Future<void> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final response = await Supabase.instance.client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      
      if (response.user != null) {
        state = state.copyWith(
          user: response.user,
          isLoading: false,
          error: null,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> signOut() async {
    state = state.copyWith(isLoading: true);
    
    try {
      await Supabase.instance.client.auth.signOut();
      state = state.copyWith(
        user: null,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> signUp(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final response = await Supabase.instance.client.auth.signUp(
        email: email,
        password: password,
      );
      
      if (response.user != null) {
        state = state.copyWith(
          user: response.user,
          isLoading: false,
          error: null,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> checkAuthStatus() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final session = Supabase.instance.client.auth.currentSession;
      state = state.copyWith(
        user: session?.user,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
}

// Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
