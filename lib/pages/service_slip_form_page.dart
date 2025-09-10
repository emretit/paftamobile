import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/service_request.dart';
import '../providers/service_request_provider.dart';
import '../services/service_request_service.dart';
import '../shared/widgets/bottom_navigation_bar.dart';

class ServiceSlipFormPage extends ConsumerStatefulWidget {
  final String serviceRequestId;

  const ServiceSlipFormPage({
    super.key,
    required this.serviceRequestId,
  });

  @override
  ConsumerState<ServiceSlipFormPage> createState() => _ServiceSlipFormPageState();
}

class _ServiceSlipFormPageState extends ConsumerState<ServiceSlipFormPage> {
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
  final _partsUsedController = TextEditingController();
  final _notesController = TextEditingController();
  
  bool _isLoading = false;
  bool _isInitialized = false;
  
  // Kullanılan ürünler listesi
  List<Map<String, dynamic>> _usedProducts = [];

  @override
  void dispose() {
    _technicianNameController.dispose();
    _customerNameController.dispose();
    _customerPhoneController.dispose();
    _customerAddressController.dispose();
    _equipmentBrandController.dispose();
    _equipmentModelController.dispose();
    _equipmentSerialController.dispose();
    _problemDescriptionController.dispose();
    _servicePerformedController.dispose();
    _partsUsedController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _initializeFormData(ServiceRequest serviceRequest) {
    if (_isInitialized) return;
    
    // Mevcut servis fişi varsa onun verilerini yükle
    if (serviceRequest.hasServiceSlip) {
      _technicianNameController.text = serviceRequest.technicianName ?? '';
      
      // Müşteri bilgileri
      if (serviceRequest.customerData != null) {
        final customerData = serviceRequest.customerData!;
        _customerNameController.text = customerData['name']?.toString() ?? '';
        _customerPhoneController.text = customerData['phone']?.toString() ?? '';
        _customerAddressController.text = customerData['address']?.toString() ?? '';
      }
      
      // Ekipman bilgileri
      if (serviceRequest.equipmentData != null) {
        final equipmentData = serviceRequest.equipmentData!;
        _equipmentBrandController.text = equipmentData['brand']?.toString() ?? '';
        _equipmentModelController.text = equipmentData['model']?.toString() ?? '';
        _equipmentSerialController.text = equipmentData['serial_number']?.toString() ?? '';
      }
      
      // Servis detayları
      if (serviceRequest.serviceDetails != null) {
        final serviceDetails = serviceRequest.serviceDetails!;
        _problemDescriptionController.text = serviceDetails['problem_description']?.toString() ?? '';
        _servicePerformedController.text = serviceDetails['service_performed']?.toString() ?? '';
        _notesController.text = serviceDetails['notes']?.toString() ?? '';
        
        // Kullanılan ürünleri yükle
        if (serviceDetails['used_products'] != null) {
          _usedProducts = List<Map<String, dynamic>>.from(serviceDetails['used_products']);
        }
      }
    } else {
      // Yeni servis fişi oluşturuluyorsa, mevcut talep bilgilerinden faydalanılabilecek alanları doldur
      _problemDescriptionController.text = serviceRequest.description ?? '';
      if (serviceRequest.location != null) {
        _customerAddressController.text = serviceRequest.location!;
      }
    }
    
    _isInitialized = true;
  }

  @override
  Widget build(BuildContext context) {
    final currentRoute = GoRouterState.of(context).uri.path;
    final serviceRequestAsync = ref.watch(serviceRequestByIdProvider(widget.serviceRequestId));

    return Scaffold(
      backgroundColor: const Color(0xFFF2F2F7),
      appBar: AppBar(
        title: Text(
          'Servis Fişi',
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
      ),
      body: serviceRequestAsync.when(
        data: (serviceRequest) {
          if (serviceRequest == null) {
            return const Center(
              child: Text('Servis talebi bulunamadı'),
            );
          }

          // Form verilerini başlat
          _initializeFormData(serviceRequest);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Servis Talebi Özeti
                  Card(
                    color: Colors.blue.shade50,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.assignment, color: Colors.blue.shade700),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Servis Talebi Özeti',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.blue.shade700,
                                  ),
                                ),
                              ),
                              if (serviceRequest.hasServiceSlip)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.green,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    serviceRequest.slipStatusDisplayName,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.grey.shade200),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildInfoRow('Başlık', serviceRequest.title),
                                if (serviceRequest.description != null)
                                  _buildInfoRow('Açıklama', serviceRequest.description!),
                                _buildInfoRow('Durum', serviceRequest.statusDisplayName),
                                _buildInfoRow('Öncelik', serviceRequest.priorityDisplayName),
                                if (serviceRequest.location != null)
                                  _buildInfoRow('Konum', serviceRequest.location!),
                                if (serviceRequest.serviceType != null)
                                  _buildInfoRow('Servis Tipi', serviceRequest.serviceType!),
                                if (serviceRequest.hasServiceSlip)
                                  _buildInfoRow('Fiş No', serviceRequest.slipNumber!),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Teknisyen bilgileri
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Teknisyen Bilgileri',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _technicianNameController,
                            decoration: const InputDecoration(
                              labelText: 'Teknisyen Adı *',
                              border: OutlineInputBorder(),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Teknisyen adı gereklidir';
                              }
                              return null;
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Müşteri bilgileri
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Müşteri Bilgileri',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _customerNameController,
                            decoration: const InputDecoration(
                              labelText: 'Müşteri Adı',
                              border: OutlineInputBorder(),
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _customerPhoneController,
                            decoration: const InputDecoration(
                              labelText: 'Telefon',
                              border: OutlineInputBorder(),
                            ),
                            keyboardType: TextInputType.phone,
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _customerAddressController,
                            decoration: const InputDecoration(
                              labelText: 'Adres',
                              border: OutlineInputBorder(),
                            ),
                            maxLines: 2,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Ekipman bilgileri
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Ekipman Bilgileri',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _equipmentBrandController,
                            decoration: const InputDecoration(
                              labelText: 'Marka',
                              border: OutlineInputBorder(),
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _equipmentModelController,
                            decoration: const InputDecoration(
                              labelText: 'Model',
                              border: OutlineInputBorder(),
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _equipmentSerialController,
                            decoration: const InputDecoration(
                              labelText: 'Seri No',
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Servis detayları
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Servis Detayları',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _problemDescriptionController,
                            decoration: const InputDecoration(
                              labelText: 'Sorun Açıklaması',
                              border: OutlineInputBorder(),
                            ),
                            maxLines: 3,
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _servicePerformedController,
                            decoration: const InputDecoration(
                              labelText: 'Yapılan İşlemler',
                              border: OutlineInputBorder(),
                            ),
                            maxLines: 3,
                          ),
                          const SizedBox(height: 16),
                          // Kullanılan ürünler listesi
                          _buildUsedProductsSection(),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _notesController,
                            decoration: const InputDecoration(
                              labelText: 'Notlar',
                              border: OutlineInputBorder(),
                            ),
                            maxLines: 2,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Kaydet butonu
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _saveServiceSlip,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFB73D3D),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: _isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              'Kaydet',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
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
                  ref.invalidate(serviceRequestByIdProvider(widget.serviceRequestId));
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

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
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
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            ElevatedButton.icon(
              onPressed: () => _showProductSelectionDialog(),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFB73D3D),
                foregroundColor: Colors.white,
              ),
              icon: const Icon(Icons.add),
              label: const Text('Ürün Ekle'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (_usedProducts.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'Henüz ürün eklenmemiş',
              style: TextStyle(
                color: Colors.grey,
                fontStyle: FontStyle.italic,
              ),
              textAlign: TextAlign.center,
            ),
          )
        else
          ...(_usedProducts.asMap().entries.map((entry) {
            final index = entry.key;
            final product = entry.value;
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            product['name'] ?? 'Bilinmeyen Ürün',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (product['description'] != null)
                            Text(
                              product['description'],
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 12,
                              ),
                            ),
                          const SizedBox(height: 4),
                          Text(
                            'Miktar: ${product['quantity']} ${product['unit'] ?? 'adet'}',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => _removeProduct(index),
                      icon: const Icon(Icons.remove_circle),
                      color: Colors.red,
                    ),
                  ],
                ),
              ),
            );
          }).toList()),
      ],
    );
  }

  void _saveServiceSlip() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final service = ref.read(serviceRequestServiceProvider);
      
      // Müşteri bilgilerini hazırla
      final customerData = {
        'name': _customerNameController.text,
        'phone': _customerPhoneController.text,
        'address': _customerAddressController.text,
      };

      // Ekipman bilgilerini hazırla
      final equipmentData = {
        'brand': _equipmentBrandController.text,
        'model': _equipmentModelController.text,
        'serial_number': _equipmentSerialController.text,
      };

      // Servis detaylarını hazırla
      final serviceDetails = {
        'problem_description': _problemDescriptionController.text,
        'service_performed': _servicePerformedController.text,
        'notes': _notesController.text,
        'used_products': _usedProducts,
      };

      final serviceRequest = await ref.read(serviceRequestByIdProvider(widget.serviceRequestId).future);
      
      if (serviceRequest?.hasServiceSlip == true) {
        // Mevcut servis fişini güncelle
        await service.updateServiceSlip(
          widget.serviceRequestId,
          technicianName: _technicianNameController.text.isNotEmpty ? _technicianNameController.text : null,
          customerData: customerData,
          equipmentData: equipmentData,
          serviceDetails: serviceDetails,
        );
      } else {
        // Yeni servis fişi oluştur
        await service.createServiceSlip(
          widget.serviceRequestId,
          technicianName: _technicianNameController.text,
          customerData: customerData,
          equipmentData: equipmentData,
          serviceDetails: serviceDetails,
        );
      }

      // Provider'ı yenile
      ref.invalidate(serviceRequestByIdProvider(widget.serviceRequestId));

      if (mounted) {
        final message = serviceRequest?.hasServiceSlip == true 
            ? 'Servis fişi başarıyla güncellendi'
            : 'Servis fişi başarıyla oluşturuldu';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(message)),
        );
        context.go('/service-requests/${widget.serviceRequestId}');
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
}

