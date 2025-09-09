import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/service_request.dart';

class ServiceRequestService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Tüm servis taleplerini getir
  Future<List<ServiceRequest>> getServiceRequests({
    String? status,
    String? priority,
    String? assignedTo,
    String? customerId,
    int? limit,
    int? offset,
  }) async {
    try {
      dynamic query = _supabase
          .from('service_requests')
          .select('*');

      if (status != null) {
        query = query.eq('status', status);
      }
      if (priority != null) {
        query = query.eq('priority', priority);
      }
      if (assignedTo != null) {
        query = query.eq('assigned_to', assignedTo);
      }
      if (customerId != null) {
        query = query.eq('customer_id', customerId);
      }
      
      query = query.order('created_at', ascending: false);
      
      if (limit != null) {
        query = query.limit(limit);
      }
      if (offset != null) {
        query = query.range(offset, offset + (limit ?? 10) - 1);
      }

      final response = await query;
      return (response as List).map((json) => ServiceRequest.fromJson(json)).toList();
    } catch (e) {
      print('Service requests getirme hatası: $e');
      throw Exception('Servis talepleri getirilemedi: $e');
    }
  }

  // ID'ye göre servis talebi getir
  Future<ServiceRequest?> getServiceRequestById(String id) async {
    try {
      final response = await _supabase
          .from('service_requests')
          .select('*')
          .eq('id', id)
          .single();

      return ServiceRequest.fromJson(response);
    } catch (e) {
      print('Service request getirme hatası: $e');
      return null;
    }
  }

  // Yeni servis talebi oluştur
  Future<ServiceRequest> createServiceRequest(ServiceRequest serviceRequest) async {
    try {
      final response = await _supabase
          .from('service_requests')
          .insert(serviceRequest.toJson())
          .select()
          .single();

      return ServiceRequest.fromJson(response);
    } catch (e) {
      print('Service request oluşturma hatası: $e');
      throw Exception('Servis talebi oluşturulamadı: $e');
    }
  }

  // Servis talebi güncelle
  Future<ServiceRequest> updateServiceRequest(String id, ServiceRequest serviceRequest) async {
    try {
      final response = await _supabase
          .from('service_requests')
          .update(serviceRequest.toJson())
          .eq('id', id)
          .select()
          .single();

      return ServiceRequest.fromJson(response);
    } catch (e) {
      print('Service request güncelleme hatası: $e');
      throw Exception('Servis talebi güncellenemedi: $e');
    }
  }

  // Servis talebi sil
  Future<void> deleteServiceRequest(String id) async {
    try {
      await _supabase
          .from('service_requests')
          .delete()
          .eq('id', id);
    } catch (e) {
      print('Service request silme hatası: $e');
      throw Exception('Servis talebi silinemedi: $e');
    }
  }

  // Servis talebi arama
  Future<List<ServiceRequest>> searchServiceRequests(String searchQuery) async {
    try {
      final response = await _supabase
          .from('service_requests')
          .select('*')
          .or('title.ilike.%$searchQuery%,description.ilike.%$searchQuery%,location.ilike.%$searchQuery%')
          .order('created_at', ascending: false);

      return (response as List).map((json) => ServiceRequest.fromJson(json)).toList();
    } catch (e) {
      print('Service request arama hatası: $e');
      throw Exception('Servis talebi araması yapılamadı: $e');
    }
  }

  // Müşteriye göre servis talepleri getir
  Future<List<ServiceRequest>> getServiceRequestsByCustomer(String customerId) async {
    try {
      final response = await _supabase
          .from('service_requests')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', ascending: false);

      return (response as List).map((json) => ServiceRequest.fromJson(json)).toList();
    } catch (e) {
      print('Müşteri servis talepleri getirme hatası: $e');
      throw Exception('Müşteri servis talepleri getirilemedi: $e');
    }
  }

  // Atanan kişiye göre servis talepleri getir
  Future<List<ServiceRequest>> getServiceRequestsByAssignee(String assignedTo) async {
    try {
      final response = await _supabase
          .from('service_requests')
          .select('*')
          .eq('assigned_to', assignedTo)
          .order('created_at', ascending: false);

      return (response as List).map((json) => ServiceRequest.fromJson(json)).toList();
    } catch (e) {
      print('Atanan servis talepleri getirme hatası: $e');
      throw Exception('Atanan servis talepleri getirilemedi: $e');
    }
  }

  // Durum güncelleme
  Future<ServiceRequest> updateServiceRequestStatus(String id, String status) async {
    try {
      final response = await _supabase
          .from('service_requests')
          .update({'status': status, 'updated_at': DateTime.now().toIso8601String()})
          .eq('id', id)
          .select()
          .single();

      return ServiceRequest.fromJson(response);
    } catch (e) {
      print('Servis talebi durumu güncelleme hatası: $e');
      throw Exception('Servis talebi durumu güncellenemedi: $e');
    }
  }

  // Öncelik güncelleme
  Future<ServiceRequest> updateServiceRequestPriority(String id, String priority) async {
    try {
      final response = await _supabase
          .from('service_requests')
          .update({'priority': priority, 'updated_at': DateTime.now().toIso8601String()})
          .eq('id', id)
          .select()
          .single();

      return ServiceRequest.fromJson(response);
    } catch (e) {
      print('Servis talebi önceliği güncelleme hatası: $e');
      throw Exception('Servis talebi önceliği güncellenemedi: $e');
    }
  }

  // Atama güncelleme
  Future<ServiceRequest> updateServiceRequestAssignment(String id, String? assignedTo) async {
    try {
      final response = await _supabase
          .from('service_requests')
          .update({
            'assigned_to': assignedTo,
            'assigned_at': assignedTo != null ? DateTime.now().toIso8601String() : null,
            'updated_at': DateTime.now().toIso8601String()
          })
          .eq('id', id)
          .select()
          .single();

      return ServiceRequest.fromJson(response);
    } catch (e) {
      print('Servis talebi ataması güncelleme hatası: $e');
      throw Exception('Servis talebi ataması güncellenemedi: $e');
    }
  }

  // Servis aktivitelerini getir
  Future<List<ServiceActivity>> getServiceActivities(String serviceRequestId) async {
    try {
      final response = await _supabase
          .from('service_activities')
          .select('*')
          .eq('service_request_id', serviceRequestId)
          .order('created_at', ascending: false);

      return (response as List).map((json) => ServiceActivity.fromJson(json)).toList();
    } catch (e) {
      print('Servis aktiviteleri getirme hatası: $e');
      throw Exception('Servis aktiviteleri getirilemedi: $e');
    }
  }

  // Servis aktivitesi oluştur
  Future<ServiceActivity> createServiceActivity(ServiceActivity activity) async {
    try {
      final response = await _supabase
          .from('service_activities')
          .insert(activity.toJson())
          .select()
          .single();

      return ServiceActivity.fromJson(response);
    } catch (e) {
      print('Servis aktivitesi oluşturma hatası: $e');
      throw Exception('Servis aktivitesi oluşturulamadı: $e');
    }
  }

  // Servis geçmişini getir
  Future<List<ServiceHistory>> getServiceHistory(String serviceRequestId) async {
    try {
      final response = await _supabase
          .from('service_history')
          .select('*')
          .eq('service_request_id', serviceRequestId)
          .order('created_at', ascending: false);

      return (response as List).map((json) => ServiceHistory.fromJson(json)).toList();
    } catch (e) {
      print('Servis geçmişi getirme hatası: $e');
      throw Exception('Servis geçmişi getirilemedi: $e');
    }
  }

  // Servis geçmişi kaydı oluştur
  Future<ServiceHistory> createServiceHistory(ServiceHistory history) async {
    try {
      final response = await _supabase
          .from('service_history')
          .insert(history.toJson())
          .select()
          .single();

      return ServiceHistory.fromJson(response);
    } catch (e) {
      print('Servis geçmişi oluşturma hatası: $e');
      throw Exception('Servis geçmişi oluşturulamadı: $e');
    }
  }

  // Not ekleme
  Future<ServiceRequest> addNote(String id, String note) async {
    try {
      // Önce mevcut notları al
      final currentRequest = await getServiceRequestById(id);
      if (currentRequest == null) {
        throw Exception('Servis talebi bulunamadı');
      }

      // Yeni notu ekle
      final updatedNotes = [...(currentRequest.notes ?? []), note];

      final response = await _supabase
          .from('service_requests')
          .update({
            'notes': updatedNotes,
            'updated_at': DateTime.now().toIso8601String()
          })
          .eq('id', id)
          .select()
          .single();

      return ServiceRequest.fromJson(response);
    } catch (e) {
      print('Not ekleme hatası: $e');
      throw Exception('Not eklenemedi: $e');
    }
  }

  // İstatistikler
  Future<Map<String, int>> getServiceRequestStats() async {
    try {
      final response = await _supabase
          .from('service_requests')
          .select('status');

      final stats = <String, int>{};
      for (final item in response as List) {
        final status = item['status'] as String;
        stats[status] = (stats[status] ?? 0) + 1;
      }

      return stats;
    } catch (e) {
      print('Servis talebi istatistikleri getirme hatası: $e');
      throw Exception('Servis talebi istatistikleri getirilemedi: $e');
    }
  }
}