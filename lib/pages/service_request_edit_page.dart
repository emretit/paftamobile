import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/service_request.dart';
import '../providers/service_request_provider.dart';
import '../services/service_request_service.dart';
import '../shared/widgets/service_form_widgets.dart';

class ServiceRequestEditPage extends ConsumerStatefulWidget {
  final String id;

  const ServiceRequestEditPage({
    super.key,
    required this.id,
  });

  @override
  ConsumerState<ServiceRequestEditPage> createState() => _ServiceRequestEditPageState();
}

class _ServiceRequestEditPageState extends ConsumerState<ServiceRequestEditPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  final _contactPersonController = TextEditingController();
  final _contactPhoneController = TextEditingController();
  final _contactEmailController = TextEditingController();
  final _notesController = TextEditingController();

  String? _selectedPriority;
  String? _selectedStatus;
  String? _selectedServiceType;
  DateTime? _dueDate;
  TimeOfDay? _dueTime;
  bool _isSaving = false;
  bool _isInitialized = false;

  final List<Map<String, String>> _serviceTypes = [
    {'value': 'bakım', 'label': 'Bakım'},
    {'value': 'onarım', 'label': 'Onarım'},
    {'value': 'kurulum', 'label': 'Kurulum'},
    {'value': 'kontrol', 'label': 'Kontrol'},
    {'value': 'yazılım', 'label': 'Yazılım'},
    {'value': 'donanım', 'label': 'Donanım'},
    {'value': 'ağ', 'label': 'Ağ'},
    {'value': 'güvenlik', 'label': 'Güvenlik'},
    {'value': 'diğer', 'label': 'Diğer'},
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    _contactPersonController.dispose();
    _contactPhoneController.dispose();
    _contactEmailController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _initializeForm(ServiceRequest serviceRequest) {
    if (_isInitialized) return;

    _titleController.text = serviceRequest.title;
    _descriptionController.text = serviceRequest.description ?? '';
    _locationController.text = serviceRequest.location ?? '';
    _contactPersonController.text = serviceRequest.contactPerson ?? '';
    _contactPhoneController.text = serviceRequest.contactPhone ?? '';
    _contactEmailController.text = serviceRequest.contactEmail ?? '';
    _notesController.text = serviceRequest.notes?.join('\n') ?? '';

    final statusDisplayNames = ref.read(serviceRequestStatusDisplayNamesProvider);
    final priorityDisplayNames = ref.read(serviceRequestPriorityDisplayNamesProvider);

    if (priorityDisplayNames.containsKey(serviceRequest.priority)) {
      _selectedPriority = serviceRequest.priority;
    } else if (priorityDisplayNames.isNotEmpty) {
      _selectedPriority = priorityDisplayNames.keys.first;
    }

    if (statusDisplayNames.containsKey(serviceRequest.status)) {
      _selectedStatus = serviceRequest.status;
    } else if (statusDisplayNames.isNotEmpty) {
      _selectedStatus = statusDisplayNames.keys.first;
    }

    _selectedServiceType = serviceRequest.serviceType?.toLowerCase() ?? '';
    _dueDate = serviceRequest.dueDate;
    if (serviceRequest.dueDate != null) {
      _dueTime = TimeOfDay.fromDateTime(serviceRequest.dueDate!);
    }

    _isInitialized = true;
  }

  Future<void> _saveChanges() async {
    if (!_formKey.currentState!.validate()) {
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

      DateTime? combinedDueDate;
      if (_dueDate != null) {
        if (_dueTime != null) {
          combinedDueDate = DateTime(
            _dueDate!.year,
            _dueDate!.month,
            _dueDate!.day,
            _dueTime!.hour,
            _dueTime!.minute,
          );
        } else {
          combinedDueDate = _dueDate;
        }
      }

      List<String> notesList = [];
      if (_notesController.text.isNotEmpty) {
        notesList = _notesController.text.split('\n').where((n) => n.trim().isNotEmpty).toList();
      }

      final updatedRequest = ServiceRequest(
        id: serviceRequest.id,
        title: _titleController.text,
        description: _descriptionController.text.isEmpty ? null : _descriptionController.text,
        location: _locationController.text.isEmpty ? null : _locationController.text,
        priority: _selectedPriority ?? serviceRequest.priority,
        status: _selectedStatus ?? serviceRequest.status,
        serviceType: _selectedServiceType?.isEmpty ?? true ? null : _selectedServiceType,
        dueDate: combinedDueDate,
        contactPerson: _contactPersonController.text.isEmpty ? null : _contactPersonController.text,
        contactPhone: _contactPhoneController.text.isEmpty ? null : _contactPhoneController.text,
        contactEmail: _contactEmailController.text.isEmpty ? null : _contactEmailController.text,
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
        context.go('/service/detail/${widget.id}');
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

  @override
  Widget build(BuildContext context) {
    final serviceRequestAsync = ref.watch(serviceRequestByIdProvider(widget.id));
    final statusDisplayNames = ref.watch(serviceRequestStatusDisplayNamesProvider);
    final priorityDisplayNames = ref.watch(serviceRequestPriorityDisplayNamesProvider);

    return Scaffold(
      backgroundColor: ServiceFormStyles.backgroundColor,
      appBar: _buildAppBar(),
      body: serviceRequestAsync.when(
        data: (serviceRequest) {
          if (serviceRequest == null) {
            return ServiceEmptyState(
              title: 'Servis talebi bulunamadı',
              subtitle: 'Bu servis talebi silinmiş veya mevcut değil.',
              icon: CupertinoIcons.exclamationmark_triangle,
              iconColor: ServiceFormStyles.warningColor,
              buttonLabel: 'Geri Dön',
              onButtonPressed: () => context.go('/service/management'),
            );
          }

          _initializeForm(serviceRequest);

          return SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: _buildEditForm(statusDisplayNames, priorityDisplayNames),
              ),
            ),
          );
        },
        loading: () => const Center(child: CupertinoActivityIndicator()),
        error: (error, stack) => ServiceErrorState(
          error: error.toString(),
          onRetry: () => ref.invalidate(serviceRequestByIdProvider(widget.id)),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      leading: IconButton(
        icon: const Icon(CupertinoIcons.back),
        onPressed: () {
          if (Navigator.of(context).canPop()) {
            context.pop();
          } else {
            context.go('/service/detail/${widget.id}');
          }
        },
      ),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [ServiceFormStyles.primaryGradientStart, ServiceFormStyles.primaryGradientEnd],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              CupertinoIcons.pencil,
              color: Colors.white,
              size: 18,
            ),
          ),
          const SizedBox(width: 12),
          const Text(
            'Servis Düzenle',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              letterSpacing: -0.3,
            ),
          ),
        ],
      ),
      backgroundColor: ServiceFormStyles.backgroundColor,
      foregroundColor: ServiceFormStyles.textPrimary,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
    );
  }

  Widget _buildEditForm(
    Map<String, String> statusDisplayNames,
    Map<String, String> priorityDisplayNames,
  ) {
    return Column(
      children: [
        // Temel Bilgiler
        ServiceFormSection(
          title: 'Temel Bilgiler',
          icon: CupertinoIcons.doc_text,
          iconColor: ServiceFormStyles.infoColor,
          children: [
            ServiceFormTextField(
              controller: _titleController,
              label: 'Başlık *',
              hint: 'Servis başlığını girin',
              icon: CupertinoIcons.textformat,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Başlık gereklidir';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            ServiceFormTextField(
              controller: _descriptionController,
              label: 'Açıklama',
              hint: 'Servis açıklamasını girin',
              icon: CupertinoIcons.text_alignleft,
              maxLines: 3,
            ),
            const SizedBox(height: 12),
            ServiceFormTextField(
              controller: _locationController,
              label: 'Konum',
              hint: 'Servis konumunu girin',
              icon: CupertinoIcons.location,
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Durum ve Öncelik
        ServiceFormSection(
          title: 'Durum ve Öncelik',
          icon: CupertinoIcons.slider_horizontal_3,
          iconColor: ServiceFormStyles.warningColor,
          children: [
            Row(
              children: [
                Expanded(
                  child: _buildStatusDropdown(statusDisplayNames),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildPriorityDropdown(priorityDisplayNames),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildServiceTypeDropdown(),
          ],
        ),
        const SizedBox(height: 16),

        // Tarih Bilgileri
        ServiceFormSection(
          title: 'Tarih Bilgileri',
          icon: CupertinoIcons.calendar,
          iconColor: ServiceFormStyles.purpleColor,
          children: [
            Row(
              children: [
                Expanded(
                  child: ServiceFormDateSelector(
                    label: 'Hedef Teslim Tarihi',
                    date: _dueDate,
                    onTap: _selectDueDate,
                    icon: CupertinoIcons.calendar_badge_plus,
                    isOptional: true,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ServiceFormTimeSelector(
                    label: 'Hedef Saat',
                    time: _dueTime,
                    onTap: _selectDueTime,
                    icon: CupertinoIcons.clock,
                    enabled: _dueDate != null,
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),

        // İletişim Bilgileri
        ServiceFormSection(
          title: 'İletişim Bilgileri',
          icon: CupertinoIcons.person_2,
          iconColor: ServiceFormStyles.successColor,
          children: [
            ServiceFormTextField(
              controller: _contactPersonController,
              label: 'İletişim Kişisi',
              hint: 'Ad Soyad',
              icon: CupertinoIcons.person,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ServiceFormTextField(
                    controller: _contactPhoneController,
                    label: 'Telefon',
                    hint: '0(5XX) XXX XX XX',
                    icon: CupertinoIcons.phone,
                    keyboardType: TextInputType.phone,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ServiceFormTextField(
                    controller: _contactEmailController,
                    label: 'E-posta',
                    hint: 'email@domain.com',
                    icon: CupertinoIcons.mail,
                    keyboardType: TextInputType.emailAddress,
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Notlar
        ServiceFormSection(
          title: 'Notlar',
          icon: CupertinoIcons.doc_plaintext,
          iconColor: ServiceFormStyles.primaryColor,
          children: [
            ServiceFormTextField(
              controller: _notesController,
              label: 'Şirket İçi Notlar',
              hint: 'Her satır ayrı bir not olarak kaydedilir',
              icon: CupertinoIcons.text_alignleft,
              maxLines: 3,
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Butonlar
        Row(
          children: [
            Expanded(
              child: ServiceSecondaryButton(
                label: 'İptal',
                icon: CupertinoIcons.xmark,
                onPressed: _isSaving ? null : () {
                  if (Navigator.of(context).canPop()) {
                    context.pop();
                  } else {
                    context.go('/service/detail/${widget.id}');
                  }
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ServicePrimaryButton(
                label: 'Kaydet',
                icon: CupertinoIcons.checkmark,
                onPressed: _isSaving ? null : _saveChanges,
                isLoading: _isSaving,
              ),
            ),
          ],
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildStatusDropdown(Map<String, String> statusDisplayNames) {
    final uniqueItems = <String, String>{};
    for (final entry in statusDisplayNames.entries) {
      if (!uniqueItems.containsKey(entry.key)) {
        uniqueItems[entry.key] = entry.value;
      }
    }

    return ServiceFormDropdown<String>(
      value: _selectedStatus,
      label: 'Durum',
      icon: CupertinoIcons.checkmark_circle,
      items: uniqueItems.entries.map((entry) {
        return DropdownMenuItem<String>(
          value: entry.key,
          child: Text(entry.value),
        );
      }).toList(),
      onChanged: (value) {
        setState(() => _selectedStatus = value);
      },
    );
  }

  Widget _buildPriorityDropdown(Map<String, String> priorityDisplayNames) {
    final priorityColors = {
      'low': ServiceFormStyles.successColor,
      'medium': ServiceFormStyles.warningColor,
      'high': const Color(0xFFE67E22),
      'urgent': ServiceFormStyles.errorColor,
    };

    return ServiceFormDropdown<String>(
      value: _selectedPriority,
      label: 'Öncelik',
      icon: CupertinoIcons.exclamationmark_triangle,
      items: priorityDisplayNames.entries.map((entry) {
        return DropdownMenuItem<String>(
          value: entry.key,
          child: Row(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: priorityColors[entry.key] ?? Colors.grey,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(entry.value),
            ],
          ),
        );
      }).toList(),
      onChanged: (value) {
        setState(() => _selectedPriority = value);
      },
    );
  }

  Widget _buildServiceTypeDropdown() {
    String? validServiceType;
    if (_selectedServiceType != null && _selectedServiceType!.isNotEmpty) {
      final searchValue = _selectedServiceType!.toLowerCase();
      final matchingType = _serviceTypes.firstWhere(
        (type) => type['value']?.toLowerCase() == searchValue || type['label']?.toLowerCase() == searchValue,
        orElse: () => {},
      );
      if (matchingType.isNotEmpty && matchingType['value'] != null) {
        validServiceType = matchingType['value'];
      }
    }

    return ServiceFormDropdown<String>(
      value: validServiceType,
      label: 'Servis Tipi',
      icon: CupertinoIcons.tag,
      hint: 'Seçiniz',
      items: [
        const DropdownMenuItem<String>(
          value: null,
          child: Text('Seçiniz'),
        ),
        ..._serviceTypes.map((type) {
          return DropdownMenuItem<String>(
            value: type['value'],
            child: Text(type['label']!),
          );
        }),
      ],
      onChanged: (value) {
        setState(() {
          _selectedServiceType = value ?? '';
        });
      },
    );
  }

  Future<void> _selectDueDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _dueDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: ServiceFormStyles.primaryColor,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: ServiceFormStyles.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _dueDate = picked;
      });
    }
  }

  Future<void> _selectDueTime() async {
    if (_dueDate == null) return;
    
    final picked = await showTimePicker(
      context: context,
      initialTime: _dueTime ?? TimeOfDay.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: ServiceFormStyles.primaryColor,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: ServiceFormStyles.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _dueTime = picked;
      });
    }
  }
}
