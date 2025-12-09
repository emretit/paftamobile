import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/service_request.dart';
import '../providers/service_request_provider.dart';
import '../services/service_request_service.dart';
import '../providers/auth_provider.dart';
import '../providers/inventory_provider.dart';
import '../models/product.dart';

class ServiceRequestDetailPage extends ConsumerStatefulWidget {
  final String id;

  const ServiceRequestDetailPage({
    super.key,
    required this.id,
  });

  @override
  ConsumerState<ServiceRequestDetailPage> createState() => _ServiceRequestDetailPageState();
}

class _ServiceRequestDetailPageState extends ConsumerState<ServiceRequestDetailPage> {
  final TextEditingController _noteController = TextEditingController();
  
  // Düzenleme modu
  bool _isEditing = false;
  bool _isSaving = false;
  final _editFormKey = GlobalKey<FormState>();
  final _editTitleController = TextEditingController();
  final _editDescriptionController = TextEditingController();
  final _editLocationController = TextEditingController();
  final _editContactPersonController = TextEditingController();
  final _editContactPhoneController = TextEditingController();
  final _editContactEmailController = TextEditingController();
  final _editNotesController = TextEditingController();
  String? _editSelectedPriority;
  String? _editSelectedStatus;
  String? _editSelectedServiceType;
  DateTime? _editDueDate;
  TimeOfDay? _editDueTime;
  
  // Servis fişi form controller'ları
  final _formKey = GlobalKey<FormState>();
  final _technicianNameController = TextEditingController();
  final _customerNameController = TextEditingController();
  final _customerPhoneController = TextEditingController();
  final _customerAddressController = TextEditingController();
  final _equipmentBrandController = TextEditingController();
  final _equipmentModelController = TextEditingController();
  final _equipmentSerialController = TextEditingController();
  final _problemDescriptionController = TextEditingController();
  final _servicePerformedController = TextEditingController();
  final _serviceSlipNotesController = TextEditingController();
  
  bool _isSlipLoading = false;
  String? _lastInitializedServiceId;
  String? _selectedTechnicianId;
  List<Map<String, dynamic>> _usedProducts = [];

  @override
  void dispose() {
    _noteController.dispose();
    _editTitleController.dispose();
    _editDescriptionController.dispose();
    _editLocationController.dispose();
    _editContactPersonController.dispose();
    _editContactPhoneController.dispose();
    _editContactEmailController.dispose();
    _editNotesController.dispose();
    _technicianNameController.dispose();
    _customerNameController.dispose();
    _customerPhoneController.dispose();
    _customerAddressController.dispose();
    _equipmentBrandController.dispose();
    _equipmentModelController.dispose();
    _equipmentSerialController.dispose();
    _problemDescriptionController.dispose();
    _servicePerformedController.dispose();
    _serviceSlipNotesController.dispose();
    super.dispose();
  }
  
  void _initializeEditForm(ServiceRequest serviceRequest) {
    _editTitleController.text = serviceRequest.title;
    _editDescriptionController.text = serviceRequest.description ?? '';
    _editLocationController.text = serviceRequest.location ?? '';
    _editContactPersonController.text = serviceRequest.contactPerson ?? '';
    _editContactPhoneController.text = serviceRequest.contactPhone ?? '';
    _editContactEmailController.text = serviceRequest.contactEmail ?? '';
    _editNotesController.text = serviceRequest.notes?.join('\n') ?? '';
    _editSelectedPriority = serviceRequest.priority;
    _editSelectedStatus = serviceRequest.status;
    _editSelectedServiceType = serviceRequest.serviceType ?? '';
    _editDueDate = serviceRequest.dueDate;
    if (serviceRequest.dueDate != null) {
      _editDueTime = TimeOfDay.fromDateTime(serviceRequest.dueDate!);
    }
  }
  
  void _startEditing(ServiceRequest serviceRequest) {
    _initializeEditForm(serviceRequest);
    setState(() {
      _isEditing = true;
    });
  }
  
  void _cancelEditing() {
    setState(() {
      _isEditing = false;
    });
  }
  