class _ProductSelectionDialog extends StatefulWidget {
  final Function(Map<String, dynamic>, double) onProductSelected;

  const _ProductSelectionDialog({
    required this.onProductSelected,
  });

  @override
  State<_ProductSelectionDialog> createState() => _ProductSelectionDialogState();
}

class _ProductSelectionDialogState extends State<_ProductSelectionDialog> {
  final _searchController = TextEditingController();
  final _quantityController = TextEditingController(text: '1');
  List<Map<String, dynamic>> _products = [];
  List<Map<String, dynamic>> _filteredProducts = [];
  Map<String, dynamic>? _selectedProduct;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProducts();
    _searchController.addListener(_filterProducts);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _quantityController.dispose();
    super.dispose();
  }

  void _loadProducts() async {
    // TODO: Ürünleri API'den yükle
    // Şimdilik örnek veri
    await Future.delayed(const Duration(milliseconds: 500));
    setState(() {
      _products = [
        {
          'id': '1',
          'name': 'Kamera Kablosu',
          'description': 'Cat6 Ethernet kablosu, 20m',
          'unit': 'metre',
          'price': 15.0,
        },
        {
          'id': '2',
          'name': 'IP Kamera',
          'description': '4MP Güvenlik Kamerası',
          'unit': 'adet',
          'price': 850.0,
        },
        {
          'id': '3',
          'name': 'Güç Adaptörü',
          'description': '12V 2A Güç Kaynağı',
          'unit': 'adet',
          'price': 45.0,
        },
      ];
      _filteredProducts = _products;
      _isLoading = false;
    });
  }

  void _filterProducts() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredProducts = _products.where((product) {
        return (product['name'] as String).toLowerCase().contains(query) ||
               (product['description'] as String? ?? '').toLowerCase().contains(query);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
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
                  topLeft: Radius.circular(8),
                  topRight: Radius.circular(8),
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
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close, color: Colors.white),
                  ),
                ],
              ),
            ),
            
            // Search
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                controller: _searchController,
                decoration: const InputDecoration(
                  labelText: 'Ürün ara...',
                  prefixIcon: Icon(Icons.search),
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            
            // Product List
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _filteredProducts.length,
                      itemBuilder: (context, index) {
                        final product = _filteredProducts[index];
                        final isSelected = _selectedProduct?['id'] == product['id'];
                        
                        return Card(
                          color: isSelected ? Colors.blue.shade50 : null,
                          child: ListTile(
                            title: Text(product['name']),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (product['description'] != null)
                                  Text(product['description']),
                                Text('Fiyat: ${product['price']} TL'),
                              ],
                            ),
                            trailing: isSelected
                                ? const Icon(Icons.check_circle, color: Colors.blue)
                                : null,
                            onTap: () {
                              setState(() {
                                _selectedProduct = product;
                              });
                            },
                          ),
                        );
                      },
                    ),
            ),
            
            // Quantity and Add Button
            if (_selectedProduct != null)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border(top: BorderSide(color: Colors.grey.shade300)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _quantityController,
                        decoration: InputDecoration(
                          labelText: 'Miktar (${_selectedProduct!['unit']})',
                          border: const OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    const SizedBox(width: 16),
                    ElevatedButton(
                      onPressed: () {
                        final quantity = double.tryParse(_quantityController.text) ?? 1;
                        widget.onProductSelected(_selectedProduct!, quantity);
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFB73D3D),
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Ekle'),
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
