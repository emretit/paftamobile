import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../providers/auth_provider.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _obscurePassword = true;
  bool _isEmailFocused = false;
  bool _isPasswordFocused = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    
    ref.listen<AuthState>(authStateProvider, (previous, next) {
      if (next.isAuthenticated) {
        context.go('/home');
      }
      if (next.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.errorMessage!)),
        );
      }
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF2F2F7),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Logo - Web uygulamasındaki gibi merkezi ve büyük
                    _buildLogo(context),
                    const SizedBox(height: 40),
                    
                    // Form Kartı - Web uygulamasındaki gibi
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.08),
                            blurRadius: 24,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(32.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Başlık ve Açıklama - Web uygulamasındaki gibi
                          Text(
                            'Hesabınıza Giriş Yapın',
                            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF000000),
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 8),
                          
                          Text(
                            'PAFTA platformuna hoş geldiniz',
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: const Color(0xFF8E8E93),
                              fontSize: 15,
                            ),
                          ),
                          const SizedBox(height: 32),
                          
                          // Email Field
                          _buildEmailField(context),
                          const SizedBox(height: 20),
                          
                          // Password Field
                          _buildPasswordField(context),
                          const SizedBox(height: 12),
                          
                          // Şifremi Unuttum - Web uygulamasındaki gibi
                          const SizedBox(height: 0),
                          const SizedBox(height: 32),
                          
                          // Login Button - Web uygulamasındaki gibi modern (ok ikonu ile)
                          SizedBox(
                            width: double.infinity,
                            height: 52,
                            child: ElevatedButton(
                              onPressed: authState.isLoading ? null : _signIn,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFE57373), // Web uygulamasındaki açık kırmızı
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shadowColor: Colors.transparent,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(vertical: 16),
                              ),
                              child: authState.isLoading
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2.5,
                                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                      ),
                                    )
                                  : Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          'Giriş Yap',
                                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w600,
                                            fontSize: 16,
                                            letterSpacing: 0.2,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        const Icon(
                                          CupertinoIcons.arrow_right,
                                          color: Colors.white,
                                          size: 18,
                                        ),
                                      ],
                                    ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          
                          // Şifremi Unuttum linki - Web uygulamasındaki gibi
                          Center(
                            child: RichText(
                              text: TextSpan(
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: const Color(0xFF8E8E93),
                                  fontSize: 14,
                                ),
                                children: [
                                  const TextSpan(text: 'Şifremi Unuttum? '),
                                  WidgetSpan(
                                    child: GestureDetector(
                                      onTap: () {
                                        // TODO: Şifre sıfırlama sayfasına yönlendir
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Şifre sıfırlama özelliği yakında eklenecek'),
                                          ),
                                        );
                                      },
                                      child: Text(
                                        'Şifreyi Sıfırla',
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          color: const Color(0xFFD32F2F),
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Alt bilgi veya kayıt ol linki
                    _buildFooter(context),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _signIn() {
    if (_formKey.currentState!.validate()) {
      ref.read(authStateProvider.notifier).signIn(
            _emailController.text,
            _passwordController.text,
          );
    }
  }

  // Logo widget'ı - Web uygulamasındaki gibi
  Widget _buildLogo(BuildContext context) {
    return Center(
      child: Container(
        width: 100,
        height: 100,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(16),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: SvgPicture.asset(
            'assets/images/logo.svg',
            width: 68,
            height: 68,
            fit: BoxFit.contain,
            placeholderBuilder: (context) => Image.asset(
              'assets/images/logo.png',
              width: 68,
              height: 68,
              fit: BoxFit.contain,
            ),
          ),
        ),
      ),
    );
  }

  // Email Field - Web uygulamasındaki gibi gelişmiş
  Widget _buildEmailField(BuildContext context) {
    return Focus(
      onFocusChange: (hasFocus) {
        setState(() {
          _isEmailFocused = hasFocus;
        });
      },
      child: Container(
        decoration: BoxDecoration(
          color: _isEmailFocused 
              ? Colors.white 
              : const Color(0xFFF2F2F7),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: _isEmailFocused 
                ? const Color(0xFFD32F2F) 
                : Colors.transparent,
            width: 2,
          ),
        ),
        child: TextFormField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          decoration: InputDecoration(
            labelText: 'E-posta',
            labelStyle: TextStyle(
              color: _isEmailFocused 
                  ? const Color(0xFFD32F2F) 
                  : const Color(0xFF8E8E93),
              fontSize: 15,
            ),
            hintText: 'ornek@email.com',
            hintStyle: const TextStyle(
              color: Color(0xFFC7C7CC),
              fontSize: 15,
            ),
            prefixIcon: Icon(
              CupertinoIcons.mail,
              color: _isEmailFocused 
                  ? const Color(0xFFD32F2F) 
                  : const Color(0xFF8E8E93),
              size: 22,
            ),
            filled: true,
            fillColor: Colors.transparent,
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
            errorBorder: InputBorder.none,
            focusedErrorBorder: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 18,
            ),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Email adresi gereklidir';
            }
            if (!value.contains('@') || !value.contains('.')) {
              return 'Geçerli bir email adresi giriniz';
            }
            return null;
          },
        ),
      ),
    );
  }

  // Password Field - Web uygulamasındaki gibi gelişmiş
  Widget _buildPasswordField(BuildContext context) {
    return Focus(
      onFocusChange: (hasFocus) {
        setState(() {
          _isPasswordFocused = hasFocus;
        });
      },
      child: Container(
        decoration: BoxDecoration(
          color: _isPasswordFocused 
              ? Colors.white 
              : const Color(0xFFF2F2F7),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: _isPasswordFocused 
                ? const Color(0xFFD32F2F) 
                : Colors.transparent,
            width: 2,
          ),
        ),
        child: TextFormField(
          controller: _passwordController,
          obscureText: _obscurePassword,
          textInputAction: TextInputAction.done,
          onFieldSubmitted: (_) => _signIn(),
          decoration: InputDecoration(
            labelText: 'Şifreniz (en az 8 karakter)',
            labelStyle: TextStyle(
              color: _isPasswordFocused 
                  ? const Color(0xFFD32F2F) 
                  : const Color(0xFF8E8E93),
              fontSize: 15,
            ),
            hintText: '••••••••',
            hintStyle: const TextStyle(
              color: Color(0xFFC7C7CC),
              fontSize: 15,
              letterSpacing: 2,
            ),
            prefixIcon: Icon(
              CupertinoIcons.lock,
              color: _isPasswordFocused 
                  ? const Color(0xFFD32F2F) 
                  : const Color(0xFF8E8E93),
              size: 22,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePassword 
                    ? CupertinoIcons.eye_slash 
                    : CupertinoIcons.eye,
                color: const Color(0xFF8E8E93),
                size: 20,
              ),
              onPressed: () {
                setState(() {
                  _obscurePassword = !_obscurePassword;
                });
              },
            ),
            filled: true,
            fillColor: Colors.transparent,
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
            errorBorder: InputBorder.none,
            focusedErrorBorder: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 18,
            ),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Şifre gereklidir';
            }
            if (value.length < 8) {
              return 'Şifre en az 8 karakter olmalıdır';
            }
            return null;
          },
        ),
      ),
    );
  }

  // Footer - Alt bilgi
  Widget _buildFooter(BuildContext context) {
    return Center(
      child: Column(
        children: [
          Text(
            'PAFTA',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF8E8E93),
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Servis Yönetim Sistemi',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: const Color(0xFFC7C7CC),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