  Future<void> _saveEdit() async {
    if (!_editFormKey.currentState!.validate()) {
      return;
    }
    
    setState(() {
      _isSaving = true;
    });
    
    try {
      final serviceRequest = await ref.read(serviceRequestByIdProvider(widget.id).future);
      if (serviceRequest == null) {
        throw Exception('Servis talebi bulunamadı');
      }
      
      // Due date'i birleştir
      DateTime? combinedDueDate;
      if (_editDueDate != null) {
        if (_editDueTime != null) {
          combinedDueDate = DateTime(
            _editDueDate!.year,
            _editDueDate!.month,
            _editDueDate!.day,
            _editDueTime!.hour,
            _editDueTime!.minute,
          );
        } else {
          combinedDueDate = _editDueDate;
        }
      }
      
      // Notları listeye çevir
      List<String> notesList = [];
      if (_editNotesController.text.isNotEmpty) {
        notesList = _editNotesController.text.split('\n').where((n) => n.trim().isNotEmpty).toList();
      }
      
      final updatedRequest = ServiceRequest(
        id: serviceRequest.id,
        title: _editTitleController.text,
        description: _editDescriptionController.text.isEmpty ? null : _editDescriptionController.text,
        location: _editLocationController.text.isEmpty ? null : _editLocationController.text,
        priority: _editSelectedPriority ?? serviceRequest.priority,
        status: _editSelectedStatus ?? serviceRequest.status,
        serviceType: _editSelectedServiceType?.isEmpty ?? true ? null : _editSelectedServiceType,
        dueDate: combinedDueDate,
        contactPerson: _editContactPersonController.text.isEmpty ? null : _editContactPersonController.text,
        contactPhone: _editContactPhoneController.text.isEmpty ? null : _editContactPhoneController.text,
        contactEmail: _editContactEmailController.text.isEmpty ? null : _editContactEmailController.text,
        notes: notesList.isEmpty ? null : notesList,
        customerId: serviceRequest.customerId,
        supplierId: serviceRequest.supplierId,
        assignedTo: serviceRequest.assignedTo,
        receivedBy: serviceRequest.receivedBy,
        reportedDate: serviceRequest.reportedDate,
        serviceStartDate: serviceRequest.serviceStartDate,
        serviceEndDate: serviceRequest.serviceEndDate,
        createdAt: serviceRequest.createdAt,
        updatedAt: DateTime.now(),
        slipNumber: serviceRequest.slipNumber,
        technicianName: serviceRequest.technicianName,
        customerData: serviceRequest.customerData,
        equipmentData: serviceRequest.equipmentData,
        serviceDetails: serviceRequest.serviceDetails,
        serviceResult: serviceRequest.serviceResult,
      );
      
      final service = ref.read(serviceRequestServiceProvider);
      await service.updateServiceRequest(widget.id, updatedRequest);
      
      ref.invalidate(serviceRequestByIdProvider(widget.id));
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Servis talebi başarıyla güncellendi')),
        );
        setState(() {
          _isEditing = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hata: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }
  
  void _initializeSlipFormData(ServiceRequest serviceRequest) {
    // Aynı servis talebi için zaten başlatıldıysa tekrar başlatma
    if (_lastInitializedServiceId == serviceRequest.id) return;
    
    // Controller'ları temizle
    _technicianNameController.clear();
    _customerNameController.clear();
    _customerPhoneController.clear();
    _customerAddressController.clear();
    _equipmentBrandController.clear();
    _equipmentModelController.clear();
    _equipmentSerialController.clear();
    _problemDescriptionController.clear();
    _servicePerformedController.clear();
    _serviceSlipNotesController.clear();
    _usedProducts.clear();
    _selectedTechnicianId = null;
    
    if (serviceRequest.hasServiceSlip) {
      _technicianNameController.text = serviceRequest.technicianName ?? '';
      
      if (serviceRequest.customerData != null) {
        final customerData = serviceRequest.customerData!;
        _customerNameController.text = customerData['name']?.toString() ?? '';
        _customerPhoneController.text = customerData['phone']?.toString() ?? '';
        _customerAddressController.text = customerData['address']?.toString() ?? '';
      }
      
      if (serviceRequest.equipmentData != null) {
        final equipmentData = serviceRequest.equipmentData!;
        _equipmentBrandController.text = equipmentData['brand']?.toString() ?? '';
        _equipmentModelController.text = equipmentData['model']?.toString() ?? '';
        _equipmentSerialController.text = equipmentData['serial_number']?.toString() ?? '';
      }
      
      if (serviceRequest.serviceDetails != null) {
        final serviceDetails = serviceRequest.serviceDetails!;
        _problemDescriptionController.text = serviceDetails['problem_description']?.toString() ?? '';
        _servicePerformedController.text = serviceDetails['service_performed']?.toString() ?? '';
        _serviceSlipNotesController.text = serviceDetails['notes']?.toString() ?? '';
        
        if (serviceDetails['used_products'] != null) {
          _usedProducts = List<Map<String, dynamic>>.from(serviceDetails['used_products']);
        }
      }
    } else {
      _problemDescriptionController.text = serviceRequest.description ?? '';
      if (serviceRequest.location != null) {
        _customerAddressController.text = serviceRequest.location!;
      }
    }
    
    _lastInitializedServiceId = serviceRequest.id;
  }

  @override
  Widget build(BuildContext context) {
    final serviceRequestAsync = ref.watch(serviceRequestByIdProvider(widget.id));
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
          if (!_isEditing)
            IconButton(
              onPressed: () {
                serviceRequestAsync.whenData((serviceRequest) {
                  if (serviceRequest != null) {
                    _startEditing(serviceRequest);
                  }
                });
              },
              icon: const Icon(CupertinoIcons.pencil, size: 22),
              color: const Color(0xFFB73D3D),
            ),
        ],
      ),
      body: serviceRequestAsync.when(
        data: (serviceRequest) {
          if (serviceRequest == null) {
            return _buildNotFoundState();
          }

          return _buildDetailsPage(
            serviceRequest,
            statusDisplayNames,
            priorityDisplayNames,
            statusColors,
            priorityColors,
          );
        },
        loading: () => const Center(child: CupertinoActivityIndicator()),
        error: (error, stack) => _buildErrorState(error),
      ),
    );
  }

  Widget _buildDetailsPage(
    ServiceRequest serviceRequest,
    Map<String, String> statusDisplayNames,
    Map<String, String> priorityDisplayNames,
    Map<String, String> statusColors,
    Map<String, String> priorityColors,
  ) {
    final statusColor = _getStatusColor(serviceRequest.status, statusColors);
    final priorityColor = _getPriorityColor(serviceRequest.priority, priorityColors);
    
    // Servis fişi form verilerini başlat (sadece completed durumunda)
    if (serviceRequest.status == 'completed') {
      _initializeSlipFormData(serviceRequest);
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(serviceRequestByIdProvider(widget.id));
      },
      color: const Color(0xFFB73D3D),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Temel Bilgiler - Düzenleme modunda form, normal modda bilgi gösterimi
              _isEditing
                  ? _buildEditFormCard(serviceRequest, statusDisplayNames, priorityDisplayNames)
                  : _buildInfoCard(
                      'Bilgiler',
                      CupertinoIcons.info_circle,
                      const Color(0xFF3B82F6),
                      [
                        // Başlık
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Text(
                            serviceRequest.title,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF000000),
                              letterSpacing: -0.3,
                            ),
                          ),
                        ),
                        // Durum, Öncelik ve Tür
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Wrap(
                            spacing: 6,
                            runSpacing: 6,
                            children: [
                              _buildStatusBadgeInline(
                                statusDisplayNames[serviceRequest.status] ?? serviceRequest.status,
                                statusColor,
                              ),
                              _buildPriorityBadgeInline(
                                priorityDisplayNames[serviceRequest.priority] ?? serviceRequest.priority,
                                priorityColor,
                              ),
                              if (serviceRequest.serviceType != null)
                                _buildServiceTypeBadgeInline(serviceRequest.serviceType!),
                            ],
                          ),
                        ),
                        const Divider(height: 1),
                        const SizedBox(height: 12),
                        if (serviceRequest.location != null)
                          _buildInfoRow('Konum', serviceRequest.location!, const Color(0xFF8E8E93)),
                        if (serviceRequest.technicianName != null)
                          _buildInfoRow('Teknisyen', serviceRequest.technicianName!, const Color(0xFF10B981)),
                        _buildInfoRow('Oluşturulma', _formatDateTime(serviceRequest.createdAt), const Color(0xFF8E8E93)),
                        if (serviceRequest.reportedDate != null)
                          _buildInfoRow('Bildirim', _formatDateTime(serviceRequest.reportedDate!), const Color(0xFF8E8E93)),
                        if (serviceRequest.dueDate != null)
                          _buildInfoRow('Hedef Teslim', _formatDateTime(serviceRequest.dueDate!), 
                            serviceRequest.dueDate!.isBefore(DateTime.now()) 
                              ? const Color(0xFFEF4444) 
                              : const Color(0xFF8E8E93)),
                        if (serviceRequest.serviceStartDate != null)
                          _buildInfoRow('Başlama', _formatDateTime(serviceRequest.serviceStartDate!), const Color(0xFF10B981)),
                        if (serviceRequest.serviceEndDate != null)
                          _buildInfoRow('Bitirme', _formatDateTime(serviceRequest.serviceEndDate!), const Color(0xFF3B82F6)),
                      ],
                    ),
              const SizedBox(height: 12),
              
              // Açıklama Kartı (sadece düzenleme modunda değilse göster)
              if (!_isEditing)
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
              if (!_isEditing)
                if (serviceRequest.description != null && serviceRequest.description!.isNotEmpty)
                  const SizedBox(height: 12),
              
              // Notlar ve Dosyalar (Birleştirilmiş) - sadece düzenleme modunda değilse
              if (!_isEditing)
                _buildInfoCard(
                    'Notlar ve Dosyalar',
                    CupertinoIcons.doc_text,
                    const Color(0xFFFF9500),
                    [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Notlar',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF000000),
                            ),
                          ),
                          CupertinoButton(
                            padding: EdgeInsets.zero,
                            minSize: 0,
                            onPressed: _showAddNoteDialog,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFF9500).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Icon(
                                CupertinoIcons.add,
                                size: 16,
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
                      if (serviceRequest.attachments.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        const Divider(height: 1),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(
                              CupertinoIcons.paperclip,
                              size: 14,
                              color: Color(0xFF10B981),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              'Dosyalar (${serviceRequest.attachments.length})',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF000000),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ...serviceRequest.attachments.asMap().entries.map((entry) => 
                          _buildAttachmentItem(entry.value, entry.key)
                        ),
                      ],
                ],
              ),
              // Servis İşlemleri (sadece düzenleme modunda değilse)
              if (!_isEditing) ...[
                const SizedBox(height: 12),
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
                const SizedBox(height: 12),
                
                // Durum Değiştir
                if (serviceRequest.status != 'completed' && serviceRequest.status != 'cancelled')
                  _buildStatusChangeSection(serviceRequest),
                
                const SizedBox(height: 12),
                
                // Servis Fişi (sadece completed durumunda)
                if (serviceRequest.status == 'completed')
                  _buildServiceSlipSection(serviceRequest),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEditFormCard(
    ServiceRequest serviceRequest,
    Map<String, String> statusDisplayNames,
    Map<String, String> priorityDisplayNames,
  ) {
    final serviceTypes = [
      {'value': 'bakım', 'label': 'Bakım'},
      {'value': 'onarım', 'label': 'Onarım'},
      {'value': 'kurulum', 'label': 'Kurulum'},
      {'value': 'yazılım', 'label': 'Yazılım'},
      {'value': 'donanım', 'label': 'Donanım'},
      {'value': 'ağ', 'label': 'Ağ'},
      {'value': 'güvenlik', 'label': 'Güvenlik'},
      {'value': 'diğer', 'label': 'Diğer'},
    ];
    
    return Form(
      key: _editFormKey,
      child: _buildInfoCard(
        'Bilgileri Düzenle',
        CupertinoIcons.pencil,
        const Color(0xFFB73D3D),
        [
              _buildEditTextField('Başlık *', _editTitleController, CupertinoIcons.text_alignleft),
              const SizedBox(height: 12),
              _buildEditTextField('Açıklama', _editDescriptionController, CupertinoIcons.text_alignleft, maxLines: 3),
              const SizedBox(height: 12),
              _buildEditTextField('Konum', _editLocationController, CupertinoIcons.location),
              const SizedBox(height: 12),
              _buildEditDropdown(
                'Durum',
                _editSelectedStatus ?? serviceRequest.status,
                statusDisplayNames,
                (value) => setState(() => _editSelectedStatus = value),
              ),
              const SizedBox(height: 12),
              _buildEditDropdown(
                'Öncelik',
                _editSelectedPriority ?? serviceRequest.priority,
                priorityDisplayNames,
                (value) => setState(() => _editSelectedPriority = value),
              ),
              const SizedBox(height: 12),
              _buildEditServiceTypeDropdown(serviceTypes),
              const SizedBox(height: 12),
              _buildEditDateField('Hedef Teslim Tarihi', _editDueDate, _editDueTime, (date, time) {
                setState(() {
                  _editDueDate = date;
                  _editDueTime = time;
                });
              }),
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 12),
              const Text(
                'İletişim Bilgileri',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF000000),
                ),
              ),
              const SizedBox(height: 8),
              _buildEditTextField('İletişim Kişisi', _editContactPersonController, CupertinoIcons.person),
              const SizedBox(height: 8),
              _buildEditTextField('Telefon', _editContactPhoneController, CupertinoIcons.phone, keyboardType: TextInputType.phone),
              const SizedBox(height: 8),
              _buildEditTextField('E-posta', _editContactEmailController, CupertinoIcons.mail, keyboardType: TextInputType.emailAddress),
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 12),
              _buildEditTextField('Notlar', _editNotesController, CupertinoIcons.doc_text, maxLines: 3),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: CupertinoButton(
                      onPressed: _isSaving ? null : _cancelEditing,
                      color: Colors.grey,
                      borderRadius: BorderRadius.circular(12),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: const Text(
                        'İptal',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CupertinoButton(
                      onPressed: _isSaving ? null : _saveEdit,
                      color: const Color(0xFFB73D3D),
                      borderRadius: BorderRadius.circular(12),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: _isSaving
                          ? const CupertinoActivityIndicator(color: Colors.white)
                          : const Text(
                              'Kaydet',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                                fontSize: 15,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEditTextField(String label, TextEditingController controller, IconData icon, {int maxLines = 1, TextInputType? keyboardType}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Color(0xFF000000),
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF2F2F7),
            borderRadius: BorderRadius.circular(8),
          ),
          child: TextFormField(
            controller: controller,
            maxLines: maxLines,
            keyboardType: keyboardType,
            decoration: InputDecoration(
              prefixIcon: Icon(icon, size: 16, color: const Color(0xFFB73D3D)),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            ),
            style: const TextStyle(fontSize: 13),
            validator: label.contains('*') && controller.text.isEmpty
                ? (value) => 'Bu alan zorunludur'
                : null,
          ),
        ),
      ],
    );
  }
  
  Widget _buildEditDropdown(String label, String value, Map<String, String> options, Function(String) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Color(0xFF000000),
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF2F2F7),
            borderRadius: BorderRadius.circular(8),
          ),
          child: DropdownButtonFormField<String>(
            value: value,
            decoration: const InputDecoration(
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              border: InputBorder.none,
            ),
            items: options.entries.map((entry) {
              return DropdownMenuItem<String>(
                value: entry.key,
                child: Text(entry.value, style: const TextStyle(fontSize: 13)),
              );
            }).toList(),
            onChanged: (value) {
              if (value != null) onChanged(value);
            },
          ),
        ),
      ],
    );
  }
  
  Widget _buildEditServiceTypeDropdown(List<Map<String, String>> serviceTypes) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Servis Tipi',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Color(0xFF000000),
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF2F2F7),
            borderRadius: BorderRadius.circular(8),
          ),
          child: DropdownButtonFormField<String>(
            value: _editSelectedServiceType?.isEmpty ?? true ? null : _editSelectedServiceType,
            decoration: const InputDecoration(
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              border: InputBorder.none,
            ),
            items: [
              const DropdownMenuItem<String>(value: null, child: Text('Seçiniz', style: TextStyle(fontSize: 13))),
              ...serviceTypes.map((type) {
                return DropdownMenuItem<String>(
                  value: type['value'],
                  child: Text(type['label']!, style: const TextStyle(fontSize: 13)),
                );
              }),
            ],
            onChanged: (value) {
              setState(() {
                _editSelectedServiceType = value ?? '';
              });
            },
          ),
        ),
      ],
    );
  }
  
  Widget _buildEditDateField(String label, DateTime? date, TimeOfDay? time, Function(DateTime?, TimeOfDay?) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Color(0xFF000000),
          ),
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            Expanded(
              child: CupertinoButton(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                color: const Color(0xFFF2F2F7),
                borderRadius: BorderRadius.circular(8),
                onPressed: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: date ?? DateTime.now(),
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (picked != null) {
                    onChanged(picked, time);
                  }
                },
                child: Text(
                  date != null
                      ? '${date!.day.toString().padLeft(2, '0')}.${date!.month.toString().padLeft(2, '0')}.${date!.year}'
                      : 'Tarih Seç',
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF000000),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: CupertinoButton(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                color: const Color(0xFFF2F2F7),
                borderRadius: BorderRadius.circular(8),
                onPressed: () async {
                  final picked = await showTimePicker(
                    context: context,
                    initialTime: time ?? TimeOfDay.now(),
                  );
                  if (picked != null) {
                    onChanged(date, picked);
                  }
                },
                child: Text(
                  time != null
                      ? '${time!.hour.toString().padLeft(2, '0')}:${time!.minute.toString().padLeft(2, '0')}'
                      : 'Saat Seç',
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF000000),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
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
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: iconColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    icon,
                    color: iconColor,
                    size: 16,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF000000),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, Color? valueColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(
              '$label:',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 13,
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
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: Colors.white.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 5,
            height: 5,
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadgeInline(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 5,
            height: 5,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
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
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: Colors.white.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 11)),
          const SizedBox(width: 5),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriorityBadgeInline(String label, Color color) {
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
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 11)),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceTypeBadgeInline(String serviceType) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFF8B5CF6).withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: const Color(0xFF8B5CF6).withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Text(
        serviceType,
        style: const TextStyle(
          color: Color(0xFF8B5CF6),
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildNoteItem(String note) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF2F2F7),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            CupertinoIcons.doc_text,
            size: 14,
            color: Colors.grey[600],
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              note,
              style: const TextStyle(
                fontSize: 12,
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
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF10B981).withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: const Color(0xFF10B981).withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            CupertinoIcons.paperclip,
            size: 14,
            color: const Color(0xFF10B981),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              fileName,
              style: const TextStyle(
                fontSize: 12,
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
              size: 16,
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
        borderRadius: BorderRadius.circular(14),
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 15,
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
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: const Color(0xFFB73D3D).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    CupertinoIcons.arrow_2_squarepath,
                    color: Color(0xFFB73D3D),
                    size: 16,
                  ),
                ),
                const SizedBox(width: 10),
                const Text(
                  'Durum Değiştir',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF000000),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              runSpacing: 6,
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
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      color: color,
      borderRadius: BorderRadius.circular(8),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildActivitiesSection(AsyncValue<List<ServiceActivity>> activitiesAsync) {
    return _buildInfoCard(
      'Aktiviteler',
      CupertinoIcons.list_bullet,
      const Color(0xFF3B82F6),
      [
        activitiesAsync.when(
          data: (activities) {
            if (activities.isEmpty) {
              return _buildEmptyItem('Henüz aktivite bulunmuyor');
            }
            return Column(
              children: activities.map((activity) => _buildActivityItemCompact(activity)).toList(),
            );
          },
          loading: () => const Padding(
            padding: EdgeInsets.all(16.0),
            child: Center(child: CupertinoActivityIndicator()),
          ),
          error: (error, stack) => _buildEmptyItem('Aktiviteler yüklenemedi'),
        ),
      ],
    );
  }

  Widget _buildActivityItemCompact(ServiceActivity activity) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF2F2F7),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 4,
                height: 20,
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      activity.activityType,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF000000),
                      ),
                    ),
                    if (activity.description != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        activity.description!,
                        style: TextStyle(
                          fontSize: 11,
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
            const SizedBox(height: 6),
            Row(
              children: [
                if (activity.startTime != null) ...[
                  Icon(
                    CupertinoIcons.clock,
                    size: 11,
                    color: Colors.grey[500],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    _formatDateTime(activity.startTime!),
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
                if (activity.laborHours != null) ...[
                  if (activity.startTime != null) const SizedBox(width: 10),
                  Icon(
                    CupertinoIcons.timer,
                    size: 11,
                    color: const Color(0xFF3B82F6),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${activity.laborHours} saat',
                    style: const TextStyle(
                      fontSize: 10,
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
    );
  }

  Widget _buildHistorySection(AsyncValue<List<ServiceHistory>> historyAsync) {
    return _buildInfoCard(
      'Geçmiş',
      CupertinoIcons.clock,
      const Color(0xFF8B5CF6),
      [
        historyAsync.when(
          data: (history) {
            if (history.isEmpty) {
              return _buildEmptyItem('Henüz geçmiş kaydı bulunmuyor');
            }
            return Column(
              children: history.map((h) => _buildHistoryItemCompact(h)).toList(),
            );
          },
          loading: () => const Padding(
            padding: EdgeInsets.all(16.0),
            child: Center(child: CupertinoActivityIndicator()),
          ),
          error: (error, stack) => _buildEmptyItem('Geçmiş yüklenemedi'),
        ),
      ],
    );
  }

  Widget _buildHistoryItemCompact(ServiceHistory history) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF2F2F7),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 36,
            decoration: BoxDecoration(
              color: const Color(0xFF8B5CF6),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _getActionDisplayName(history.actionType),
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF000000),
                  ),
                ),
                if (history.description != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    history.description!,
                    style: TextStyle(
                      fontSize: 11,
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
                    fontSize: 10,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),
        ],
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

  Widget _buildServiceSlipSection(ServiceRequest serviceRequest) {
    return _buildInfoCard(
      'Servis Fişi',
      CupertinoIcons.doc_text,
      const Color(0xFFB73D3D),
      [
        if (serviceRequest.hasServiceSlip && serviceRequest.slipNumber != null) ...[
          _buildInfoRow('Fiş No', serviceRequest.slipNumber!, const Color(0xFFB73D3D)),
          if (serviceRequest.slipStatus != null)
            _buildInfoRow('Durum', serviceRequest.slipStatusDisplayName, const Color(0xFF10B981)),
          const Divider(height: 1),
          const SizedBox(height: 12),
        ],
        
        // Teknisyen
        Consumer(
          builder: (context, ref, child) {
            final techniciansAsync = ref.watch(techniciansProvider);
            return techniciansAsync.when(
              data: (technicians) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Teknisyen',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF000000),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFF2F2F7),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: DropdownButtonFormField<String>(
                          value: _selectedTechnicianId,
                          decoration: const InputDecoration(
                            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            border: InputBorder.none,
                          ),
                          items: technicians.map((technician) {
                            final fullName = '${technician['first_name'] ?? ''} ${technician['last_name'] ?? ''}'.trim();
                            return DropdownMenuItem<String>(
                              value: technician['id']?.toString(),
                              child: Text(fullName.isEmpty ? 'İsimsiz' : fullName),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedTechnicianId = value;
                              if (value != null) {
                                final selected = technicians.firstWhere(
                                  (t) => t['id']?.toString() == value,
                                  orElse: () => {},
                                );
                                if (selected.isNotEmpty) {
                                  final fullName = '${selected['first_name'] ?? ''} ${selected['last_name'] ?? ''}'.trim();
                                  _technicianNameController.text = fullName.isEmpty ? 'İsimsiz' : fullName;
                                }
                              }
                            });
                          },
                        ),
                      ),
                    ],
                  ),
                );
              },
              loading: () => const Padding(
                padding: EdgeInsets.all(8.0),
                child: Center(child: CupertinoActivityIndicator()),
              ),
              error: (error, stack) => const SizedBox.shrink(),
            );
          },
        ),
        
        // Müşteri Bilgileri
        const Text(
          'Müşteri Bilgileri',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Color(0xFF000000),
          ),
        ),
        const SizedBox(height: 8),
        _buildTextField('Müşteri Adı', _customerNameController, CupertinoIcons.person_circle),
        const SizedBox(height: 8),
        _buildTextField('Telefon', _customerPhoneController, CupertinoIcons.phone_fill, keyboardType: TextInputType.phone),
        const SizedBox(height: 8),
        _buildTextField('Adres', _customerAddressController, CupertinoIcons.location_fill, maxLines: 2),
        const SizedBox(height: 12),
        const Divider(height: 1),
        const SizedBox(height: 12),
        
        // Ekipman Bilgileri
        const Text(
          'Ekipman Bilgileri',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Color(0xFF000000),
          ),
        ),
        const SizedBox(height: 8),
        _buildTextField('Marka', _equipmentBrandController, CupertinoIcons.bag_fill),
        const SizedBox(height: 8),
        _buildTextField('Model', _equipmentModelController, CupertinoIcons.device_phone_portrait),
        const SizedBox(height: 8),
        _buildTextField('Seri No', _equipmentSerialController, CupertinoIcons.barcode),
        const SizedBox(height: 12),
        const Divider(height: 1),
        const SizedBox(height: 12),
        
        // Servis Detayları
        const Text(
          'Servis Detayları',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Color(0xFF000000),
          ),
        ),
        const SizedBox(height: 8),
        _buildTextField('Sorun Açıklaması', _problemDescriptionController, CupertinoIcons.exclamationmark_triangle_fill, maxLines: 3),
        const SizedBox(height: 8),
        _buildTextField('Yapılan İşlemler', _servicePerformedController, CupertinoIcons.wrench_fill, maxLines: 3),
        const SizedBox(height: 8),
        
        // Kullanılan Ürünler
        _buildUsedProductsSection(),
        
        const SizedBox(height: 8),
        _buildTextField('Notlar', _serviceSlipNotesController, CupertinoIcons.doc_text, maxLines: 2),
        const SizedBox(height: 12),
        
        // Kaydet Butonu
        SizedBox(
          width: double.infinity,
          child: CupertinoButton(
            onPressed: _isSlipLoading ? null : _saveServiceSlip,
            color: const Color(0xFFB73D3D),
            borderRadius: BorderRadius.circular(12),
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: _isSlipLoading
                ? const CupertinoActivityIndicator(color: Colors.white)
                : Text(
                    serviceRequest.hasServiceSlip ? 'Servis Fişini Güncelle' : 'Servis Fişi Oluştur',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildTextField(String label, TextEditingController controller, IconData icon, {TextInputType? keyboardType, int maxLines = 1}) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF2F2F7),
        borderRadius: BorderRadius.circular(8),
      ),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        maxLines: maxLines,
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(
            fontSize: 12,
            color: Color(0xFF8E8E93),
          ),
          prefixIcon: Icon(icon, size: 16, color: const Color(0xFFB73D3D)),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        ),
        style: const TextStyle(fontSize: 13),
      ),
    );
  }
  
  Widget _buildUsedProductsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Kullanılan Ürünler',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Color(0xFF000000),
              ),
            ),
            CupertinoButton(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              minSize: 0,
              onPressed: () => _showProductSelectionDialog(),
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: const Color(0xFFB73D3D).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(CupertinoIcons.add, size: 14, color: Color(0xFFB73D3D)),
                    SizedBox(width: 4),
                    Text(
                      'Ürün Ekle',
                      style: TextStyle(
                        fontSize: 12,
                        color: Color(0xFFB73D3D),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        if (_usedProducts.isEmpty)
          _buildEmptyItem('Henüz ürün eklenmemiş')
        else
          ...(_usedProducts.asMap().entries.map((entry) {
            final index = entry.key;
            final product = entry.value;
            return Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF2F2F7),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product['name'] ?? 'Bilinmeyen Ürün',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF000000),
                          ),
                        ),
                        if (product['description'] != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Text(
                              product['description'],
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.grey[600],
                              ),
                            ),
                          ),
                        const SizedBox(height: 4),
                        Text(
                          'Miktar: ${product['quantity']} ${product['unit'] ?? 'adet'}',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  CupertinoButton(
                    padding: EdgeInsets.zero,
                    minSize: 0,
                    onPressed: () => _removeProduct(index),
                    child: const Icon(
                      CupertinoIcons.delete,
                      color: Color(0xFFB73D3D),
                      size: 18,
                    ),
                  ),
                ],
              ),
            );
          }).toList()),
      ],
    );
  }
  
  void _showProductSelectionDialog() async {
    showDialog(
      context: context,
      builder: (context) => _ProductSelectionDialog(
        onProductSelected: (product, quantity) {
          _addProduct(product, quantity);
        },
      ),
    );
  }
  
  void _addProduct(Map<String, dynamic> product, double quantity) {
    setState(() {
      _usedProducts.add({
        'id': product['id'],
        'name': product['name'],
        'description': product['description'],
        'unit': product['unit'] ?? 'adet',
        'quantity': quantity,
        'price': product['price'] ?? 0,
      });
    });
  }
  
  void _removeProduct(int index) {
    setState(() {
      _usedProducts.removeAt(index);
    });
  }
  
  void _saveServiceSlip() async {
    setState(() {
      _isSlipLoading = true;
    });

    try {
      final service = ref.read(serviceRequestServiceProvider);
      
      final customerData = {
        'name': _customerNameController.text,
        'phone': _customerPhoneController.text,
        'address': _customerAddressController.text,
      };

      final equipmentData = {
        'brand': _equipmentBrandController.text,
        'model': _equipmentModelController.text,
        'serial_number': _equipmentSerialController.text,
      };

      final serviceDetails = {
        'problem_description': _problemDescriptionController.text,
        'service_performed': _servicePerformedController.text,
        'notes': _serviceSlipNotesController.text,
        'used_products': _usedProducts,
      };

      final serviceRequest = await ref.read(serviceRequestByIdProvider(widget.id).future);
      
      if (serviceRequest?.hasServiceSlip == true) {
        await service.updateServiceSlip(
          widget.id,
          technicianName: _technicianNameController.text.isNotEmpty ? _technicianNameController.text : null,
          customerData: customerData,
          equipmentData: equipmentData,
          serviceDetails: serviceDetails,
        );
      } else {
        await service.createServiceSlip(
          widget.id,
          technicianName: _technicianNameController.text,
          customerData: customerData,
          equipmentData: equipmentData,
          serviceDetails: serviceDetails,
        );
      }

      ref.invalidate(serviceRequestByIdProvider(widget.id));
      ref.invalidate(serviceHistoryProvider(widget.id));

      if (mounted) {
        final message = serviceRequest?.hasServiceSlip == true 
            ? 'Servis fişi başarıyla güncellendi'
            : 'Servis fişi başarıyla oluşturuldu';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(message)),
        );
        setState(() {
          _lastInitializedServiceId = null; // Form verilerini yeniden başlatmak için
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hata: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSlipLoading = false;
        });
      }
    }
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

