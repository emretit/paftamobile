import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'router/app_router.dart';
import 'services/firebase_messaging_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    // Firebase'i başlat
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    print('Firebase başarıyla başlatıldı');
  } catch (e) {
    print('Firebase başlatma hatası: $e');
    // Firebase başlatılamadıysa uygulamayı durdurma, sadece log yaz
  }
  
  try {
    // Supabase'i başlat
    await Supabase.initialize(
      url: 'https://vwhwufnckpqirxptwncw.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aHd1Zm5ja3BxaXJ4cHR3bmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODI5MjAsImV4cCI6MjA1NDk1ODkyMH0.Wjw8MAnsBrHxB6-J-bNGObgDQ4fl3zPYrgYI5tOrcKo',
      realtimeClientOptions: const RealtimeClientOptions(
        logLevel: RealtimeLogLevel.info,
        timeout: Duration(seconds: 30),
      ),
      authOptions: const FlutterAuthClientOptions(
        autoRefreshToken: false, // Auto refresh'i kapat
      ),
      storageOptions: const StorageClientOptions(
        retryAttempts: 5,
      ),
    );
    print('Supabase başarıyla başlatıldı');
  } catch (e) {
    print('Supabase başlatma hatası: $e');
  }
  
  try {
    // Firebase Messaging'i başlat
    await FirebaseMessagingService.initialize();
    print('Firebase Messaging başarıyla başlatıldı');
  } catch (e) {
    print('Firebase Messaging başlatma hatası: $e');
  }
  
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    
    return MaterialApp.router(
      title: 'PAFTA Field Service',
      theme: _buildIOSTheme(),
      routerConfig: router,
    );
  }

  ThemeData _buildIOSTheme() {
    return ThemeData(
      // PAFTA brand renk paleti
      useMaterial3: true,
      primarySwatch: Colors.red,
      primaryColor: const Color(0xFFB73D3D), // PAFTA kırmızı
      
      // iOS benzeri fontlar
      fontFamily: 'SF Pro Display',
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 34,
          fontWeight: FontWeight.bold,
          color: Color(0xFF000000),
          letterSpacing: -0.41,
        ),
        headlineLarge: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: Color(0xFF000000),
          letterSpacing: -0.36,
        ),
        headlineMedium: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: Color(0xFF000000),
          letterSpacing: -0.26,
        ),
        titleLarge: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: Color(0xFF000000),
          letterSpacing: -0.45,
        ),
        titleMedium: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: Color(0xFF000000),
          letterSpacing: -0.32,
        ),
        bodyLarge: TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w400,
          color: Color(0xFF000000),
          letterSpacing: -0.41,
        ),
        bodyMedium: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w400,
          color: Color(0xFF000000),
          letterSpacing: -0.24,
        ),
        labelLarge: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: Color(0xFF8E8E93),
          letterSpacing: -0.08,
        ),
      ),
      
      // iOS benzeri AppBar tema
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFFF2F2F7),
        foregroundColor: Color(0xFF000000),
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w600,
          color: Color(0xFF000000),
          letterSpacing: -0.41,
        ),
        systemOverlayStyle: SystemUiOverlayStyle.dark,
      ),
      
      // iOS benzeri card tema
      cardTheme: const CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      ),
      
      // PAFTA brand buton temaları
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFB73D3D),
          foregroundColor: Colors.white,
          elevation: 0,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          textStyle: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.41,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
      
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: const Color(0xFFB73D3D),
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          textStyle: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.41,
          ),
        ),
      ),
      
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: const Color(0xFFB73D3D),
          textStyle: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w400,
            letterSpacing: -0.41,
          ),
        ),
      ),
      
      // iOS benzeri input tema
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFF2F2F7),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFB73D3D), width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        hintStyle: const TextStyle(
          color: Color(0xFF8E8E93),
          fontSize: 17,
          fontWeight: FontWeight.w400,
          letterSpacing: -0.41,
        ),
      ),
      
      // iOS benzeri scaffold tema
      scaffoldBackgroundColor: const Color(0xFFF2F2F7),
      
      // iOS benzeri liste tema
      listTileTheme: const ListTileThemeData(
        tileColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
      
      // iOS benzeri divider tema
      dividerTheme: const DividerThemeData(
        color: Color(0xFFE5E5EA),
        thickness: 0.5,
        space: 1,
      ),
      
      // PAFTA brand navigasyon tema
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Color(0xFFF2F2F7),
        selectedItemColor: Color(0xFFB73D3D),
        unselectedItemColor: Color(0xFF8E8E93),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedLabelStyle: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.06,
        ),
        unselectedLabelStyle: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w400,
          letterSpacing: -0.06,
        ),
      ),
      
      // PAFTA brand renk şeması
      colorScheme: const ColorScheme.light(
        primary: Color(0xFFB73D3D),
        secondary: Color(0xFFD17979),
        surface: Colors.white,
        background: Color(0xFFF2F2F7),
        error: Color(0xFFFF3B30),
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: Color(0xFF000000),
        onBackground: Color(0xFF000000),
        onError: Colors.white,
      ),
    );
  }
}