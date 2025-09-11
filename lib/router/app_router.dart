import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../pages/login_page.dart';
import '../pages/home_page_new.dart';
import '../pages/service_requests_list_page.dart';
import '../pages/service_request_detail_page.dart';
import '../pages/service_request_form_page.dart';
import '../pages/service_slip_form_page.dart';
import '../pages/service_slip_view_page.dart';
import '../pages/customers_page.dart';
import '../pages/profile_page.dart';
import '../pages/notifications_page.dart';
import '../pages/notification_settings_page.dart';
import '../shared/layouts/main_layout.dart';

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
      // Ana sayfalar - Shell Route ile sabit bottom bar
      ShellRoute(
        builder: (context, state, child) => MainLayout(
          currentRoute: state.uri.path,
          child: child,
        ),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomePageNew(),
          ),
          GoRoute(
            path: '/service-requests',
            builder: (context, state) => const ServiceRequestsListPage(),
          ),
          GoRoute(
            path: '/service-requests/create',
            builder: (context, state) => const ServiceRequestFormPage(),
          ),
          GoRoute(
            path: '/customers',
            builder: (context, state) => const CustomersPage(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfilePage(),
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationsPage(),
          ),
        ],
      ),
      // Alt sayfalar - bottom bar olmadan
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
        path: '/service-requests/:id/slip',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return ServiceSlipFormPage(serviceRequestId: id);
        },
      ),
      GoRoute(
        path: '/service-requests/:id/slip/view',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return ServiceSlipViewPage(serviceRequestId: id);
        },
      ),
      GoRoute(
        path: '/notification-settings',
        builder: (context, state) => const NotificationSettingsPage(),
      ),
    ],
  );
});