class _ProductSelectionDialog extends ConsumerStatefulWidget {
  final Function(Map<String, dynamic>, double) onProductSelected;

  const _ProductSelectionDialog({
    required this.onProductSelected,
  });

  @override
  ConsumerState<_ProductSelectionDialog> createState() => _ProductSelectionDialogState();
}

class _ProductSelectionDialogState extends ConsumerState<_ProductSelectionDialog> {
  final _searchController = TextEditingController();
  final _quantityController = TextEditingController(text: '1');
  List<Product> _filteredProducts = [];
  Product? _selectedProduct;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_filterProducts);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _quantityController.dispose();
    super.dispose();
  }

  void _filterProducts() {
    final productsAsync = ref.read(productsProvider);
    productsAsync.whenData((products) {
      final query = _searchController.text.toLowerCase();
      setState(() {
        _filteredProducts = products.where((product) {
          return product.name.toLowerCase().contains(query) ||
                 (product.description?.toLowerCase().contains(query) ?? false);
        }).toList();
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productsProvider);
    
    return Dialog(
      child: Container(
        height: 600,
        width: 400,
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFB73D3D),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Ürün Seç',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  CupertinoButton(
                    padding: EdgeInsets.zero,
                    minSize: 0,
                    onPressed: () => Navigator.pop(context),
                    child: const Icon(
                      CupertinoIcons.xmark_circle_fill,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                ],
              ),
            ),
            
            // Search
            Padding(
              padding: const EdgeInsets.all(16),
              child: Container(
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
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    labelText: 'Ürün ara...',
                    labelStyle: TextStyle(
                      color: Colors.grey[600],
                    ),
                    prefixIcon: const Icon(
                      CupertinoIcons.search,
                      color: Color(0xFFB73D3D),
                      size: 20,
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                  ),
                ),
              ),
            ),
            
            // Product List
            Expanded(
              child: productsAsync.when(
                data: (products) {
                  if (_filteredProducts.isEmpty && _searchController.text.isEmpty) {
                    _filteredProducts = products;
                  }
                  
                  if (_filteredProducts.isEmpty) {
                    return const Center(
                      child: Text(
                        'Ürün bulunamadı',
                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 14,
                        ),
                      ),
                    );
                  }
                  
                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _filteredProducts.length,
                    itemBuilder: (context, index) {
                      final product = _filteredProducts[index];
                      final isSelected = _selectedProduct?.id == product.id;
                      
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFFB73D3D).withOpacity(0.1) : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: isSelected
                              ? Border.all(color: const Color(0xFFB73D3D), width: 2)
                              : Border.all(color: Colors.grey.shade200),
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          title: Text(
                            product.name,
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: isSelected ? const Color(0xFFB73D3D) : const Color(0xFF000000),
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (product.description != null && product.description!.isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Text(
                                    product.description!,
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(
                                  'Fiyat: ${product.price} TL',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w500,
                                    color: Colors.grey[700],
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          trailing: isSelected
                              ? const Icon(
                                  CupertinoIcons.checkmark_circle_fill,
                                  color: Color(0xFFB73D3D),
                                  size: 24,
                                )
                              : null,
                          onTap: () {
                            setState(() {
                              _selectedProduct = product;
                            });
                          },
                        ),
                      );
                    },
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, stack) => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 48, color: Colors.red[400]),
                      const SizedBox(height: 16),
                      Text(
                        'Ürünler yüklenemedi',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        error.toString(),
                        style: TextStyle(color: Colors.grey[500], fontSize: 12),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            
            // Quantity and Add Button
            if (_selectedProduct != null)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF2F2F7),
                  border: Border(top: BorderSide(color: Colors.grey.shade200)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
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
                        child: TextField(
                          controller: _quantityController,
                          decoration: InputDecoration(
                            labelText: 'Miktar (${_selectedProduct!.unit ?? 'adet'})',
                            labelStyle: TextStyle(
                              color: Colors.grey[600],
                            ),
                            prefixIcon: const Icon(
                              CupertinoIcons.number,
                              color: Color(0xFFB73D3D),
                              size: 20,
                            ),
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 16,
                            ),
                          ),
                          keyboardType: TextInputType.number,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    SizedBox(
                      height: 50,
                      child: CupertinoButton(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        color: const Color(0xFFB73D3D),
                        borderRadius: BorderRadius.circular(12),
                        onPressed: () {
                          final quantity = double.tryParse(_quantityController.text) ?? 1;
                          widget.onProductSelected({
                            'id': _selectedProduct!.id,
                            'name': _selectedProduct!.name,
                            'description': _selectedProduct!.description,
                            'unit': _selectedProduct!.unit,
                            'price': _selectedProduct!.price,
                          }, quantity);
                          Navigator.pop(context);
                        },
                        child: const Text(
                          'Ekle',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
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
}
