import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/service_request.dart';
import '../services/service_request_service.dart';

final serviceRequestServiceProvider = Provider<ServiceRequestService>((ref) {
  return ServiceRequestService();
});

final serviceRequestsProvider = FutureProvider<List<ServiceRequest>>((ref) async {
  final service = ref.read(serviceRequestServiceProvider);
  return await service.getServiceRequests();
});

final serviceRequestStatsProvider = FutureProvider<Map<String, int>>((ref) async {
  final service = ref.read(serviceRequestServiceProvider);
  return await service.getServiceRequestStats();
});

final serviceRequestByIdProvider = FutureProvider.family<ServiceRequest?, String>((ref, id) async {
  final service = ref.read(serviceRequestServiceProvider);
  return await service.getServiceRequestById(id);
});

final serviceRequestsByStatusProvider = FutureProvider.family<List<ServiceRequest>, String>((ref, status) async {
  final service = ref.read(serviceRequestServiceProvider);
  return await service.getServiceRequests(status: status);
});

final serviceRequestsByAssigneeProvider = FutureProvider.family<List<ServiceRequest>, String>((ref, assigneeId) async {
  final service = ref.read(serviceRequestServiceProvider);
  return await service.getServiceRequestsByAssignee(assigneeId);
});

final serviceRequestsByCustomerProvider = FutureProvider.family<List<ServiceRequest>, String>((ref, customerId) async {
  final service = ref.read(serviceRequestServiceProvider);
  return await service.getServiceRequestsByCustomer(customerId);
});

final serviceRequestSearchProvider = FutureProvider.family<List<ServiceRequest>, String>((ref, query) async {
  final service = ref.read(serviceRequestServiceProvider);
  return await service.searchServiceRequests(query);
});

final serviceActivitiesProvider = FutureProvider.family<List<ServiceActivity>, String>((ref, serviceRequestId) async {
  final service = ref.read(serviceRequestServiceProvider);
  return await service.getServiceActivities(serviceRequestId);
});

final serviceHistoryProvider = FutureProvider.family<List<ServiceHistory>, String>((ref, serviceRequestId) async {
  final service = ref.read(serviceRequestServiceProvider);
  return await service.getServiceHistory(serviceRequestId);
});

// Service request durumları
final serviceRequestStatusesProvider = Provider<List<String>>((ref) {
  return [
    'new',
    'assigned',
    'in_progress',
    'on_hold',
    'completed',
    'cancelled',
  ];
});

// Service request öncelikleri
final serviceRequestPrioritiesProvider = Provider<List<String>>((ref) {
  return [
    'low',
    'medium',
    'high',
    'urgent',
  ];
});

// Durum renkleri
final serviceRequestStatusColorsProvider = Provider<Map<String, String>>((ref) {
  return {
    'new': 'blue',
    'assigned': 'orange',
    'in_progress': 'green',
    'on_hold': 'yellow',
    'completed': 'green',
    'cancelled': 'red',
  };
});

// Öncelik renkleri
final serviceRequestPriorityColorsProvider = Provider<Map<String, String>>((ref) {
  return {
    'low': 'green',
    'medium': 'blue',
    'high': 'orange',
    'urgent': 'red',
  };
});

// Durum görüntüleme adları
final serviceRequestStatusDisplayNamesProvider = Provider<Map<String, String>>((ref) {
  return {
    'new': 'Yeni',
    'assigned': 'Atandı',
    'in_progress': 'Devam Ediyor',
    'on_hold': 'Beklemede',
    'completed': 'Tamamlandı',
    'cancelled': 'İptal Edildi',
  };
});

// Öncelik görüntüleme adları
final serviceRequestPriorityDisplayNamesProvider = Provider<Map<String, String>>((ref) {
  return {
    'low': 'Düşük',
    'medium': 'Normal',
    'high': 'Yüksek',
    'urgent': 'Acil',
  };
});
