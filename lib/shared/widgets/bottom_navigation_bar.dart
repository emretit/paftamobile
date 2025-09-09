import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';

class CustomBottomNavigationBar extends StatelessWidget {
  final int currentIndex;
  
  const CustomBottomNavigationBar({
    super.key,
    required this.currentIndex,
  });

  @override
  Widget build(BuildContext context) {
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
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFFB73D3D),
        unselectedItemColor: const Color(0xFF8E8E93),
        backgroundColor: const Color(0xFFF2F2F7),
        elevation: 0,
        onTap: (index) => _onTap(context, index),
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
        items: [
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
              size: 24,
            ),
            label: 'Yeni Talep',
          ),
          BottomNavigationBarItem(
            icon: Icon(
              currentIndex == 3 ? CupertinoIcons.person_fill : CupertinoIcons.person,
              size: 24,
            ),
            label: 'Profil',
          ),
        ],
      ),
    );
  }

  void _onTap(BuildContext context, int index) {
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
        context.go('/profile');
        break;
    }
  }

  static int getIndexForRoute(String route) {
    if (route == '/home') return 0;
    if (route == '/service-requests') return 1;
    if (route == '/service-requests/create') return 2;
    if (route.startsWith('/service-requests/') && route.contains('/edit')) return 2;
    if (route.startsWith('/service-requests/')) return 1; // Detail sayfası için servis talepleri tab'ını aktif tut
    if (route == '/profile') return 3;
    return 0; // Default olarak ana sayfa
  }
}
