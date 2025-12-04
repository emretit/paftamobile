import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/service_request.dart';
import '../providers/service_request_provider.dart';
import '../shared/widgets/service_page_header.dart';
import '../shared/widgets/service_filter_bar.dart';

class ServiceRequestsListPage extends ConsumerStatefulWidget {
  const ServiceRequestsListPage({super.key});

  @override
  ConsumerState<ServiceRequestsListPage> createState() => _ServiceRequestsListPageState();
}

class _ServiceRequestsListPageState extends ConsumerState<ServiceRequestsListPage> {
  String? _selectedStatus;
  String? _selectedPriority;
  String? _selectedTechnician;
  String _searchQuery = '';


  @override
  Widget build(BuildContext context) {
    final serviceRequestsAsync = ref.watch(serviceRequestsProvider);
    final statuses = ref.watch(serviceRequestStatusesProvider);
    final statusColors = ref.watch(serviceRequestStatusColorsProvider);
    final priorityColors = ref.watch(serviceRequestPriorityColorsProvider);
    final statusDisplayNames = ref.watch(serviceRequestStatusDisplayNamesProvider);
    final priorityDisplayNames = ref.watch(serviceRequestPriorityDisplayNamesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF2F2F7),
      // AppBar kaldırıldı - ServicePageHeader zaten başlık içeriyor
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(serviceRequestsProvider);
          },
          child: CustomScrollView(
            slivers: [
            // Service Page Header - Web app'teki gibi
            SliverToBoxAdapter(
              child: const ServicePageHeader(),
            ),
            
            // Filter Bar - Web app'teki gibi gelişmiş filtreleme
            SliverToBoxAdapter(
              child: ServiceFilterBar(
                searchQuery: _searchQuery,
                onSearchChanged: (value) {
                  setState(() {
                    _searchQuery = value;
                  });
                },
                selectedStatus: _selectedStatus,
                onStatusChanged: (value) {
                  setState(() {
                    _selectedStatus = value;
                  });
                },
                selectedPriority: _selectedPriority,
                onPriorityChanged: (value) {
                  setState(() {
                    _selectedPriority = value;
                  });
                },
                selectedTechnician: _selectedTechnician,
                onTechnicianChanged: (value) {
                  setState(() {
                    _selectedTechnician = value;
                  });
                },
              ),
            ),
            
            // Servis talepleri listesi
            serviceRequestsAsync.when(
              data: (serviceRequests) {
                List<ServiceRequest> filteredRequests = serviceRequests;

                // Durum filtresi
                if (_selectedStatus != null) {
                  filteredRequests = filteredRequests
                      .where((request) => request.status == _selectedStatus)
                      .toList();
                }

                // Öncelik filtresi
                if (_selectedPriority != null) {
                  filteredRequests = filteredRequests
                      .where((request) => request.priority == _selectedPriority)
                      .toList();
                }

                // Teknisyen filtresi
                if (_selectedTechnician != null) {
                  filteredRequests = filteredRequests
                      .where((request) => request.assignedTechnician == _selectedTechnician)
                      .toList();
                }

                // Arama filtresi
                if (_searchQuery.isNotEmpty) {
                  filteredRequests = filteredRequests
                      .where((request) =>
                          request.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                          (request.description?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false) ||
                          (request.location?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false))
                      .toList();
                }

                if (filteredRequests.isEmpty) {
                  return SliverFillRemaining(
                    hasScrollBody: false,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.grey[50],
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              CupertinoIcons.search,
                              size: 48,
                              color: Colors.grey[400],
                            ),
                          ),
                          const SizedBox(height: 24),
                          Text(
                            _hasActiveFilters()
                                ? 'Arama kriterlerinize uygun servis talebi bulunamadı'
                                : 'Henüz servis talebi bulunmuyor',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                              color: Colors.grey[700],
                            ),
                            textAlign: TextAlign.center,
                          ),
                          if (!_hasActiveFilters()) ...[
                            const SizedBox(height: 8),
                            Text(
                              'İlk servis talebinizi oluşturarak başlayın',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[600],
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 24),
                            ElevatedButton.icon(
                              onPressed: () => context.go('/service/new'),
                              icon: const Icon(CupertinoIcons.add),
                              label: const Text('İlk Servis Talebini Oluştur'),
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 24,
                                  vertical: 12,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                }

                return SliverPadding(
                  padding: const EdgeInsets.all(16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final serviceRequest = filteredRequests[index];
                        return _buildServiceRequestCard(
                          serviceRequest,
                          statusColors,
                          priorityColors,
                          statusDisplayNames,
                          priorityDisplayNames,
                        );
                      },
                      childCount: filteredRequests.length,
                    ),
                  ),
                );
              },
              loading: () => SliverFillRemaining(
                hasScrollBody: false,
                child: _buildLoadingState(),
              ),
              error: (error, stack) => SliverFillRemaining(
                hasScrollBody: false,
                child: _buildErrorState(context, error, ref),
              ),
            ),
          ],
          ),
        ),
      ),
    );
  }

  bool _hasActiveFilters() {
    return _searchQuery.isNotEmpty ||
        _selectedStatus != null ||
        _selectedPriority != null ||
        _selectedTechnician != null;
  }

  Widget _buildServiceRequestCard(
    ServiceRequest serviceRequest,
    Map<String, String> statusColors,
    Map<String, String> priorityColors,
    Map<String, String> statusDisplayNames,
    Map<String, String> priorityDisplayNames,
  ) {
    final statusColor = _getStatusColor(serviceRequest.status, statusColors);
    final priorityColor = _getPriorityColor(serviceRequest.priority, priorityColors);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white,
            statusColor.withOpacity(0.02),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: statusColor.withOpacity(0.1),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: statusColor.withOpacity(0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
            spreadRadius: 0,
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
            spreadRadius: 0,
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.go('/service/detail/${serviceRequest.id}'),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Başlık ve durum
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  serviceRequest.title,
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontSize: 17,
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFF000000),
                                    letterSpacing: -0.41,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          if (serviceRequest.serviceType != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF2F2F7),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                serviceRequest.serviceType!,
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  fontSize: 11,
                                  color: const Color(0xFF8E8E93),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        _buildStatusChipWidget(
                          statusDisplayNames[serviceRequest.status] ?? serviceRequest.status,
                          serviceRequest.status,
                          statusColors,
                        ),
                        const SizedBox(height: 6),
                        _buildPriorityChip(
                          priorityDisplayNames[serviceRequest.priority] ?? serviceRequest.priority,
                          serviceRequest.priority,
                          priorityColors,
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Açıklama
                if (serviceRequest.description != null && serviceRequest.description!.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF2F2F7),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      serviceRequest.description!,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontSize: 14,
                        color: const Color(0xFF4A4A4A),
                        height: 1.4,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                // Bilgi satırları
                Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  children: [
                    // Konum bilgisi
                    if (serviceRequest.location != null)
                      _buildInfoChip(
                        CupertinoIcons.location,
                        serviceRequest.location!,
                        const Color(0xFF3B82F6),
                      ),
                    // Tarih bilgisi
                    _buildInfoChip(
                      CupertinoIcons.calendar,
                      _formatDate(serviceRequest.createdAt),
                      const Color(0xFF8E8E93),
                    ),
                    // Bitiş tarihi
                    if (serviceRequest.dueDate != null)
                      _buildInfoChip(
                        CupertinoIcons.time,
                        'Bitiş: ${_formatDate(serviceRequest.dueDate!)}',
                        const Color(0xFFFF9500),
                        isUrgent: serviceRequest.dueDate!.isBefore(DateTime.now()),
                      ),
                  ],
                ),
                // Alt bilgiler
                if (serviceRequest.notes != null && serviceRequest.notes!.isNotEmpty ||
                    serviceRequest.attachments.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  const Divider(height: 1),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      if (serviceRequest.notes != null && serviceRequest.notes!.isNotEmpty)
                        _buildMetaChip(
                          CupertinoIcons.doc_text,
                          '${serviceRequest.notes!.length} not',
                          const Color(0xFFD32F2F),
                        ),
                      if (serviceRequest.notes != null && serviceRequest.notes!.isNotEmpty &&
                          serviceRequest.attachments.isNotEmpty)
                        const SizedBox(width: 12),
                      if (serviceRequest.attachments.isNotEmpty)
                        _buildMetaChip(
                          CupertinoIcons.paperclip,
                          '${serviceRequest.attachments.length} dosya',
                          const Color(0xFF34C759),
                        ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String text, Color color, {bool isUrgent = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: isUrgent
            ? color.withOpacity(0.1)
            : const Color(0xFFF2F2F7),
        borderRadius: BorderRadius.circular(10),
        border: isUrgent
            ? Border.all(color: color.withOpacity(0.3), width: 1)
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: isUrgent ? color : const Color(0xFF8E8E93),
          ),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isUrgent ? FontWeight.w600 : FontWeight.normal,
              color: isUrgent ? color : const Color(0xFF8E8E93),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetaChip(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: color.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChipWidget(String label, String status, Map<String, String> statusColors) {
    final color = _getStatusColor(status, statusColors);
    IconData icon;
    switch (status) {
      case 'new':
        icon = CupertinoIcons.exclamationmark_circle;
        break;
      case 'assigned':
        icon = CupertinoIcons.circle;
        break;
      case 'in_progress':
        icon = CupertinoIcons.clock;
        break;
      case 'on_hold':
        icon = CupertinoIcons.exclamationmark_triangle;
        break;
      case 'completed':
        icon = CupertinoIcons.checkmark_circle;
        break;
      case 'cancelled':
        icon = CupertinoIcons.xmark_circle;
        break;
      default:
        icon = CupertinoIcons.circle;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            color.withOpacity(0.15),
            color.withOpacity(0.08),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriorityChip(String label, String priority, Map<String, String> priorityColors) {
    final color = _getPriorityColor(priority, priorityColors);
    String emoji;
    switch (priority) {
      case 'urgent':
        emoji = '🔴';
        break;
      case 'high':
        emoji = '🟠';
        break;
      case 'medium':
        emoji = '🟡';
        break;
      case 'low':
        emoji = '🟢';
        break;
      default:
        emoji = '⚪';
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            color.withOpacity(0.15),
            color.withOpacity(0.08),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            emoji,
            style: const TextStyle(fontSize: 12),
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status, Map<String, String> statusColors) {
    final colorName = statusColors[status] ?? 'blue';
    return _getColorFromName(colorName);
  }

  Color _getPriorityColor(String priority, Map<String, String> priorityColors) {
    final colorName = priorityColors[priority] ?? 'blue';
    return _getColorFromName(colorName);
  }

  Color _getColorFromName(String colorName) {
    switch (colorName) {
      case 'red':
        return Colors.red;
      case 'orange':
        return Colors.orange;
      case 'yellow':
        return Colors.yellow[700]!;
      case 'green':
        return Colors.green;
      case 'blue':
        return Colors.blue;
      case 'purple':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year}';
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFFF2F2F7),
              shape: BoxShape.circle,
            ),
            child: const CupertinoActivityIndicator(
              radius: 16,
              color: Color(0xFFD32F2F),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Servisler yükleniyor...',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, Object error, WidgetRef ref) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.red.shade50,
                    Colors.red.shade100.withOpacity(0.5),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
              ),
              child: Icon(
                CupertinoIcons.exclamationmark_triangle,
                size: 48,
                color: Colors.red[600],
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Bir hata oluştu',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Servis talepleri yüklenirken bir sorun oluştu.\nLütfen tekrar deneyin.',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                ref.invalidate(serviceRequestsProvider);
              },
              icon: const Icon(CupertinoIcons.arrow_clockwise),
              label: const Text('Tekrar Dene'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
