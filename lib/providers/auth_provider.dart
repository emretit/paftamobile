import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import '../models/user.dart' as app_models;

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authServiceProvider));
});

class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final app_models.User? user;
  final String? errorMessage;

  AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.user,
    this.errorMessage,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    app_models.User? user,
    String? errorMessage,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(AuthState()) {
    _init();
  }

  void _init() {
    final user = _authService.currentUser;
    state = state.copyWith(
      isAuthenticated: user != null,
      user: user,
    );
  }

  Future<void> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    
    final success = await _authService.signInWithEmail(email, password);
    
    if (success) {
      final user = _authService.currentUser;
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: user,
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.',
      );
    }
  }

  Future<void> signOut() async {
    await _authService.signOut();
    state = AuthState();
  }
}
