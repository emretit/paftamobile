import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/notification_provider.dart';
import '../../providers/auth_provider.dart';

class MainLayout extends ConsumerWidget {
  final String currentRoute;
  final Widget child;

  const MainLayout({
    super.key,
    required this.currentRoute,
    required this.child,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationState = ref.watch(notificationProvider);
    final isTechnicalAsync = ref.watch(userIsTechnicalProvider);

    return isTechnicalAsync.when(
      data: (isTechnical) => Scaffold(
        body: child,
        drawer: _buildDrawer(context, ref, isTechnical),
        bottomNavigationBar: _buildBottomNavigationBar(
          context,
          ref,
          notificationState,
          isTechnical,
        ),
      ),
      loading: () => Scaffold(
        body: child,
        bottomNavigationBar: const SizedBox.shrink(),
      ),
      error: (error, stack) => Scaffold(
        body: child,
        drawer: _buildDrawer(context, ref, false),
        bottomNavigationBar: _buildBottomNavigationBar(
          context,
          ref,
          notificationState,
          false,
        ),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context, WidgetRef ref, bool isTechnical) {
    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            // Drawer Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFFD32F2F), Color(0xFFB71C1C)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'PAFTA',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    ref.read(authStateProvider).user?.fullName ?? 
                    ref.read(authStateProvider).user?.email ?? 'Kullanıcı',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
            
            // Modüller
            _buildDrawerSection(
              context,
              'Modüller',
              [
                _buildDrawerItem(
                  context,
                  'Dashboard',
                  CupertinoIcons.house_fill,
                  '/dashboard',
                ),
                _buildDrawerItem(
                  context,
                  'Servis',
                  CupertinoIcons.wrench_fill,
                  '/service/management',
                ),
                _buildDrawerItem(
                  context,
                  'Satış',
                  CupertinoIcons.cart_fill,
                  '/sales',
                ),
                _buildDrawerItem(
                  context,
                  'Satın Alma',
                  CupertinoIcons.bag_fill,
                  '/purchasing',
                ),
                _buildDrawerItem(
                  context,
                  'Muhasebe',
                  CupertinoIcons.money_dollar_circle_fill,
                  '/accounting',
                ),
                _buildDrawerItem(
                  context,
                  'Stok',
                  CupertinoIcons.cube_box_fill,
                  '/inventory',
                ),
                _buildDrawerItem(
                  context,
                  'İnsan Kaynakları',
                  CupertinoIcons.person_2_fill,
                  '/hr',
                ),
              ],
            ),
            
            const Divider(),
            
            // Diğer
            _buildDrawerSection(
              context,
              'Diğer',
              [
                _buildDrawerItem(
                  context,
                  'Müşteriler',
                  CupertinoIcons.person_2_fill,
                  '/customers',
                ),
                _buildDrawerItem(
                  context,
                  'Bildirimler',
                  CupertinoIcons.bell_fill,
                  '/notifications',
                ),
                _buildDrawerItem(
                  context,
                  'Profil',
                  CupertinoIcons.person_fill,
                  '/profile',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerSection(
    BuildContext context,
    String title,
    List<Widget> items,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            title.toUpperCase(),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Color(0xFF8E8E93),
              letterSpacing: 0.5,
            ),
          ),
        ),
        ...items,
      ],
    );
  }

  Widget _buildDrawerItem(
    BuildContext context,
    String title,
    IconData icon,
    String route,
  ) {
    final isSelected = currentRoute == route || 
                      (route != '/dashboard' && currentRoute.startsWith(route));
    
    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? const Color(0xFFD32F2F) : const Color(0xFF8E8E93),
        size: 24,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isSelected ? const Color(0xFFD32F2F) : const Color(0xFF000000),
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
      selected: isSelected,
      onTap: () {
        Navigator.pop(context);
        context.go(route);
      },
    );
  }

  Widget _buildBottomNavigationBar(
    BuildContext context,
    WidgetRef ref,
    dynamic notificationState,
    bool isTechnical,
  ) {
    // En çok kullanılan 5 modülü bottom bar'da göster
    final items = _getBottomNavItems(notificationState, isTechnical);
    final currentIndex = _getCurrentIndex(isTechnical);
    
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF2F2F7),
        border: Border(
          top: BorderSide(
            color: const Color.fromRGBO(0, 0, 0, 0.1),
            width: 0.5,
          ),
        ),
      ),
      child: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: currentIndex,
        onTap: (index) => _onItemTapped(context, index, isTechnical),
        selectedItemColor: const Color(0xFFD32F2F),
        unselectedItemColor: const Color(0xFF8E8E93),
        backgroundColor: const Color(0xFFF2F2F7),
        elevation: 0,
        selectedLabelStyle: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.normal,
        ),
        items: items,
      ),
    );
  }

  List<BottomNavigationBarItem> _getBottomNavItems(
    dynamic notificationState,
    bool isTechnical,
  ) {
    // Tüm kullanıcılar için aynı bottom bar - Modüller butonu eklendi
    return [
      const BottomNavigationBarItem(
        icon: Icon(CupertinoIcons.house, size: 24),
        activeIcon: Icon(CupertinoIcons.house_fill, size: 24),
        label: 'Dashboard',
      ),
      const BottomNavigationBarItem(
        icon: Icon(CupertinoIcons.wrench, size: 24),
        activeIcon: Icon(CupertinoIcons.wrench_fill, size: 24),
        label: 'Servis',
      ),
      const BottomNavigationBarItem(
        icon: Icon(CupertinoIcons.square_grid_2x2, size: 24),
        activeIcon: Icon(CupertinoIcons.square_grid_2x2_fill, size: 24),
        label: 'Modüller',
      ),
      BottomNavigationBarItem(
        icon: Stack(
          children: [
            const Icon(CupertinoIcons.bell, size: 24),
            if (notificationState.unreadCount > 0)
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 16,
                    minHeight: 16,
                  ),
                  child: Text(
                    '${notificationState.unreadCount}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        ),
        activeIcon: Stack(
          children: [
            const Icon(CupertinoIcons.bell_fill, size: 24),
            if (notificationState.unreadCount > 0)
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 16,
                    minHeight: 16,
                  ),
                  child: Text(
                    '${notificationState.unreadCount}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        ),
        label: 'Bildirimler',
      ),
      const BottomNavigationBarItem(
        icon: Icon(CupertinoIcons.person, size: 24),
        activeIcon: Icon(CupertinoIcons.person_fill, size: 24),
        label: 'Profil',
      ),
    ];
  }

  int _getCurrentIndex(bool isTechnical) {
    if (currentRoute == '/dashboard' || currentRoute == '/home') return 0;
    if (currentRoute.startsWith('/service')) return 1;
    if (currentRoute == '/modules') return 2;
    if (currentRoute == '/notifications') return 3;
    if (currentRoute == '/profile') return 4;
    
    // Diğer route'lar için modüller sayfasını aktif göster
    if (currentRoute.startsWith('/sales') ||
        currentRoute.startsWith('/purchasing') ||
        currentRoute.startsWith('/accounting') ||
        currentRoute.startsWith('/inventory') ||
        currentRoute.startsWith('/hr') ||
        currentRoute == '/customers') {
      return 2; // Modüller sayfası aktif
    }
    
    return 0;
  }

  void _onItemTapped(BuildContext context, int index, bool isTechnical) {
    switch (index) {
      case 0:
        context.go('/dashboard');
        break;
      case 1:
        context.go('/service/management');
        break;
      case 2:
        context.go('/modules');
        break;
      case 3:
        context.go('/notifications');
        break;
      case 4:
        context.go('/profile');
        break;
    }
  }
}