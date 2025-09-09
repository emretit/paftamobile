import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/service_request.dart';
import '../providers/service_request_provider.dart';

class ServiceRequestsListPage extends ConsumerStatefulWidget {
  const ServiceRequestsListPage({super.key});

  @override
  ConsumerState<ServiceRequestsListPage> createState() => _ServiceRequestsListPageState();
}

class _ServiceRequestsListPageState extends ConsumerState<ServiceRequestsListPage> {
  String _selectedStatus = 'all';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

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
      appBar: AppBar(
        title: Text(
          'Servis Talepleri',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontSize: 17,
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: const Color(0xFFF2F2F7),
        foregroundColor: const Color(0xFF000000),
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        actions: [
          CupertinoButton(
            onPressed: () => context.go('/service-requests/create'),
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: const Color(0xFFB73D3D),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                CupertinoIcons.add,
                color: Colors.white,
                size: 18,
              ),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Column(
        children: [
          // Filtre ve arama bölümü
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              children: [
                // Arama çubuğu
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF2F2F7),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Servis talebi ara...',
                      hintStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: const Color(0xFF8E8E93),
                      ),
                      prefixIcon: const Icon(
                        CupertinoIcons.search,
                        color: Color(0xFFB73D3D),
                        size: 20,
                      ),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? CupertinoButton(
                              onPressed: () {
                                setState(() {
                                  _searchQuery = '';
                                  _searchController.clear();
                                });
                              },
                              child: const Icon(
                                CupertinoIcons.clear_circled_solid,
                                color: Color(0xFF8E8E93),
                                size: 20,
                              ),
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 16,
                      ),
                    ),
                    onChanged: (value) {
                      setState(() {
                        _searchQuery = value;
                      });
                    },
                  ),
                ),
                const SizedBox(height: 12),
                // Durum filtresi
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildStatusFilterChip('Tümü', 'all', _selectedStatus == 'all'),
                      const SizedBox(width: 8),
                      ...statuses.map((status) => Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: _buildStatusFilterChip(
                              statusDisplayNames[status] ?? status,
                              status,
                              _selectedStatus == status,
                            ),
                          )),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Servis talepleri listesi
          Expanded(
            child: serviceRequestsAsync.when(
              data: (serviceRequests) {
                List<ServiceRequest> filteredRequests = serviceRequests;

                // Durum filtresi
                if (_selectedStatus != 'all') {
                  filteredRequests = filteredRequests
                      .where((request) => request.status == _selectedStatus)
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
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.build_outlined,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _searchQuery.isNotEmpty || _selectedStatus != 'all'
                              ? 'Arama kriterlerinize uygun servis talebi bulunamadı'
                              : 'Henüz servis talebi bulunmuyor',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                          ),
                        ),
                        if (_searchQuery.isEmpty && _selectedStatus == 'all') ...[
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: () => context.go('/service-requests/create'),
                            icon: const Icon(Icons.add),
                            label: const Text('İlk Servis Talebini Oluştur'),
                          ),
                        ],
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(serviceRequestsProvider);
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredRequests.length,
                    itemBuilder: (context, index) {
                      final serviceRequest = filteredRequests[index];
                      return _buildServiceRequestCard(
                        serviceRequest,
                        statusColors,
                        priorityColors,
                        statusDisplayNames,
                        priorityDisplayNames,
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: 64,
                      color: Colors.red[400],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Servis talepleri yüklenirken hata oluştu',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.red[600],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      error.toString(),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        ref.invalidate(serviceRequestsProvider);
                      },
                      child: const Text('Tekrar Dene'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusFilterChip(String label, String value, bool isSelected) {
    return CupertinoButton(
      onPressed: () {
        setState(() {
          _selectedStatus = value;
        });
      },
      padding: EdgeInsets.zero,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFB73D3D) : const Color(0xFFF2F2F7),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: isSelected ? Colors.white : const Color(0xFF8E8E93),
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildServiceRequestCard(
    ServiceRequest serviceRequest,
    Map<String, String> statusColors,
    Map<String, String> priorityColors,
    Map<String, String> statusDisplayNames,
    Map<String, String> priorityDisplayNames,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: CupertinoButton(
        onPressed: () => context.go('/service-requests/${serviceRequest.id}'),
        padding: EdgeInsets.zero,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Başlık ve durum
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          serviceRequest.title,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF000000),
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (serviceRequest.serviceType != null)
                          Text(
                            'Tip: ${serviceRequest.serviceType}',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontSize: 12,
                              color: const Color(0xFF8E8E93),
                            ),
                          ),
                      ],
                    ),
                  ),
                  _buildStatusChipWidget(
                    statusDisplayNames[serviceRequest.status] ?? serviceRequest.status,
                    serviceRequest.status,
                    statusColors,
                  ),
                  const SizedBox(width: 8),
                  _buildPriorityChip(
                    priorityDisplayNames[serviceRequest.priority] ?? serviceRequest.priority,
                    serviceRequest.priority,
                    priorityColors,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Açıklama
              if (serviceRequest.description != null && serviceRequest.description!.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(
                    serviceRequest.description!,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontSize: 14,
                      color: const Color(0xFF8E8E93),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              // Konum bilgisi
              if (serviceRequest.location != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      const Icon(
                        CupertinoIcons.location,
                        size: 16,
                        color: Color(0xFF8E8E93),
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          serviceRequest.location!,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontSize: 14,
                            color: const Color(0xFF8E8E93),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              // Tarih bilgileri
              Row(
                children: [
                  const Icon(
                    CupertinoIcons.clock,
                    size: 16,
                    color: Color(0xFF8E8E93),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Oluşturulma: ${_formatDate(serviceRequest.createdAt)}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontSize: 12,
                      color: const Color(0xFF8E8E93),
                    ),
                  ),
                  if (serviceRequest.dueDate != null) ...[
                    const SizedBox(width: 16),
                    const Icon(
                      CupertinoIcons.time,
                      size: 16,
                      color: Color(0xFFFF9500),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Bitiş: ${_formatDate(serviceRequest.dueDate!)}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontSize: 12,
                        color: const Color(0xFFFF9500),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ],
              ),
              // Not sayısı
              if (serviceRequest.notes != null && serviceRequest.notes!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(
                      CupertinoIcons.doc_text,
                      size: 16,
                      color: Color(0xFFB73D3D),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${serviceRequest.notes!.length} not',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontSize: 12,
                        color: const Color(0xFFB73D3D),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
              // Dosya sayısı
              if (serviceRequest.attachments.isNotEmpty) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(
                      CupertinoIcons.paperclip,
                      size: 16,
                      color: Color(0xFF34C759),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${serviceRequest.attachments.length} dosya',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontSize: 12,
                        color: const Color(0xFF34C759),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChipWidget(String label, String status, Map<String, String> statusColors) {
    final color = _getStatusColor(status, statusColors);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }

  Widget _buildPriorityChip(String label, String priority, Map<String, String> priorityColors) {
    final color = _getPriorityColor(priority, priorityColors);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: color,
        ),
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
}
