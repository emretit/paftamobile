import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';

class CustomBottomNavigationBar extends ConsumerWidget {
  final String currentRoute;
  
  const CustomBottomNavigationBar({
    super.key,
    required this.currentRoute,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isTechnicalAsync = ref.watch(userIsTechnicalProvider);
    
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF2F2F7),
        border: Border(
          top: BorderSide(
            color: Colors.black.withOpacity(0.1),
            width: 0.5,
          ),
        ),
      ),
      child: isTechnicalAsync.when(
        data: (isTechnical) {
          // Route'a göre current index'i hesapla
          final currentIndex = _getIndexForRoute(currentRoute, isTechnical);
          
          // is_technical değerine göre menü öğelerini belirle
          final menuItems = _getMenuItems(isTechnical, currentIndex);
          
          return BottomNavigationBar(
            currentIndex: currentIndex,
            type: BottomNavigationBarType.fixed,
            selectedItemColor: const Color(0xFFB73D3D),
            unselectedItemColor: const Color(0xFF8E8E93),
            backgroundColor: const Color(0xFFF2F2F7),
            elevation: 0,
            onTap: (index) => _onTap(context, index, isTechnical),
            selectedLabelStyle: Theme.of(context).textTheme.labelSmall?.copyWith(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: const Color(0xFFB73D3D),
            ),
            unselectedLabelStyle: Theme.of(context).textTheme.labelSmall?.copyWith(
              fontSize: 10,
              fontWeight: FontWeight.normal,
              color: const Color(0xFF8E8E93),
            ),
            items: menuItems,
          );
        },
        loading: () => const SizedBox(
          height: 60,
          child: Center(child: CupertinoActivityIndicator()),
        ),
        error: (error, stack) => Container(
          height: 60,
          padding: const EdgeInsets.all(8),
          child: const Center(
            child: Text(
              'Menü yüklenemedi',
              style: TextStyle(color: Colors.red, fontSize: 12),
            ),
          ),
        ),
      ),
    );
  }

  int _getIndexForRoute(String route, bool isTechnical) {
    if (route == '/home') return 0;
    
    if (isTechnical) {
      // Teknik personel için
      if (route == '/service-requests') return 1;
      if (route == '/service-requests/create') return 2;
      if (route.startsWith('/service-requests/') && route.contains('/edit')) return 2;
      if (route.startsWith('/service-requests/')) return 1;
      if (route == '/customers') return 3;
      if (route == '/profile') return 4;
    } else {
      // Teknik olmayan personel için
      if (route == '/service-requests') return 1;
      if (route.startsWith('/service-requests/')) return 1;
      if (route == '/customers') return 2;
      if (route == '/notifications') return 3;
      if (route == '/profile') return 4;
    }
    
    return 0; // Default olarak ana sayfa
  }

  List<BottomNavigationBarItem> _getMenuItems(bool isTechnical, int currentIndex) {
    if (isTechnical) {
      // Teknik personel menüsü
      return [
        BottomNavigationBarItem(
          icon: Icon(
            currentIndex == 0 ? CupertinoIcons.house_fill : CupertinoIcons.house,
            size: 24,
          ),
          label: 'Ana Sayfa',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            currentIndex == 1 ? CupertinoIcons.wrench_fill : CupertinoIcons.wrench,
            size: 24,
          ),
          label: 'Servis Talepleri',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            currentIndex == 2 ? CupertinoIcons.plus_circle_fill : CupertinoIcons.plus_circle,
            size: 28,
          ),
          label: 'Yeni Talep',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            currentIndex == 3 ? CupertinoIcons.person_2_fill : CupertinoIcons.person_2,
            size: 24,
          ),
          label: 'Müşteriler',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            currentIndex == 4 ? CupertinoIcons.person_fill : CupertinoIcons.person,
            size: 24,
          ),
          label: 'Profil',
        ),
      ];
    } else {
      // Teknik olmayan personel menüsü (farklı menü öğeleri)
      return [
        BottomNavigationBarItem(
          icon: Icon(
            currentIndex == 0 ? CupertinoIcons.house_fill : CupertinoIcons.house,
            size: 24,
          ),
          label: 'Ana Sayfa',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            currentIndex == 1 ? CupertinoIcons.doc_text_fill : CupertinoIcons.doc_text,
            size: 24,
          ),
          label: 'Talepler',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            currentIndex == 2 ? CupertinoIcons.person_2_fill : CupertinoIcons.person_2,
            size: 24,
          ),
          label: 'Müşteriler',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            currentIndex == 3 ? CupertinoIcons.bell_fill : CupertinoIcons.bell,
            size: 24,
          ),
          label: 'Bildirimler',
        ),
        BottomNavigationBarItem(
          icon: Icon(
            currentIndex == 4 ? CupertinoIcons.person_fill : CupertinoIcons.person,
            size: 24,
          ),
          label: 'Profil',
        ),
      ];
    }
  }

  void _onTap(BuildContext context, int index, bool isTechnical) {
    if (isTechnical) {
      // Teknik personel navigasyonu
      switch (index) {
        case 0:
          context.go('/home');
          break;
        case 1:
          context.go('/service-requests');
          break;
        case 2:
          context.go('/service-requests/create');
          break;
        case 3:
          context.go('/customers');
          break;
        case 4:
          context.go('/profile');
          break;
      }
    } else {
      // Teknik olmayan personel navigasyonu
      switch (index) {
        case 0:
          context.go('/home');
          break;
        case 1:
          context.go('/service-requests'); // Talepler sayfası
          break;
        case 2:
          context.go('/customers');
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

}

