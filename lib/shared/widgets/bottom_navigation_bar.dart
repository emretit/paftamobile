import 'package:flutter/material.dart';
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
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.blue[600],
        unselectedItemColor: Colors.grey[600],
        backgroundColor: Colors.white,
        elevation: 0, // Container'da shadow kullandığımız için 0 yapıyoruz
        onTap: (index) => _onTap(context, index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Ana Sayfa',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.build),
            label: 'Servis Talepleri',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.add_circle),
            label: 'Yeni Talep',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
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
