import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/service_request.dart';
import '../providers/service_request_provider.dart';
import '../services/service_request_service.dart';
import '../shared/widgets/bottom_navigation_bar.dart';

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
  final _specialInstructionsController = TextEditingController();

  String _selectedPriority = 'medium';
  String _selectedStatus = 'new';
  DateTime? _dueDate;
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
    _specialInstructionsController.dispose();
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
        _specialInstructionsController.text = serviceRequest.specialInstructions ?? '';
        _selectedPriority = serviceRequest.priority;
        _selectedStatus = serviceRequest.status;
        _dueDate = serviceRequest.dueDate;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentRoute = GoRouterState.of(context).uri.path;
    final priorities = ref.watch(serviceRequestPrioritiesProvider);
    final statuses = ref.watch(serviceRequestStatusesProvider);
    final priorityDisplayNames = ref.watch(serviceRequestPriorityDisplayNamesProvider);
    final statusDisplayNames = ref.watch(serviceRequestStatusDisplayNamesProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.id == null ? 'Yeni Servis Talebi' : 'Servis Talebini Düzenle'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
        actions: [
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
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
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Temel Bilgiler',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Başlık
                      TextFormField(
                        controller: _titleController,
                        decoration: const InputDecoration(
                          labelText: 'Başlık *',
                          border: OutlineInputBorder(),
                          hintText: 'Servis talebi başlığını girin',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Başlık gereklidir';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      // Açıklama
                      TextFormField(
                        controller: _descriptionController,
                        decoration: const InputDecoration(
                          labelText: 'Açıklama',
                          border: OutlineInputBorder(),
                          hintText: 'Detaylı açıklama girin',
                        ),
                        maxLines: 3,
                      ),
                      const SizedBox(height: 16),
                      // Servis Tipi
                      TextFormField(
                        controller: _serviceTypeController,
                        decoration: const InputDecoration(
                          labelText: 'Servis Tipi',
                          border: OutlineInputBorder(),
                          hintText: 'Örn: Bakım, Onarım, Kurulum',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Konum ve Tarih
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Konum ve Tarih',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Konum
                      TextFormField(
                        controller: _locationController,
                        decoration: const InputDecoration(
                          labelText: 'Konum',
                          border: OutlineInputBorder(),
                          hintText: 'Servis yapılacak konum',
                          prefixIcon: Icon(Icons.location_on),
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Bitiş Tarihi
                      InkWell(
                        onTap: _selectDueDate,
                        child: InputDecorator(
                          decoration: const InputDecoration(
                            labelText: 'Bitiş Tarihi',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.calendar_today),
                          ),
                          child: Text(
                            _dueDate != null
                                ? '${_dueDate!.day.toString().padLeft(2, '0')}.${_dueDate!.month.toString().padLeft(2, '0')}.${_dueDate!.year}'
                                : 'Tarih seçin',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Durum ve Öncelik
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Durum ve Öncelik',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          // Öncelik
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _selectedPriority,
                              decoration: const InputDecoration(
                                labelText: 'Öncelik',
                                border: OutlineInputBorder(),
                              ),
                              items: priorities.map((priority) {
                                return DropdownMenuItem(
                                  value: priority,
                                  child: Text(priorityDisplayNames[priority] ?? priority),
                                );
                              }).toList(),
                              onChanged: (value) {
                                setState(() {
                                  _selectedPriority = value!;
                                });
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          // Durum (sadece düzenleme modunda)
                          if (widget.id != null)
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: _selectedStatus,
                                decoration: const InputDecoration(
                                  labelText: 'Durum',
                                  border: OutlineInputBorder(),
                                ),
                                items: statuses.map((status) {
                                  return DropdownMenuItem(
                                    value: status,
                                    child: Text(statusDisplayNames[status] ?? status),
                                  );
                                }).toList(),
                                onChanged: (value) {
                                  setState(() {
                                    _selectedStatus = value!;
                                  });
                                },
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Özel Talimatlar
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Özel Talimatlar',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _specialInstructionsController,
                        decoration: const InputDecoration(
                          labelText: 'Özel Talimatlar',
                          border: OutlineInputBorder(),
                          hintText: 'Özel talimatlar veya notlar',
                        ),
                        maxLines: 3,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
              // Kaydet Butonu
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _saveServiceRequest,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue[600],
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text(
                          widget.id == null ? 'Servis Talebini Oluştur' : 'Değişiklikleri Kaydet',
                          style: const TextStyle(fontSize: 16),
                        ),
                ),
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
          dueDate: _dueDate,
          specialInstructions: _specialInstructionsController.text.isEmpty ? null : _specialInstructionsController.text,
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
          dueDate: _dueDate,
          specialInstructions: _specialInstructionsController.text.isEmpty ? null : _specialInstructionsController.text,
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
}
