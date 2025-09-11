import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/service_request.dart';
import 'push_notification_service.dart';

class ServiceRequestService {
  final SupabaseClient _supabase = Supabase.instance.client;
  final PushNotificationService _pushNotificationService = PushNotificationService();

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
        query = query.eq('service_status', status);
      }
      if (priority != null) {
        query = query.eq('service_priority', priority);
      }
      if (assignedTo != null) {
        query = query.eq('assigned_technician', assignedTo);
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
          .or('service_title.ilike.%$searchQuery%,service_request_description.ilike.%$searchQuery%,service_location.ilike.%$searchQuery%')
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
          .eq('assigned_technician', assignedTo)
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
      // Önce mevcut servis talebini al
      final currentRequest = await getServiceRequestById(id);
      if (currentRequest == null) {
        throw Exception('Servis talebi bulunamadı');
      }

      final oldStatus = currentRequest.serviceStatus;

      final response = await _supabase
          .from('service_requests')
          .update({'service_status': status, 'updated_at': DateTime.now().toIso8601String()})
          .eq('id', id)
          .select()
          .single();

      final updatedRequest = ServiceRequest.fromJson(response);

      // Müşteriye durum güncelleme bildirimi gönder
      if (currentRequest.customerId != null) {
        await _pushNotificationService.sendStatusUpdateNotification(
          customerId: currentRequest.customerId!,
          serviceTitle: currentRequest.serviceTitle,
          oldStatus: oldStatus,
          newStatus: status,
        );
      }

      // Servis tamamlandıysa özel bildirim gönder
      if (status == 'completed' && currentRequest.assignedTechnician != null) {
        await _pushNotificationService.sendServiceCompletedNotification(
          customerId: currentRequest.customerId ?? '',
          serviceTitle: currentRequest.serviceTitle,
          technicianName: 'Teknisyen', // Burada gerçek teknisyen adı alınabilir
        );
      }

      return updatedRequest;
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
          .update({'service_priority': priority, 'updated_at': DateTime.now().toIso8601String()})
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
      // Önce mevcut servis talebini al
      final currentRequest = await getServiceRequestById(id);
      if (currentRequest == null) {
        throw Exception('Servis talebi bulunamadı');
      }

      final response = await _supabase
          .from('service_requests')
          .update({
            'assigned_technician': assignedTo,
            'updated_at': DateTime.now().toIso8601String()
          })
          .eq('id', id)
          .select()
          .single();

      final updatedRequest = ServiceRequest.fromJson(response);

      // Teknisyene bildirim gönder
      if (assignedTo != null) {
        await _pushNotificationService.sendServiceAssignmentNotification(
          technicianId: assignedTo,
          serviceRequestId: id,
          customerName: currentRequest.customerName ?? 'Müşteri',
          serviceTitle: currentRequest.serviceTitle,
        );
      }

      return updatedRequest;
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
          .select('service_status');

      final stats = <String, int>{};
      for (final item in response as List) {
        final status = item['service_status'] as String;
        stats[status] = (stats[status] ?? 0) + 1;
      }

      return stats;
    } catch (e) {
      print('Servis talebi istatistikleri getirme hatası: $e');
      throw Exception('Servis talebi istatistikleri getirilemedi: $e');
    }
  }

  // Servis fişi oluştur
  Future<ServiceRequest> createServiceSlip(String serviceRequestId, {
    required String technicianName,
    Map<String, dynamic>? customerData,
    Map<String, dynamic>? equipmentData,
    Map<String, dynamic>? serviceDetails,
    String? technicianSignature,
  }) async {
    try {
      // Benzersiz servis fişi numarası oluştur
      final slipNumber = _generateSlipNumber();
      
      final response = await _supabase
          .from('service_requests')
          .update({
            'slip_number': slipNumber,
            'issue_date': DateTime.now().toIso8601String(),
            'technician_name': technicianName,
            'customer_data': customerData ?? {},
            'equipment_data': equipmentData ?? {},
            'service_details': serviceDetails ?? {},
            'slip_status': 'draft',
            'technician_signature': technicianSignature,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', serviceRequestId)
          .select()
          .single();

      return ServiceRequest.fromJson(response);
    } catch (e) {
      print('Servis fişi oluşturma hatası: $e');
      throw Exception('Servis fişi oluşturulamadı: $e');
    }
  }

  // Servis fişi güncelle
  Future<ServiceRequest> updateServiceSlip(String serviceRequestId, {
    String? technicianName,
    Map<String, dynamic>? customerData,
    Map<String, dynamic>? equipmentData,
    Map<String, dynamic>? serviceDetails,
    String? technicianSignature,
    String? slipStatus,
  }) async {
    try {
      final updateData = <String, dynamic>{
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (technicianName != null) updateData['technician_name'] = technicianName;
      if (customerData != null) updateData['customer_data'] = customerData;
      if (equipmentData != null) updateData['equipment_data'] = equipmentData;
      if (serviceDetails != null) updateData['service_details'] = serviceDetails;
      if (technicianSignature != null) updateData['technician_signature'] = technicianSignature;
      if (slipStatus != null) updateData['slip_status'] = slipStatus;

      final response = await _supabase
          .from('service_requests')
          .update(updateData)
          .eq('id', serviceRequestId)
          .select()
          .single();

      return ServiceRequest.fromJson(response);
    } catch (e) {
      print('Servis fişi güncelleme hatası: $e');
      throw Exception('Servis fişi güncellenemedi: $e');
    }
  }

  // Servis fişi tamamla
  Future<ServiceRequest> completeServiceSlip(String serviceRequestId, {
    String? technicianSignature,
  }) async {
    try {
      final updateData = {
        'slip_status': 'completed',
        'completion_date': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (technicianSignature != null) {
        updateData['technician_signature'] = technicianSignature;
      }

      final response = await _supabase
          .from('service_requests')
          .update(updateData)
          .eq('id', serviceRequestId)
          .select()
          .single();

      return ServiceRequest.fromJson(response);
    } catch (e) {
      print('Servis fişi tamamlama hatası: $e');
      throw Exception('Servis fişi tamamlanamadı: $e');
    }
  }

  // Servis fişi imzala
  Future<ServiceRequest> signServiceSlip(String serviceRequestId, String signature) async {
    try {
      final response = await _supabase
          .from('service_requests')
          .update({
            'technician_signature': signature,
            'slip_status': 'signed',
            'completion_date': DateTime.now().toIso8601String(),
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', serviceRequestId)
          .select()
          .single();

      return ServiceRequest.fromJson(response);
    } catch (e) {
      print('Servis fişi imzalama hatası: $e');
      throw Exception('Servis fişi imzalanamadı: $e');
    }
  }

  // Servis numarası oluştur  
  Future<ServiceRequest> generateServiceNumber(String serviceRequestId) async {
    try {
      final serviceNumber = _generateServiceNumber();
      
      final response = await _supabase
          .from('service_requests')
          .update({
            'service_number': serviceNumber,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', serviceRequestId)
          .select()
          .single();

      return ServiceRequest.fromJson(response);
    } catch (e) {
      print('Servis numarası oluşturma hatası: $e');
      throw Exception('Servis numarası oluşturulamadı: $e');
    }
  }

  // Benzersiz fiş numarası oluştur
  String _generateSlipNumber() {
    final now = DateTime.now();
    final year = now.year.toString().substring(2);
    final month = now.month.toString().padLeft(2, '0');
    final day = now.day.toString().padLeft(2, '0');
    final hour = now.hour.toString().padLeft(2, '0');
    final minute = now.minute.toString().padLeft(2, '0');
    final second = now.second.toString().padLeft(2, '0');
    
    return 'SF$year$month$day$hour$minute$second';
  }

  // Benzersiz servis numarası oluştur
  String _generateServiceNumber() {
    final now = DateTime.now();
    final year = now.year.toString();
    final month = now.month.toString().padLeft(2, '0');
    final day = now.day.toString().padLeft(2, '0');
    final hour = now.hour.toString().padLeft(2, '0');
    final minute = now.minute.toString().padLeft(2, '0');
    
    return 'SN$year$month$day$hour$minute';
  }
}