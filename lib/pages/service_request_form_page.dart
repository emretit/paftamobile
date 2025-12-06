import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/service_request.dart';
import '../providers/service_request_provider.dart';
import '../providers/customer_provider.dart';

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
  
  // Temel bilgiler
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  final _slipNumberController = TextEditingController();
  
  // İletişim bilgileri
  final _contactPersonController = TextEditingController();
  final _contactPhoneController = TextEditingController();
  final _contactEmailController = TextEditingController();
  
  // Notlar ve sonuç
  final _notesController = TextEditingController();
  final _serviceResultController = TextEditingController();

  String _selectedPriority = 'medium';
  String _selectedStatus = 'new';
  String _selectedServiceType = '';
  String? _selectedCustomerId;
  String? _selectedSupplierId;
  String? _selectedTechnicianId;
  DateTime? _dueDate;
  TimeOfDay? _dueTime;
  DateTime _reportedDate = DateTime.now();
  bool _isLoading = false;

  // Servis türleri
  final List<Map<String, String>> _serviceTypes = [
    {'value': 'bakım', 'label': 'Bakım'},
    {'value': 'onarım', 'label': 'Onarım'},
    {'value': 'kurulum', 'label': 'Kurulum'},
    {'value': 'yazılım', 'label': 'Yazılım'},
    {'value': 'donanım', 'label': 'Donanım'},
    {'value': 'ağ', 'label': 'Ağ'},
    {'value': 'güvenlik', 'label': 'Güvenlik'},
    {'value': 'diğer', 'label': 'Diğer'},
  ];

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
    _slipNumberController.dispose();
    _contactPersonController.dispose();
    _contactPhoneController.dispose();
    _contactEmailController.dispose();
    _notesController.dispose();
    _serviceResultController.dispose();
    super.dispose();
  }

  Future<void> _loadServiceRequest() async {
    final serviceRequest = await ref.read(serviceRequestByIdProvider(widget.id!).future);
    if (serviceRequest != null) {
      setState(() {
        _titleController.text = serviceRequest.title;
        _descriptionController.text = serviceRequest.description ?? '';
        _locationController.text = serviceRequest.location ?? '';
        _slipNumberController.text = serviceRequest.slipNumber ?? '';
        _contactPersonController.text = serviceRequest.contactPerson ?? '';
        _contactPhoneController.text = serviceRequest.contactPhone ?? '';
        _contactEmailController.text = serviceRequest.contactEmail ?? '';
        _notesController.text = serviceRequest.notes?.join('\n') ?? '';
        _serviceResultController.text = serviceRequest.serviceResult ?? '';
        _selectedPriority = serviceRequest.priority;
        _selectedStatus = serviceRequest.status;
        _selectedServiceType = serviceRequest.serviceType ?? '';
        _selectedCustomerId = serviceRequest.customerId;
        _selectedSupplierId = serviceRequest.supplierId;
        _selectedTechnicianId = serviceRequest.assignedTo;
        _dueDate = serviceRequest.dueDate;
        _reportedDate = serviceRequest.reportedDate ?? DateTime.now();
        
        // Saat bilgisini ayır
        if (serviceRequest.dueDate != null) {
          _dueTime = TimeOfDay.fromDateTime(serviceRequest.dueDate!);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final priorities = ref.watch(serviceRequestPrioritiesProvider);
    final statuses = ref.watch(serviceRequestStatusesProvider);
    final priorityDisplayNames = ref.watch(serviceRequestPriorityDisplayNamesProvider);
    final statusDisplayNames = ref.watch(serviceRequestStatusDisplayNamesProvider);
    final customersAsync = ref.watch(customersProvider);
    final techniciansAsync = ref.watch(techniciansProvider);

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
              // 1. Tarih Bilgileri Kartı
              _buildDateInfoCard(),
              const SizedBox(height: 16),
              
              // 2. Müşteri/Tedarikçi ve İletişim Kartı
              _buildCustomerInfoCard(customersAsync),
              const SizedBox(height: 16),
              
              // 3. Temel Bilgiler Kartı
              _buildBasicInfoCard(
                priorities,
                priorityDisplayNames,
                statuses,
                statusDisplayNames,
                techniciansAsync,
              ),
              const SizedBox(height: 16),
              
              // 4. Servis Sonucu ve Notlar Kartı
              _buildNotesCard(),
              const SizedBox(height: 32),
              
              // Kaydet Butonu
              _buildSaveButton(),
            ],
          ),
        ),
      ),
    );
  }

  // Tarih Bilgileri Kartı
  Widget _buildDateInfoCard() {
    return _buildSection(
      'Tarih Bilgileri',
      CupertinoIcons.calendar,
      const Color(0xFF9B59B6),
      [
        Row(
          children: [
            Expanded(
              child: _buildDateSelector(
                label: 'Bildirim Tarihi',
                date: _reportedDate,
                onTap: _selectReportedDate,
                icon: CupertinoIcons.calendar_today,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildDateSelector(
                label: 'Hedef Teslim Tarihi',
                date: _dueDate,
                onTap: _selectDueDate,
                icon: CupertinoIcons.calendar_badge_plus,
                isOptional: true,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTimeSelector(
                label: 'Saat (Opsiyonel)',
                time: _dueTime,
                onTap: _selectDueTime,
                icon: CupertinoIcons.clock,
                enabled: _dueDate != null,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Müşteri/Tedarikçi ve İletişim Kartı
  Widget _buildCustomerInfoCard(AsyncValue<List<dynamic>> customersAsync) {
    return _buildSection(
      'Müşteri / Tedarikçi ve İletişim',
      CupertinoIcons.person_2,
      const Color(0xFF27AE60),
      [
        // Müşteri Seçimi
        _buildCustomerSelector(customersAsync),
        const SizedBox(height: 16),
        
        // İletişim Kişisi
        _buildTextField(
          controller: _contactPersonController,
          label: 'İletişim Kişisi',
          hint: 'Ad Soyad',
          icon: CupertinoIcons.person,
        ),
        const SizedBox(height: 16),
        
        // Telefon ve E-posta
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: _contactPhoneController,
                label: 'Telefon',
                hint: '0(555) 123 45 67',
                icon: CupertinoIcons.phone,
                keyboardType: TextInputType.phone,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTextField(
                controller: _contactEmailController,
                label: 'E-posta',
                hint: 'email@ornek.com',
                icon: CupertinoIcons.mail,
                keyboardType: TextInputType.emailAddress,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Temel Bilgiler Kartı
  Widget _buildBasicInfoCard(
    List<String> priorities,
    Map<String, String> priorityDisplayNames,
    List<String> statuses,
    Map<String, String> statusDisplayNames,
    AsyncValue<List<Map<String, dynamic>>> techniciansAsync,
  ) {
    return _buildSection(
      'Temel Bilgiler',
      CupertinoIcons.doc_text,
      const Color(0xFF3498DB),
      [
        // Servis Başlığı ve Fiş No
        Row(
          children: [
            Expanded(
              flex: 2,
              child: _buildTextField(
                controller: _titleController,
                label: 'Servis Başlığı *',
                hint: 'Örn: Klima bakımı, Elektrik arızası...',
                icon: CupertinoIcons.textformat,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Başlık gereklidir';
                  }
                  return null;
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTextField(
                controller: _slipNumberController,
                label: 'Fiş No',
                hint: 'Opsiyonel',
                icon: CupertinoIcons.number,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        
        // Servis Türü ve Durum
        Row(
          children: [
            Expanded(
              child: _buildServiceTypeDropdown(),
            ),
            const SizedBox(width: 12),
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
        const SizedBox(height: 16),
        
        // Açıklama
        _buildTextField(
          controller: _descriptionController,
          label: 'Servis Açıklaması *',
          hint: 'Servisin detaylarını, yapılması gereken işlemleri açıklayın...',
          icon: CupertinoIcons.text_alignleft,
          maxLines: 3,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Açıklama gereklidir';
            }
            return null;
          },
        ),
        const SizedBox(height: 16),
        
        // Lokasyon
        _buildTextField(
          controller: _locationController,
          label: 'Lokasyon',
          hint: 'Servis yapılacak adres',
          icon: CupertinoIcons.location,
        ),
        const SizedBox(height: 16),
        
        // Öncelik ve Teknisyen
        Row(
          children: [
            Expanded(
              child: _buildPriorityDropdown(priorities, priorityDisplayNames),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTechnicianSelector(techniciansAsync),
            ),
          ],
        ),
      ],
    );
  }

  // Servis Sonucu ve Notlar Kartı
  Widget _buildNotesCard() {
    return _buildSection(
      'Servis Sonucu ve Notlar',
      CupertinoIcons.doc_plaintext,
      const Color(0xFFF39C12),
      [
        // Servis Sonucu
        _buildTextField(
          controller: _serviceResultController,
          label: 'Servis Sonucu',
          hint: 'Servis sonucu veya ön görüş (opsiyonel)',
          icon: CupertinoIcons.checkmark_seal,
          maxLines: 3,
        ),
        const SizedBox(height: 16),
        
        // Şirket İçi Notlar
        _buildTextField(
          controller: _notesController,
          label: 'Şirket İçi Notlar',
          hint: 'Her satır ayrı bir not olarak kaydedilir',
          icon: CupertinoIcons.text_alignleft,
          maxLines: 4,
        ),
      ],
    );
  }

  // Müşteri Seçici
  Widget _buildCustomerSelector(AsyncValue<List<dynamic>> customersAsync) {
    return customersAsync.when(
      data: (customers) {
        final selectedCustomer = _selectedCustomerId != null
            ? customers.firstWhere(
                (c) => c.id == _selectedCustomerId,
                orElse: () => null,
              )
            : null;

        return GestureDetector(
          onTap: () => _showCustomerPicker(customers),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF2F2F7),
              borderRadius: BorderRadius.circular(12),
            ),
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  CupertinoIcons.person_crop_circle,
                  color: const Color(0xFFB73D3D),
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Müşteri / Tedarikçi',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: const Color(0xFF8E8E93),
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        selectedCustomer != null
                            ? selectedCustomer.name ?? 'İsimsiz Müşteri'
                            : 'Müşteri veya Tedarikçi seçin...',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: selectedCustomer != null
                              ? const Color(0xFF000000)
                              : const Color(0xFF8E8E93),
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  CupertinoIcons.chevron_down,
                  color: const Color(0xFF8E8E93),
                  size: 16,
                ),
              ],
            ),
          ),
        );
      },
      loading: () => Container(
        decoration: BoxDecoration(
          color: const Color(0xFFF2F2F7),
          borderRadius: BorderRadius.circular(12),
        ),
        padding: const EdgeInsets.all(16),
        child: const Center(
          child: CupertinoActivityIndicator(),
        ),
      ),
      error: (error, stack) => Container(
        decoration: BoxDecoration(
          color: const Color(0xFFF2F2F7),
          borderRadius: BorderRadius.circular(12),
        ),
        padding: const EdgeInsets.all(16),
        child: Text('Müşteriler yüklenemedi: $error'),
      ),
    );
  }

  // Teknisyen Seçici
  Widget _buildTechnicianSelector(AsyncValue<List<Map<String, dynamic>>> techniciansAsync) {
    return techniciansAsync.when(
      data: (technicians) {
        final items = [
          {'value': '', 'label': 'Atanmamış'},
          ...technicians.map((t) => {
            'value': t['id'] as String,
            'label': '${t['first_name']} ${t['last_name']}',
          }),
        ];

        return Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF2F2F7),
            borderRadius: BorderRadius.circular(12),
          ),
          child: DropdownButtonFormField<String>(
            value: _selectedTechnicianId ?? '',
            onChanged: (value) {
              setState(() {
                _selectedTechnicianId = value?.isEmpty == true ? null : value;
              });
            },
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: const Color(0xFF000000),
              fontSize: 16,
            ),
            decoration: InputDecoration(
              labelText: 'Teknisyen',
              labelStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: const Color(0xFF8E8E93),
                fontSize: 14,
              ),
              prefixIcon: const Icon(
                CupertinoIcons.wrench,
                color: Color(0xFFB73D3D),
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
                value: item['value'],
                child: Text(
                  item['label']!,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF000000),
                    fontSize: 16,
                  ),
                ),
              );
            }).toList(),
          ),
        );
      },
      loading: () => Container(
        decoration: BoxDecoration(
          color: const Color(0xFFF2F2F7),
          borderRadius: BorderRadius.circular(12),
        ),
        padding: const EdgeInsets.all(16),
        child: const Center(
          child: CupertinoActivityIndicator(),
        ),
      ),
      error: (error, stack) => Container(
        decoration: BoxDecoration(
          color: const Color(0xFFF2F2F7),
          borderRadius: BorderRadius.circular(12),
        ),
        padding: const EdgeInsets.all(16),
        child: Text('Teknisyenler yüklenemedi'),
      ),
    );
  }

  // Servis Türü Dropdown
  Widget _buildServiceTypeDropdown() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF2F2F7),
        borderRadius: BorderRadius.circular(12),
      ),
      child: DropdownButtonFormField<String>(
        value: _selectedServiceType.isEmpty ? null : _selectedServiceType,
        onChanged: (value) {
          setState(() {
            _selectedServiceType = value ?? '';
          });
        },
        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
          color: const Color(0xFF000000),
          fontSize: 16,
        ),
        decoration: InputDecoration(
          labelText: 'Servis Türü',
          labelStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: const Color(0xFF8E8E93),
            fontSize: 14,
          ),
          prefixIcon: const Icon(
            CupertinoIcons.tag,
            color: Color(0xFFB73D3D),
            size: 20,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 16,
          ),
        ),
        hint: Text(
          'Servis türü seçin...',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: const Color(0xFF8E8E93),
            fontSize: 16,
          ),
        ),
        items: _serviceTypes.map((type) {
          return DropdownMenuItem(
            value: type['value'],
            child: Text(
              type['label']!,
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

  // Öncelik Dropdown
  Widget _buildPriorityDropdown(List<String> priorities, Map<String, String> displayNames) {
    final priorityColors = {
      'low': const Color(0xFF27AE60),
      'medium': const Color(0xFFF39C12),
      'high': const Color(0xFFE67E22),
      'urgent': const Color(0xFFE74C3C),
    };

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF2F2F7),
        borderRadius: BorderRadius.circular(12),
      ),
      child: DropdownButtonFormField<String>(
        value: _selectedPriority,
        onChanged: (value) {
          setState(() {
            _selectedPriority = value!;
          });
        },
        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
          color: const Color(0xFF000000),
          fontSize: 16,
        ),
        decoration: InputDecoration(
          labelText: 'Öncelik',
          labelStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: const Color(0xFF8E8E93),
            fontSize: 14,
          ),
          prefixIcon: const Icon(
            CupertinoIcons.exclamationmark_triangle,
            color: Color(0xFFB73D3D),
            size: 20,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 16,
          ),
        ),
        items: priorities.map((priority) {
          return DropdownMenuItem(
            value: priority,
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: priorityColors[priority] ?? Colors.grey,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  displayNames[priority] ?? priority,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF000000),
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  void _showCustomerPicker(List<dynamic> customers) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              // Header
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Müşteri Seç',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(CupertinoIcons.xmark_circle_fill),
                      color: Colors.grey,
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              // Customer list
              Expanded(
                child: ListView.builder(
                  controller: scrollController,
                  itemCount: customers.length,
                  itemBuilder: (context, index) {
                    final customer = customers[index];
                    final isSelected = customer.id == _selectedCustomerId;
                    
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isSelected
                            ? const Color(0xFFB73D3D)
                            : const Color(0xFFF2F2F7),
                        child: Text(
                          (customer.name ?? '?')[0].toUpperCase(),
                          style: TextStyle(
                            color: isSelected ? Colors.white : const Color(0xFF000000),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      title: Text(
                        customer.name ?? 'İsimsiz Müşteri',
                        style: TextStyle(
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                        ),
                      ),
                      subtitle: customer.email != null
                          ? Text(
                              customer.email!,
                              style: const TextStyle(fontSize: 12),
                            )
                          : null,
                      trailing: isSelected
                          ? const Icon(
                              CupertinoIcons.checkmark_circle_fill,
                              color: Color(0xFFB73D3D),
                            )
                          : null,
                      onTap: () {
                        setState(() {
                          _selectedCustomerId = customer.id;
                          _selectedSupplierId = null;
                          
                          // İletişim bilgilerini otomatik doldur
                          if (customer.name != null) {
                            _contactPersonController.text = customer.name!;
                          }
                          if (customer.phone != null) {
                            _contactPhoneController.text = customer.phone!;
                          }
                          if (customer.email != null) {
                            _contactEmailController.text = customer.email!;
                          }
                          if (customer.address != null) {
                            _locationController.text = customer.address!;
                          }
                        });
                        Navigator.pop(context);
                      },
                    );
                  },
                ),
              ),
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

  Future<void> _selectDueTime() async {
    if (_dueDate == null) return;
    
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _dueTime ?? TimeOfDay.now(),
    );
    if (picked != null) {
      setState(() {
        _dueTime = picked;
      });
    }
  }

  Future<void> _selectReportedDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _reportedDate,
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

      // Due date ve time'ı birleştir
      DateTime? finalDueDate = _dueDate;
      if (_dueDate != null && _dueTime != null) {
        finalDueDate = DateTime(
          _dueDate!.year,
          _dueDate!.month,
          _dueDate!.day,
          _dueTime!.hour,
          _dueTime!.minute,
        );
      }

      if (widget.id == null) {
        // Yeni oluşturma
        final serviceRequest = ServiceRequest(
          id: '', // Supabase otomatik oluşturacak
          title: _titleController.text,
          description: _descriptionController.text.isEmpty ? null : _descriptionController.text,
          serviceType: _selectedServiceType.isEmpty ? null : _selectedServiceType,
          location: _locationController.text.isEmpty ? null : _locationController.text,
          priority: _selectedPriority,
          status: _selectedStatus,
          customerId: _selectedCustomerId,
          supplierId: _selectedSupplierId,
          assignedTo: _selectedTechnicianId,
          dueDate: finalDueDate,
          reportedDate: _reportedDate,
          contactPerson: _contactPersonController.text.isEmpty ? null : _contactPersonController.text,
          contactPhone: _contactPhoneController.text.isEmpty ? null : _contactPhoneController.text,
          contactEmail: _contactEmailController.text.isEmpty ? null : _contactEmailController.text,
          serviceResult: _serviceResultController.text.isEmpty ? null : _serviceResultController.text,
          notes: _notesController.text.isEmpty 
              ? null 
              : _notesController.text.split('\n').where((line) => line.trim().isNotEmpty).toList(),
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
          serviceType: _selectedServiceType.isEmpty ? null : _selectedServiceType,
          location: _locationController.text.isEmpty ? null : _locationController.text,
          priority: _selectedPriority,
          status: _selectedStatus,
          customerId: _selectedCustomerId,
          supplierId: _selectedSupplierId,
          assignedTo: _selectedTechnicianId,
          dueDate: finalDueDate,
          reportedDate: _reportedDate,
          contactPerson: _contactPersonController.text.isEmpty ? null : _contactPersonController.text,
          contactPhone: _contactPhoneController.text.isEmpty ? null : _contactPhoneController.text,
          contactEmail: _contactEmailController.text.isEmpty ? null : _contactEmailController.text,
          serviceResult: _serviceResultController.text.isEmpty ? null : _serviceResultController.text,
          notes: _notesController.text.isEmpty 
              ? null 
              : _notesController.text.split('\n').where((line) => line.trim().isNotEmpty).toList(),
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

  Widget _buildSection(String title, IconData sectionIcon, Color iconColor, List<Widget> children) {
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
                    color: iconColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    sectionIcon,
                    color: iconColor,
                    size: 18,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontSize: 16,
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
    TextInputType? keyboardType,
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
        keyboardType: keyboardType,
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
    bool isOptional = false,
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
                : isOptional ? 'Opsiyonel' : 'Tarih seçin',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: date != null ? const Color(0xFF000000) : const Color(0xFF8E8E93),
              fontSize: 16,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTimeSelector({
    required String label,
    required TimeOfDay? time,
    required VoidCallback onTap,
    required IconData icon,
    bool enabled = true,
  }) {
    return CupertinoButton(
      onPressed: enabled ? onTap : null,
      padding: EdgeInsets.zero,
      child: Opacity(
        opacity: enabled ? 1.0 : 0.5,
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
              time != null
                  ? '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}'
                  : 'Saat seçin',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: time != null ? const Color(0xFF000000) : const Color(0xFF8E8E93),
                fontSize: 16,
              ),
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
