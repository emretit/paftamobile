import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/service_request.dart';
import '../providers/service_request_provider.dart';
import '../services/service_request_service.dart';
import '../shared/widgets/bottom_navigation_bar.dart';

class ServiceRequestDetailPage extends ConsumerStatefulWidget {
  final String id;

  const ServiceRequestDetailPage({
    super.key,
    required this.id,
  });

  @override
  ConsumerState<ServiceRequestDetailPage> createState() => _ServiceRequestDetailPageState();
}

class _ServiceRequestDetailPageState extends ConsumerState<ServiceRequestDetailPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _noteController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentRoute = GoRouterState.of(context).uri.path;
    final serviceRequestAsync = ref.watch(serviceRequestByIdProvider(widget.id));
    final activitiesAsync = ref.watch(serviceActivitiesProvider(widget.id));
    final historyAsync = ref.watch(serviceHistoryProvider(widget.id));
    final statusDisplayNames = ref.watch(serviceRequestStatusDisplayNamesProvider);
    final priorityDisplayNames = ref.watch(serviceRequestPriorityDisplayNamesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Servis Talebi Detayı'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () => context.go('/service-requests/${widget.id}/edit'),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          tabs: const [
            Tab(text: 'Detaylar'),
            Tab(text: 'Aktiviteler'),
            Tab(text: 'Geçmiş'),
          ],
        ),
      ),
      body: serviceRequestAsync.when(
        data: (serviceRequest) {
          if (serviceRequest == null) {
            return const Center(
              child: Text('Servis talebi bulunamadı'),
            );
          }

          return TabBarView(
            controller: _tabController,
            children: [
              _buildDetailsTab(serviceRequest, statusDisplayNames, priorityDisplayNames),
              _buildActivitiesTab(activitiesAsync),
              _buildHistoryTab(historyAsync),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red[400]),
              const SizedBox(height: 16),
              Text('Hata: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  ref.invalidate(serviceRequestByIdProvider(widget.id));
                },
                child: const Text('Tekrar Dene'),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: CustomBottomNavigationBar(
        currentIndex: CustomBottomNavigationBar.getIndexForRoute(currentRoute),
      ),
    );
  }

  Widget _buildDetailsTab(
    ServiceRequest serviceRequest,
    Map<String, String> statusDisplayNames,
    Map<String, String> priorityDisplayNames,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Başlık ve durum
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          serviceRequest.title,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      _buildStatusChip(
                        statusDisplayNames[serviceRequest.status] ?? serviceRequest.status,
                        serviceRequest.status,
                      ),
                      const SizedBox(width: 8),
                      _buildPriorityChip(
                        priorityDisplayNames[serviceRequest.priority] ?? serviceRequest.priority,
                        serviceRequest.priority,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Temel bilgiler
                  _buildInfoRow('Durum', statusDisplayNames[serviceRequest.status] ?? serviceRequest.status),
                  _buildInfoRow('Öncelik', priorityDisplayNames[serviceRequest.priority] ?? serviceRequest.priority),
                  if (serviceRequest.serviceType != null)
                    _buildInfoRow('Servis Tipi', serviceRequest.serviceType!),
                  if (serviceRequest.location != null)
                    _buildInfoRow('Konum', serviceRequest.location!),
                  _buildInfoRow('Oluşturulma Tarihi', _formatDateTime(serviceRequest.createdAt)),
                  if (serviceRequest.dueDate != null)
                    _buildInfoRow('Bitiş Tarihi', _formatDateTime(serviceRequest.dueDate!)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Açıklama
          if (serviceRequest.description != null && serviceRequest.description!.isNotEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Açıklama',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(serviceRequest.description!),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 16),
          // Notlar
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text(
                        'Notlar',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.add),
                        onPressed: _showAddNoteDialog,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (serviceRequest.notes != null && serviceRequest.notes!.isNotEmpty)
                    ...serviceRequest.notes!.map((note) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.grey[100],
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(note),
                          ),
                        ))
                  else
                    const Text(
                      'Henüz not eklenmemiş',
                      style: TextStyle(color: Colors.grey),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Dosyalar
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text(
                        'Dosyalar',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.attach_file),
                        onPressed: _showAddFileDialog,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (serviceRequest.attachments.isNotEmpty)
                    ...serviceRequest.attachments.map((attachment) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.blue[50],
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.blue[200]!),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.attach_file, color: Colors.blue[600]),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    attachment['name'] ?? 'Dosya',
                                    style: TextStyle(color: Colors.blue[800]),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.download),
                                  onPressed: () {
                                    // Dosya indirme işlemi
                                  },
                                ),
                              ],
                            ),
                          ),
                        ))
                  else
                    const Text(
                      'Henüz dosya eklenmemiş',
                      style: TextStyle(color: Colors.grey),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Durum değiştirme butonları
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Durum Değiştir',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      if (serviceRequest.status == 'new')
                        _buildStatusButton('Atandı', 'assigned', Colors.orange),
                      if (serviceRequest.status == 'assigned')
                        _buildStatusButton('Devam Ediyor', 'in_progress', Colors.green),
                      if (serviceRequest.status == 'in_progress')
                        _buildStatusButton('Beklemede', 'on_hold', Colors.yellow),
                      if (serviceRequest.status == 'on_hold')
                        _buildStatusButton('Devam Ediyor', 'in_progress', Colors.green),
                      if (serviceRequest.status == 'in_progress')
                        _buildStatusButton('Tamamlandı', 'completed', Colors.green),
                      if (serviceRequest.status != 'completed' && serviceRequest.status != 'cancelled')
                        _buildStatusButton('İptal Et', 'cancelled', Colors.red),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivitiesTab(AsyncValue<List<ServiceActivity>> activitiesAsync) {
    return activitiesAsync.when(
      data: (activities) {
        if (activities.isEmpty) {
          return const Center(
            child: Text('Henüz aktivite bulunmuyor'),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: activities.length,
          itemBuilder: (context, index) {
            final activity = activities[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      activity.activityType,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (activity.description != null) ...[
                      const SizedBox(height: 8),
                      Text(activity.description!),
                    ],
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.schedule, size: 16, color: Colors.grey[600]),
                        const SizedBox(width: 4),
                        Text(
                          'Başlangıç: ${_formatDateTime(activity.startTime ?? activity.createdAt)}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        if (activity.endTime != null) ...[
                          const SizedBox(width: 16),
                          Icon(Icons.schedule, size: 16, color: Colors.grey[600]),
                          const SizedBox(width: 4),
                          Text(
                            'Bitiş: ${_formatDateTime(activity.endTime!)}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (activity.laborHours != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.timer, size: 16, color: Colors.blue[600]),
                          const SizedBox(width: 4),
                          Text(
                            '${activity.laborHours} saat',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.blue[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(
        child: Text('Hata: $error'),
      ),
    );
  }

  Widget _buildHistoryTab(AsyncValue<List<ServiceHistory>> historyAsync) {
    return historyAsync.when(
      data: (history) {
        if (history.isEmpty) {
          return const Center(
            child: Text('Henüz geçmiş kaydı bulunmuyor'),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: history.length,
          itemBuilder: (context, index) {
            final historyItem = history[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _getActionDisplayName(historyItem.actionType),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (historyItem.description != null) ...[
                      const SizedBox(height: 8),
                      Text(historyItem.description!),
                    ],
                    const SizedBox(height: 8),
                    Text(
                      _formatDateTime(historyItem.createdAt),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(
        child: Text('Hata: $error'),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String label, String status) {
    Color color;
    switch (status) {
      case 'new':
        color = Colors.blue;
        break;
      case 'assigned':
        color = Colors.orange;
        break;
      case 'in_progress':
        color = Colors.green;
        break;
      case 'on_hold':
        color = Colors.yellow[700]!;
        break;
      case 'completed':
        color = Colors.green;
        break;
      case 'cancelled':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }

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

  Widget _buildPriorityChip(String label, String priority) {
    Color color;
    switch (priority) {
      case 'low':
        color = Colors.green;
        break;
      case 'medium':
        color = Colors.blue;
        break;
      case 'high':
        color = Colors.orange;
        break;
      case 'urgent':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }

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

  Widget _buildStatusButton(String label, String status, Color color) {
    return ElevatedButton(
      onPressed: () => _updateStatus(status),
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
      ),
      child: Text(label),
    );
  }

  void _updateStatus(String status) async {
    try {
      final service = ref.read(serviceRequestServiceProvider);
      await service.updateServiceRequestStatus(widget.id, status);
      
      // Provider'ı yenile
      ref.invalidate(serviceRequestByIdProvider(widget.id));
      ref.invalidate(serviceHistoryProvider(widget.id));
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Durum $status olarak güncellendi')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hata: $e')),
        );
      }
    }
  }

  void _showAddNoteDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Not Ekle'),
        content: TextField(
          controller: _noteController,
          decoration: const InputDecoration(
            hintText: 'Notunuzu yazın...',
            border: OutlineInputBorder(),
          ),
          maxLines: 3,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (_noteController.text.isNotEmpty) {
                try {
                  final service = ref.read(serviceRequestServiceProvider);
                  await service.addNote(widget.id, _noteController.text);
                  
                  // Provider'ı yenile
                  ref.invalidate(serviceRequestByIdProvider(widget.id));
                  ref.invalidate(serviceHistoryProvider(widget.id));
                  
                  _noteController.clear();
                  Navigator.pop(context);
                  
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Not eklendi')),
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Hata: $e')),
                    );
                  }
                }
              }
            },
            child: const Text('Ekle'),
          ),
        ],
      ),
    );
  }

  void _showAddFileDialog() {
    // Dosya ekleme dialog'u
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Dosya ekleme özelliği yakında eklenecek')),
    );
  }

  String _getActionDisplayName(String actionType) {
    switch (actionType) {
      case 'status_changed':
        return 'Durum Değiştirildi';
      case 'assigned':
        return 'Atandı';
      case 'note_added':
        return 'Not Eklendi';
      case 'attachment_added':
        return 'Dosya Eklendi';
      default:
        return actionType;
    }
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day.toString().padLeft(2, '0')}.${dateTime.month.toString().padLeft(2, '0')}.${dateTime.year} ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
