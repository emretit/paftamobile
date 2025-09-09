import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../pages/login_page.dart';
import '../pages/home_page.dart';
import '../pages/service_requests_list_page.dart';
import '../pages/service_request_detail_page.dart';
import '../pages/service_request_form_page.dart';
import '../pages/profile_page.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final isLoginRoute = state.uri.path == '/login';
      
      if (!isAuthenticated && !isLoginRoute) {
        return '/login';
      }
      
      if (isAuthenticated && isLoginRoute) {
        return '/home';
      }
      
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomePage(),
      ),
      // Service Requests Routes
      GoRoute(
        path: '/service-requests',
        builder: (context, state) => const ServiceRequestsListPage(),
      ),
      GoRoute(
        path: '/service-requests/create',
        builder: (context, state) => const ServiceRequestFormPage(),
      ),
      GoRoute(
        path: '/service-requests/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return ServiceRequestDetailPage(id: id);
        },
      ),
      GoRoute(
        path: '/service-requests/:id/edit',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return ServiceRequestFormPage(id: id);
        },
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfilePage(),
      ),
    ],
  );
});
