import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/service_request.dart';
import '../providers/service_request_provider.dart';
import '../services/service_request_service.dart';

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
    final serviceRequestAsync = ref.watch(serviceRequestByIdProvider(widget.id));
    final activitiesAsync = ref.watch(serviceActivitiesProvider(widget.id));
    final historyAsync = ref.watch(serviceHistoryProvider(widget.id));
    final statusDisplayNames = ref.watch(serviceRequestStatusDisplayNamesProvider);
    final priorityDisplayNames = ref.watch(serviceRequestPriorityDisplayNamesProvider);
    final statusColors = ref.watch(serviceRequestStatusColorsProvider);
    final priorityColors = ref.watch(serviceRequestPriorityColorsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF2F2F7),
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFB73D3D), Color(0xFF8B2F2F)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                CupertinoIcons.wrench_fill,
                color: Colors.white,
                size: 16,
              ),
            ),
            const SizedBox(width: 10),
            const Text('Servis Detayı'),
          ],
        ),
        backgroundColor: const Color(0xFFF2F2F7),
        foregroundColor: const Color(0xFF000000),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            onPressed: () => context.go('/service/edit/${widget.id}'),
            icon: const Icon(CupertinoIcons.pencil, size: 22),
            color: const Color(0xFFB73D3D),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFFB73D3D),
          unselectedLabelColor: const Color(0xFF8E8E93),
          indicatorColor: const Color(0xFFB73D3D),
          indicatorWeight: 3,
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
            return _buildNotFoundState();
          }

          return TabBarView(
            controller: _tabController,
            children: [
              _buildDetailsTab(
                serviceRequest,
                statusDisplayNames,
                priorityDisplayNames,
                statusColors,
                priorityColors,
              ),
              _buildActivitiesTab(activitiesAsync),
              _buildHistoryTab(historyAsync),
            ],
          );
        },
        loading: () => const Center(child: CupertinoActivityIndicator()),
        error: (error, stack) => _buildErrorState(error),
      ),
    );
  }

  Widget _buildDetailsTab(
    ServiceRequest serviceRequest,
    Map<String, String> statusDisplayNames,
    Map<String, String> priorityDisplayNames,
    Map<String, String> statusColors,
    Map<String, String> priorityColors,
  ) {
    final statusColor = _getStatusColor(serviceRequest.status, statusColors);
    final priorityColor = _getPriorityColor(serviceRequest.priority, priorityColors);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(serviceRequestByIdProvider(widget.id));
      },
      color: const Color(0xFFB73D3D),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          children: [
            // Gradient Header
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFFB73D3D), Color(0xFF8B2F2F)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Başlık ve Durum
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            serviceRequest.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _buildStatusBadge(
                          statusDisplayNames[serviceRequest.status] ?? serviceRequest.status,
                          statusColor,
                        ),
                        const SizedBox(width: 8),
                        _buildPriorityBadge(
                          priorityDisplayNames[serviceRequest.priority] ?? serviceRequest.priority,
                          priorityColor,
                        ),
                      ],
                    ),
                    if (serviceRequest.serviceType != null) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.3),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          serviceRequest.serviceType!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            
            // Main Content
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Temel Bilgiler Kartı
                  _buildInfoCard(
                    'Temel Bilgiler',
                    CupertinoIcons.info_circle,
                    const Color(0xFF3B82F6),
                    [
                      if (serviceRequest.serviceNumber != null)
                        _buildInfoRow('Servis No', serviceRequest.serviceNumber!, const Color(0xFF3B82F6)),
                      _buildInfoRow('Durum', statusDisplayNames[serviceRequest.status] ?? serviceRequest.status, statusColor),
                      _buildInfoRow('Öncelik', priorityDisplayNames[serviceRequest.priority] ?? serviceRequest.priority, priorityColor),
                      if (serviceRequest.location != null)
                        _buildInfoRow('Konum', serviceRequest.location!, const Color(0xFF8E8E93)),
                      if (serviceRequest.assignedTechnician != null)
                        _buildInfoRow('Teknisyen', 'Atanmış', const Color(0xFF10B981)),
                      if (serviceRequest.receivedBy != null)
                        _buildInfoRow('Talebi Alan', 'Seçilmiş', const Color(0xFF8B5CF6)),
                      if (serviceRequest.createdBy != null)
                        _buildInfoRow('Oluşturan', 'Kullanıcı', const Color(0xFF8E8E93)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Tarih Bilgileri Kartı
                  _buildInfoCard(
                    'Tarih Bilgileri',
                    CupertinoIcons.calendar,
                    const Color(0xFF9B59B6),
                    [
                      _buildInfoRow('Oluşturulma', _formatDateTime(serviceRequest.createdAt), const Color(0xFF8E8E93)),
                      if (serviceRequest.reportedDate != null)
                        _buildInfoRow('Bildirim Tarihi', _formatDateTime(serviceRequest.reportedDate!), const Color(0xFF8E8E93)),
                      if (serviceRequest.dueDate != null)
                        _buildInfoRow('Hedef Teslim Tarihi', _formatDateTime(serviceRequest.dueDate!), 
                          serviceRequest.dueDate!.isBefore(DateTime.now()) 
                            ? const Color(0xFFEF4444) 
                            : const Color(0xFF8E8E93)),
                      if (serviceRequest.serviceStartDate != null)
                        _buildInfoRow('Servis Başlama Tarihi', _formatDateTime(serviceRequest.serviceStartDate!), const Color(0xFF10B981)),
                      if (serviceRequest.serviceEndDate != null)
                        _buildInfoRow('Servis Bitirme Tarihi', _formatDateTime(serviceRequest.serviceEndDate!), const Color(0xFF3B82F6)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Açıklama Kartı
                  if (serviceRequest.description != null && serviceRequest.description!.isNotEmpty)
                    _buildInfoCard(
                      'Açıklama',
                      CupertinoIcons.text_alignleft,
                      const Color(0xFF8B5CF6),
                      [
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(
                            serviceRequest.description!,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Color(0xFF4A4A4A),
                              height: 1.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  if (serviceRequest.description != null && serviceRequest.description!.isNotEmpty)
                    const SizedBox(height: 16),
                  
                  // Notlar Kartı
                  _buildInfoCard(
                    'Notlar',
                    CupertinoIcons.doc_text,
                    const Color(0xFFFF9500),
                    [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Şirket İçi Notlar',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF000000),
                            ),
                          ),
                          CupertinoButton(
                            padding: EdgeInsets.zero,
                            onPressed: _showAddNoteDialog,
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFF9500).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(
                                CupertinoIcons.add,
                                size: 18,
                                color: Color(0xFFFF9500),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (serviceRequest.notes != null && serviceRequest.notes!.isNotEmpty)
                        ...serviceRequest.notes!.map((note) => _buildNoteItem(note))
                      else
                        _buildEmptyItem('Henüz not eklenmemiş'),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Dosyalar Kartı
                  _buildInfoCard(
                    'Dosyalar',
                    CupertinoIcons.paperclip,
                    const Color(0xFF10B981),
                    [
                      if (serviceRequest.attachments.isNotEmpty)
                        ...serviceRequest.attachments.asMap().entries.map((entry) => 
                          _buildAttachmentItem(entry.value, entry.key)
                        )
                      else
                        _buildEmptyItem('Henüz dosya eklenmemiş'),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Servis İşlemleri
                  if (serviceRequest.status == 'assigned' || serviceRequest.status == 'new')
                    _buildActionButton(
                      'Servisi Başlat',
                      CupertinoIcons.play_circle,
                      const Color(0xFF10B981),
                      () => _startService(),
                    ),
                  if (serviceRequest.status == 'in_progress')
                    _buildActionButton(
                      'Servisi Bitir',
                      CupertinoIcons.checkmark_circle,
                      const Color(0xFF3B82F6),
                      () => _completeService(),
                    ),
                  if (serviceRequest.status == 'completed') ...[
                    if (!serviceRequest.hasServiceSlip)
                      _buildActionButton(
                        'Servis Fişi Oluştur',
                        CupertinoIcons.doc_text,
                        const Color(0xFFB73D3D),
                        () => _createServiceSlip(),
                      )
                    else ...[
                      _buildActionButton(
                        'Servis Fişini Görüntüle',
                        CupertinoIcons.eye,
                        const Color(0xFF10B981),
                        () => _viewServiceSlip(),
                      ),
                      const SizedBox(height: 8),
                      _buildActionButton(
                        'Servis Fişini Düzenle',
                        CupertinoIcons.pencil,
                        const Color(0xFFB73D3D),
                        () => _createServiceSlip(),
                      ),
                    ],
                  ],
                  const SizedBox(height: 16),
                  
                  // Durum Değiştir
                  if (serviceRequest.status != 'completed' && serviceRequest.status != 'cancelled')
                    _buildStatusChangeSection(serviceRequest),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(String title, IconData icon, Color iconColor, List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.grey.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: iconColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    icon,
                    color: iconColor,
                    size: 18,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF000000),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, Color? valueColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                color: valueColor ?? const Color(0xFF000000),
                fontWeight: valueColor != null ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.white.withOpacity(0.3),
          width: 1.5,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriorityBadge(String label, Color color) {
    String emoji;
    switch (label) {
      case 'Acil':
        emoji = '🔴';
        break;
      case 'Yüksek':
        emoji = '🟠';
        break;
      case 'Normal':
        emoji = '🟡';
        break;
      case 'Düşük':
        emoji = '🟢';
        break;
      default:
        emoji = '⚪';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.white.withOpacity(0.3),
          width: 1.5,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoteItem(String note) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF2F2F7),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            CupertinoIcons.doc_text,
            size: 16,
            color: Colors.grey[600],
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              note,
              style: const TextStyle(
                fontSize: 13,
                color: Color(0xFF4A4A4A),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAttachmentItem(dynamic attachment, int index) {
    final fileName = attachment is Map ? (attachment['name'] ?? 'Dosya') : 'Dosya';
    
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF10B981).withOpacity(0.05),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: const Color(0xFF10B981).withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            CupertinoIcons.paperclip,
            size: 16,
            color: const Color(0xFF10B981),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              fileName,
              style: const TextStyle(
                fontSize: 13,
                color: Color(0xFF000000),
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          IconButton(
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            onPressed: () {
              // TODO: Dosya indirme
            },
            icon: Icon(
              CupertinoIcons.arrow_down_circle,
              size: 18,
              color: const Color(0xFF10B981),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyItem(String message) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Text(
        message,
        style: TextStyle(
          fontSize: 13,
          color: Colors.grey[500],
          fontStyle: FontStyle.italic,
        ),
      ),
    );
  }

  Widget _buildActionButton(String label, IconData icon, Color color, VoidCallback onTap) {
    return SizedBox(
      width: double.infinity,
      child: CupertinoButton(
        onPressed: onTap,
        color: color,
        borderRadius: BorderRadius.circular(16),
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChangeSection(ServiceRequest serviceRequest) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.grey.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFFB73D3D).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    CupertinoIcons.arrow_2_squarepath,
                    color: Color(0xFFB73D3D),
                    size: 18,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Durum Değiştir',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF000000),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (serviceRequest.status == 'new')
                  _buildStatusButton('Atandı', 'assigned', const Color(0xFFFF9500)),
                if (serviceRequest.status == 'assigned')
                  _buildStatusButton('Devam Ediyor', 'in_progress', const Color(0xFF10B981)),
                if (serviceRequest.status == 'in_progress') ...[
                  _buildStatusButton('Beklemede', 'on_hold', const Color(0xFFFF9500)),
                  _buildStatusButton('Tamamlandı', 'completed', const Color(0xFF10B981)),
                ],
                if (serviceRequest.status == 'on_hold')
                  _buildStatusButton('Devam Ediyor', 'in_progress', const Color(0xFF10B981)),
                if (serviceRequest.status != 'completed' && serviceRequest.status != 'cancelled')
                  _buildStatusButton('İptal Et', 'cancelled', const Color(0xFFEF4444)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusButton(String label, String status, Color color) {
    return CupertinoButton(
      onPressed: () => _updateStatus(status),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: color,
      borderRadius: BorderRadius.circular(10),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildActivitiesTab(AsyncValue<List<ServiceActivity>> activitiesAsync) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(serviceActivitiesProvider(widget.id));
      },
      color: const Color(0xFFB73D3D),
      child: activitiesAsync.when(
        data: (activities) {
          if (activities.isEmpty) {
            return _buildEmptyState('Henüz aktivite bulunmuyor', CupertinoIcons.list_bullet);
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: activities.length,
            itemBuilder: (context, index) {
              return _buildActivityItemCompact(activities[index]);
            },
          );
        },
        loading: () => const Center(child: CupertinoActivityIndicator()),
        error: (error, stack) => _buildEmptyState('Aktiviteler yüklenemedi', CupertinoIcons.exclamationmark_triangle),
      ),
    );
  }

  Widget _buildActivityItemCompact(ServiceActivity activity) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.grey.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 6,
                  height: 30,
                  decoration: BoxDecoration(
                    color: const Color(0xFF3B82F6),
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        activity.activityType,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF000000),
                        ),
                      ),
                      if (activity.description != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          activity.description!,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            if (activity.startTime != null || activity.laborHours != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  if (activity.startTime != null) ...[
                    Icon(
                      CupertinoIcons.clock,
                      size: 12,
                      color: Colors.grey[500],
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _formatDateTime(activity.startTime!),
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                  if (activity.laborHours != null) ...[
                    if (activity.startTime != null) const SizedBox(width: 12),
                    Icon(
                      CupertinoIcons.timer,
                      size: 12,
                      color: const Color(0xFF3B82F6),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${activity.laborHours} saat',
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF3B82F6),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryTab(AsyncValue<List<ServiceHistory>> historyAsync) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(serviceHistoryProvider(widget.id));
      },
      color: const Color(0xFFB73D3D),
      child: historyAsync.when(
        data: (history) {
          if (history.isEmpty) {
            return _buildEmptyState('Henüz geçmiş kaydı bulunmuyor', CupertinoIcons.clock);
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: history.length,
            itemBuilder: (context, index) {
              return _buildHistoryItemCompact(history[index]);
            },
          );
        },
        loading: () => const Center(child: CupertinoActivityIndicator()),
        error: (error, stack) => _buildEmptyState('Geçmiş yüklenemedi', CupertinoIcons.exclamationmark_triangle),
      ),
    );
  }

  Widget _buildHistoryItemCompact(ServiceHistory history) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.grey.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 6,
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFF8B5CF6),
                borderRadius: BorderRadius.circular(3),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _getActionDisplayName(history.actionType),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF000000),
                    ),
                  ),
                  if (history.description != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      history.description!,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 4),
                  Text(
                    _formatDateTime(history.createdAt),
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey[500],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotFoundState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
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
                CupertinoIcons.exclamationmark_triangle,
                size: 48,
                color: Colors.grey[400],
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Servis talebi bulunamadı',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Color(0xFF000000),
              ),
            ),
            const SizedBox(height: 24),
            CupertinoButton(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              color: const Color(0xFFB73D3D),
              borderRadius: BorderRadius.circular(10),
              onPressed: () => context.go('/service/management'),
              child: const Text(
                'Geri Dön',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(Object error) {
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
            const Text(
              'Bir hata oluştu',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF000000),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            CupertinoButton(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              color: const Color(0xFFB73D3D),
              borderRadius: BorderRadius.circular(10),
              onPressed: () {
                ref.invalidate(serviceRequestByIdProvider(widget.id));
              },
              child: const Text(
                'Tekrar Dene',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message, IconData icon) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              message,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  void _updateStatus(String status) async {
    try {
      final service = ref.read(serviceRequestServiceProvider);
      await service.updateServiceRequestStatus(widget.id, status);
      
      ref.invalidate(serviceRequestByIdProvider(widget.id));
      ref.invalidate(serviceHistoryProvider(widget.id));
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Durum güncellendi')),
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
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Not Ekle'),
        content: Padding(
          padding: const EdgeInsets.only(top: 16),
          child: CupertinoTextField(
            controller: _noteController,
            placeholder: 'Notunuzu yazın...',
            maxLines: 3,
            padding: const EdgeInsets.all(12),
          ),
        ),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          CupertinoDialogAction(
            isDefaultAction: true,
            onPressed: () async {
              if (_noteController.text.isNotEmpty) {
                try {
                  final service = ref.read(serviceRequestServiceProvider);
                  await service.addNote(widget.id, _noteController.text);
                  
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

  void _startService() async {
    try {
      final service = ref.read(serviceRequestServiceProvider);
      await service.updateServiceRequestStatus(widget.id, 'in_progress');
      
      ref.invalidate(serviceRequestByIdProvider(widget.id));
      ref.invalidate(serviceHistoryProvider(widget.id));
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Servis başlatıldı')),
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

  void _completeService() async {
    try {
      final service = ref.read(serviceRequestServiceProvider);
      await service.updateServiceRequestStatus(widget.id, 'completed');
      
      ref.invalidate(serviceRequestByIdProvider(widget.id));
      ref.invalidate(serviceHistoryProvider(widget.id));
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Servis tamamlandı')),
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

  void _createServiceSlip() {
    context.go('/service/${widget.id}/slip');
  }

  void _viewServiceSlip() {
    context.go('/service/${widget.id}/slip/view');
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

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final requestDate = DateTime(date.year, date.month, date.day);

    if (requestDate == today) {
      return 'Bugün ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } else if (requestDate == today.add(const Duration(days: 1))) {
      return 'Yarın ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } else {
      return '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    }
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day.toString().padLeft(2, '0')}.${dateTime.month.toString().padLeft(2, '0')}.${dateTime.year} ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
