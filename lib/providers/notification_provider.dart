import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/notification.dart';
import '../services/push_notification_service.dart';

// Notification provider
final notificationProvider = NotifierProvider<NotificationNotifier, NotificationState>(() {
  return NotificationNotifier();
});

// Notification state
class NotificationState {
  final List<NotificationModel> notifications;
  final bool isLoading;
  final String? error;
  final int unreadCount;

  NotificationState({
    this.notifications = const [],
    this.isLoading = false,
    this.error,
    this.unreadCount = 0,
  });

  NotificationState copyWith({
    List<NotificationModel>? notifications,
    bool? isLoading,
    String? error,
    int? unreadCount,
  }) {
    return NotificationState(
      notifications: notifications ?? this.notifications,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      unreadCount: unreadCount ?? this.unreadCount,
    );
  }
}

// Notification notifier
class NotificationNotifier extends Notifier<NotificationState> {
  final SupabaseClient _supabase = Supabase.instance.client;
  final PushNotificationService _pushService = PushNotificationService();

  @override
  NotificationState build() {
    // Initial state'i döndür ve bildirimleri yükle
    Future.microtask(() => _loadNotifications());
    return NotificationState();
  }

  // Bildirimleri yükle
  Future<void> _loadNotifications() async {
    state = state.copyWith(isLoading: true, error: null);

    int retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        final user = _supabase.auth.currentUser;
        if (user == null) {
          state = state.copyWith(
            isLoading: false,
            error: 'Kullanıcı giriş yapmamış',
          );
          return;
        }

        final response = await _supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', ascending: false)
            .limit(50);

        final notifications = (response as List)
            .map((json) => NotificationModel.fromJson(json))
            .toList();

        final unreadCount = notifications.where((n) => !n.isRead).length;

        state = state.copyWith(
          notifications: notifications,
          isLoading: false,
          unreadCount: unreadCount,
        );
        return; // Başarılı olduğunda çık
      } catch (e) {
        retryCount++;
        print('Bildirimler yükleme hatası (deneme $retryCount/$maxRetries): $e');
        
        if (retryCount >= maxRetries) {
          state = state.copyWith(
            isLoading: false,
            error: 'Bildirimler yüklenemedi. Lütfen tekrar deneyin.',
          );
          return;
        }
        
        // Exponential backoff ile bekle
        await Future.delayed(Duration(seconds: retryCount * 2));
      }
    }
  }

  // Bildirimleri yenile
  Future<void> refreshNotifications() async {
    await _loadNotifications();
  }

  // Bildirimi okundu olarak işaretle
  Future<void> markAsRead(String notificationId) async {
    try {
      await _supabase
          .from('notifications')
          .update({'is_read': true})
          .eq('id', notificationId);

      // Local state'i güncelle
      final updatedNotifications = state.notifications.map((notification) {
        if (notification.id == notificationId) {
          return notification.copyWith(isRead: true);
        }
        return notification;
      }).toList();

      final unreadCount = updatedNotifications.where((n) => !n.isRead).length;

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: unreadCount,
      );
    } catch (e) {
      state = state.copyWith(error: 'Bildirim okundu olarak işaretlenemedi: $e');
    }
  }

  // Tüm bildirimleri okundu olarak işaretle
  Future<void> markAllAsRead() async {
    try {
      final user = _supabase.auth.currentUser;
      if (user == null) return;

      await _supabase
          .from('notifications')
          .update({'is_read': true})
          .eq('user_id', user.id)
          .eq('is_read', false);

      // Local state'i güncelle
      final updatedNotifications = state.notifications.map((notification) {
        return notification.copyWith(isRead: true);
      }).toList();

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: 0,
      );
    } catch (e) {
      state = state.copyWith(error: 'Tüm bildirimler okundu olarak işaretlenemedi: $e');
    }
  }

  // Bildirimi sil
  Future<void> deleteNotification(String notificationId) async {
    try {
      await _supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId);

      // Local state'den kaldır
      final updatedNotifications = state.notifications
          .where((notification) => notification.id != notificationId)
          .toList();

      final unreadCount = updatedNotifications.where((n) => !n.isRead).length;

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: unreadCount,
      );
    } catch (e) {
      state = state.copyWith(error: 'Bildirim silinemedi: $e');
    }
  }

  // Yeni bildirim ekle (real-time için)
  void addNotification(NotificationModel notification) {
    final updatedNotifications = [notification, ...state.notifications];
    final unreadCount = updatedNotifications.where((n) => !n.isRead).length;

    state = state.copyWith(
      notifications: updatedNotifications,
      unreadCount: unreadCount,
    );
  }

  // Test bildirimi gönder
  Future<void> sendTestNotification() async {
    try {
      final user = _supabase.auth.currentUser;
      if (user == null) return;

      final success = await _pushService.sendNotificationToUser(
        userId: user.id,
        title: 'Test Bildirimi',
        body: 'Bu bir test bildirimidir.',
        data: {
          'type': 'test',
          'action': 'open_notifications',
        },
      );

      if (success) {
        state = state.copyWith(error: null);
      } else {
        state = state.copyWith(error: 'Test bildirimi gönderilemedi');
      }
    } catch (e) {
      state = state.copyWith(error: 'Test bildirimi hatası: $e');
    }
  }

  // Servis atama bildirimi gönder
  Future<void> sendServiceAssignmentNotification({
    required String technicianId,
    required String serviceRequestId,
    required String customerName,
    required String serviceTitle,
  }) async {
    try {
      final success = await _pushService.sendServiceAssignmentNotification(
        technicianId: technicianId,
        serviceRequestId: serviceRequestId,
        customerName: customerName,
        serviceTitle: serviceTitle,
      );

      if (!success) {
        state = state.copyWith(error: 'Servis atama bildirimi gönderilemedi');
      }
    } catch (e) {
      state = state.copyWith(error: 'Servis atama bildirimi hatası: $e');
    }
  }

  // Durum güncelleme bildirimi gönder
  Future<void> sendStatusUpdateNotification({
    required String customerId,
    required String serviceTitle,
    required String oldStatus,
    required String newStatus,
  }) async {
    try {
      final success = await _pushService.sendStatusUpdateNotification(
        customerId: customerId,
        serviceTitle: serviceTitle,
        oldStatus: oldStatus,
        newStatus: newStatus,
      );

      if (!success) {
        state = state.copyWith(error: 'Durum güncelleme bildirimi gönderilemedi');
      }
    } catch (e) {
      state = state.copyWith(error: 'Durum güncelleme bildirimi hatası: $e');
    }
  }

  // Acil durum bildirimi gönder
  Future<void> sendEmergencyNotification({
    required String technicianId,
    required String message,
  }) async {
    try {
      final success = await _pushService.sendEmergencyNotification(
        technicianId: technicianId,
        message: message,
      );

      if (!success) {
        state = state.copyWith(error: 'Acil durum bildirimi gönderilemedi');
      }
    } catch (e) {
      state = state.copyWith(error: 'Acil durum bildirimi hatası: $e');
    }
  }

  // Servis tamamlandı bildirimi gönder
  Future<void> sendServiceCompletedNotification({
    required String customerId,
    required String serviceTitle,
    required String technicianName,
  }) async {
    try {
      final success = await _pushService.sendServiceCompletedNotification(
        customerId: customerId,
        serviceTitle: serviceTitle,
        technicianName: technicianName,
      );

      if (!success) {
        state = state.copyWith(error: 'Servis tamamlandı bildirimi gönderilemedi');
      }
    } catch (e) {
      state = state.copyWith(error: 'Servis tamamlandı bildirimi hatası: $e');
    }
  }

  // Randevu hatırlatma bildirimi gönder
  Future<void> sendAppointmentReminder({
    required String userId,
    required String serviceTitle,
    required DateTime appointmentTime,
  }) async {
    try {
      final success = await _pushService.sendAppointmentReminder(
        userId: userId,
        serviceTitle: serviceTitle,
        appointmentTime: appointmentTime,
      );

      if (!success) {
        state = state.copyWith(error: 'Randevu hatırlatma bildirimi gönderilemedi');
      }
    } catch (e) {
      state = state.copyWith(error: 'Randevu hatırlatma bildirimi hatası: $e');
    }
  }
}
