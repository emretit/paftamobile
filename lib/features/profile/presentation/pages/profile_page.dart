import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 50,
              backgroundColor: Colors.blue,
              child: Icon(
                Icons.person,
                size: 50,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              authState.user?.email ?? 'Kullanıcı',
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 32),
            ListTile(
              leading: const Icon(Icons.person),
              title: const Text('Kişisel Bilgiler'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: () {
                // TODO: Navigate to personal info
              },
            ),
            ListTile(
              leading: const Icon(Icons.settings),
              title: const Text('Ayarlar'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: () {
                // TODO: Navigate to settings
              },
            ),
            ListTile(
              leading: const Icon(Icons.help),
              title: const Text('Yardım'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: () {
                // TODO: Navigate to help
              },
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  ref.read(authProvider.notifier).signOut();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Çıkış Yap'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
