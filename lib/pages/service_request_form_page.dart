import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/service_request.dart';
import '../providers/service_request_provider.dart';

class ServiceRequestFormPage extends ConsumerStatefulWidget {
  final String? id; // null ise yeni oluşturma, dolu ise düzenleme

  const ServiceRequestFormPage({
    super.key,
    this.id,
  });

  @override
  ConsumerState<ServiceRequestFormPage> createState() => _ServiceRequestFormPageState();
}

class _ServiceRequestFormPageState extends ConsumerState<ServiceRequestFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  final _serviceTypeController = TextEditingController();
  final _notesController = TextEditingController();

  String _selectedPriority = 'medium';
  String _selectedStatus = 'new';
  String? _selectedCustomerId;
  String? _selectedEquipmentId;
  DateTime? _dueDate;
  DateTime? _reportedDate;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.id != null) {
      _loadServiceRequest();
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    _serviceTypeController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _loadServiceRequest() async {
    final serviceRequest = await ref.read(serviceRequestByIdProvider(widget.id!).future);
    if (serviceRequest != null) {
      setState(() {
        _titleController.text = serviceRequest.title;
        _descriptionController.text = serviceRequest.description ?? '';
        _locationController.text = serviceRequest.location ?? '';
        _serviceTypeController.text = serviceRequest.serviceType ?? '';
        _notesController.text = serviceRequest.notes?.join('\n') ?? '';
        _selectedPriority = serviceRequest.priority;
        _selectedStatus = serviceRequest.status;
        _selectedCustomerId = serviceRequest.customerId;
        _selectedEquipmentId = serviceRequest.equipmentId;
        _dueDate = serviceRequest.dueDate;
        _reportedDate = serviceRequest.reportedDate;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final priorities = ref.watch(serviceRequestPrioritiesProvider);
    final statuses = ref.watch(serviceRequestStatusesProvider);
    final priorityDisplayNames = ref.watch(serviceRequestPriorityDisplayNamesProvider);
    final statusDisplayNames = ref.watch(serviceRequestStatusDisplayNamesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF2F2F7),
      appBar: AppBar(
        title: Text(
          widget.id == null ? 'Yeni Servis Talebi' : 'Servis Talebini Düzenle',
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
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CupertinoActivityIndicator(
                  color: Color(0xFFB73D3D),
                ),
              ),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Temel Bilgiler
              _buildSection(
                'Temel Bilgiler',
                CupertinoIcons.doc_text,
                [
                  _buildTextField(
                    controller: _titleController,
                    label: 'Başlık *',
                    hint: 'Servis talebi başlığını girin',
                    icon: CupertinoIcons.textformat,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Başlık gereklidir';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  _buildTextField(
                    controller: _descriptionController,
                    label: 'Açıklama',
                    hint: 'Detaylı açıklama girin',
                    icon: CupertinoIcons.text_alignleft,
                    maxLines: 3,
                  ),
                  const SizedBox(height: 16),
                  _buildTextField(
                    controller: _serviceTypeController,
                    label: 'Servis Tipi',
                    hint: 'Örn: Bakım, Onarım, Kurulum',
                    icon: CupertinoIcons.wrench,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              
              // Konum ve Tarih Bilgileri
              _buildSection(
                'Konum ve Tarih',
                CupertinoIcons.location,
                [
                  _buildTextField(
                    controller: _locationController,
                    label: 'Konum',
                    hint: 'Servis yapılacak konum',
                    icon: CupertinoIcons.location_solid,
                  ),
                  const SizedBox(height: 16),
                  _buildDateSelector(
                    label: 'Bitiş Tarihi',
                    date: _dueDate,
                    onTap: _selectDueDate,
                    icon: CupertinoIcons.calendar,
                  ),
                  const SizedBox(height: 16),
                  _buildDateSelector(
                    label: 'Bildirim Tarihi',
                    date: _reportedDate,
                    onTap: _selectReportedDate,
                    icon: CupertinoIcons.time,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              
              // Durum ve Öncelik
              _buildSection(
                'Durum ve Öncelik',
                CupertinoIcons.slider_horizontal_3,
                [
                  Row(
                    children: [
                      Expanded(
                        child: _buildDropdown(
                          label: 'Öncelik',
                          value: _selectedPriority,
                          items: priorities,
                          displayNames: priorityDisplayNames,
                          onChanged: (value) {
                            setState(() {
                              _selectedPriority = value!;
                            });
                          },
                          icon: CupertinoIcons.exclamationmark_triangle,
                        ),
                      ),
                      const SizedBox(width: 16),
                      if (widget.id != null)
                        Expanded(
                          child: _buildDropdown(
                            label: 'Durum',
                            value: _selectedStatus,
                            items: statuses,
                            displayNames: statusDisplayNames,
                            onChanged: (value) {
                              setState(() {
                                _selectedStatus = value!;
                              });
                            },
                            icon: CupertinoIcons.checkmark_circle,
                          ),
                        ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),
              
              // Notlar
              _buildSection(
                'Notlar',
                CupertinoIcons.doc_plaintext,
                [
                  _buildTextField(
                    controller: _notesController,
                    label: 'Notlar',
                    hint: 'Özel notlar veya talimatlar (her satır ayrı not)',
                    icon: CupertinoIcons.text_alignleft,
                    maxLines: 4,
                  ),
                ],
              ),
              const SizedBox(height: 32),
              
              // Kaydet Butonu
              _buildSaveButton(),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _selectDueDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _dueDate ?? DateTime.now().add(const Duration(days: 7)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        _dueDate = picked;
      });
    }
  }

  Future<void> _selectReportedDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _reportedDate ?? DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 1)),
    );
    if (picked != null) {
      setState(() {
        _reportedDate = picked;
      });
    }
  }

  Future<void> _saveServiceRequest() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final service = ref.read(serviceRequestServiceProvider);

      if (widget.id == null) {
        // Yeni oluşturma
        final serviceRequest = ServiceRequest(
          id: '', // Supabase otomatik oluşturacak
          title: _titleController.text,
          description: _descriptionController.text.isEmpty ? null : _descriptionController.text,
          serviceType: _serviceTypeController.text.isEmpty ? null : _serviceTypeController.text,
          location: _locationController.text.isEmpty ? null : _locationController.text,
          priority: _selectedPriority,
          status: _selectedStatus,
          customerId: _selectedCustomerId,
          equipmentId: _selectedEquipmentId,
          dueDate: _dueDate,
          reportedDate: _reportedDate ?? DateTime.now(),
          notes: _notesController.text.isEmpty ? null : _notesController.text.split('\n').where((line) => line.trim().isNotEmpty).toList(),
          attachments: const [],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        await service.createServiceRequest(serviceRequest);
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Servis talebi başarıyla oluşturuldu')),
          );
          context.go('/service-requests');
        }
      } else {
        // Düzenleme
        final serviceRequest = ServiceRequest(
          id: widget.id!,
          title: _titleController.text,
          description: _descriptionController.text.isEmpty ? null : _descriptionController.text,
          serviceType: _serviceTypeController.text.isEmpty ? null : _serviceTypeController.text,
          location: _locationController.text.isEmpty ? null : _locationController.text,
          priority: _selectedPriority,
          status: _selectedStatus,
          customerId: _selectedCustomerId,
          equipmentId: _selectedEquipmentId,
          dueDate: _dueDate,
          reportedDate: _reportedDate ?? DateTime.now(),
          notes: _notesController.text.isEmpty ? null : _notesController.text.split('\n').where((line) => line.trim().isNotEmpty).toList(),
          attachments: const [],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        
        await service.updateServiceRequest(widget.id!, serviceRequest);
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Servis talebi başarıyla güncellendi')),
          );
          context.go('/service-requests/${widget.id}');
        }
      }

      // Provider'ları yenile
      ref.invalidate(serviceRequestsProvider);
      if (widget.id != null) {
        ref.invalidate(serviceRequestByIdProvider(widget.id!));
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
          _isLoading = false;
        });
      }
    }
  }

  Widget _buildSection(String title, IconData sectionIcon, List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            spreadRadius: 0,
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
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
                  child: Icon(
                    sectionIcon,
                    color: const Color(0xFFB73D3D),
                    size: 18,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF000000),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF2F2F7),
        borderRadius: BorderRadius.circular(12),
      ),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        validator: validator,
        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
          color: const Color(0xFF000000),
          fontSize: 16,
        ),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          labelStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: const Color(0xFF8E8E93),
            fontSize: 14,
          ),
          hintStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: const Color(0xFF8E8E93),
            fontSize: 14,
          ),
          prefixIcon: Icon(
            icon,
            color: const Color(0xFFB73D3D),
            size: 20,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 16,
          ),
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String value,
    required List<String> items,
    required Map<String, String> displayNames,
    required void Function(String?) onChanged,
    required IconData icon,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF2F2F7),
        borderRadius: BorderRadius.circular(12),
      ),
      child: DropdownButtonFormField<String>(
        value: value,
        onChanged: onChanged,
        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
          color: const Color(0xFF000000),
          fontSize: 16,
        ),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: const Color(0xFF8E8E93),
            fontSize: 14,
          ),
          prefixIcon: Icon(
            icon,
            color: const Color(0xFFB73D3D),
            size: 20,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 16,
          ),
        ),
        items: items.map((item) {
          return DropdownMenuItem(
            value: item,
            child: Text(
              displayNames[item] ?? item,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: const Color(0xFF000000),
                fontSize: 16,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildDateSelector({
    required String label,
    required DateTime? date,
    required VoidCallback onTap,
    required IconData icon,
  }) {
    return CupertinoButton(
      onPressed: onTap,
      padding: EdgeInsets.zero,
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFFF2F2F7),
          borderRadius: BorderRadius.circular(12),
        ),
        child: InputDecorator(
          decoration: InputDecoration(
            labelText: label,
            labelStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: const Color(0xFF8E8E93),
              fontSize: 14,
            ),
            prefixIcon: Icon(
              icon,
              color: const Color(0xFFB73D3D),
              size: 20,
            ),
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
          ),
          child: Text(
            date != null
                ? '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year}'
                : 'Tarih seçin',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: date != null ? const Color(0xFF000000) : const Color(0xFF8E8E93),
              fontSize: 16,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSaveButton() {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: CupertinoButton(
        onPressed: _isLoading ? null : _saveServiceRequest,
        color: const Color(0xFFB73D3D),
        borderRadius: BorderRadius.circular(16),
        child: _isLoading
            ? const CupertinoActivityIndicator(
                color: Colors.white,
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    widget.id == null ? CupertinoIcons.add_circled : CupertinoIcons.check_mark_circled,
                    color: Colors.white,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    widget.id == null ? 'Servis Talebini Oluştur' : 'Değişiklikleri Kaydet',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
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
}
