import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/service_request.dart';
import '../providers/service_request_provider.dart';
import '../services/service_request_service.dart';
import '../shared/widgets/bottom_navigation_bar.dart';

class ServiceSlipViewPage extends ConsumerStatefulWidget {
  final String serviceRequestId;

  const ServiceSlipViewPage({
    super.key,
    required this.serviceRequestId,
  });

  @override
  ConsumerState<ServiceSlipViewPage> createState() => _ServiceSlipViewPageState();
}

class _ServiceSlipViewPageState extends ConsumerState<ServiceSlipViewPage> {
  bool _isLoading = false;

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
        actions: [
          CupertinoButton(
            onPressed: () => context.go('/service-requests/${widget.serviceRequestId}/slip'),
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: const Color(0xFFB73D3D),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                CupertinoIcons.pencil,
                color: Colors.white,
                size: 18,
              ),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: serviceRequestAsync.when(
        data: (serviceRequest) {
          if (serviceRequest == null) {
            return const Center(
              child: Text('Servis talebi bulunamadı'),
            );
          }

          if (!serviceRequest.hasServiceSlip) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_long, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  const Text('Henüz servis fişi oluşturulmamış'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.go('/service-requests/${widget.serviceRequestId}/slip'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFB73D3D),
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Servis Fişi Oluştur'),
                  ),
                ],
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Fiş başlığı
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Icon(Icons.receipt, color: Colors.blue[600]),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Servis Fişi: ${serviceRequest.slipNumber}',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  _buildStatusChip(
                                    serviceRequest.slipStatusDisplayName,
                                    serviceRequest.slipStatus ?? 'draft',
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    _formatDateTime(serviceRequest.issueDate ?? serviceRequest.createdAt),
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Servis talebi bilgileri
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Servis Talebi',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildInfoRow('Başlık', serviceRequest.title),
                        if (serviceRequest.description != null)
                          _buildInfoRow('Açıklama', serviceRequest.description!),
                        _buildInfoRow('Durum', serviceRequest.statusDisplayName),
                        _buildInfoRow('Öncelik', serviceRequest.priorityDisplayName),
                        if (serviceRequest.location != null)
                          _buildInfoRow('Konum', serviceRequest.location!),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Teknisyen bilgileri
                if (serviceRequest.technicianName != null)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Teknisyen',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 12),
                          _buildInfoRow('Ad', serviceRequest.technicianName!),
                          if (serviceRequest.completionDate != null)
                            _buildInfoRow('Tamamlanma Tarihi', _formatDateTime(serviceRequest.completionDate!)),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 16),

                // Müşteri bilgileri
                if (serviceRequest.customerData != null && serviceRequest.customerData!.isNotEmpty)
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
                          const SizedBox(height: 12),
                          if (serviceRequest.customerData!['name'] != null)
                            _buildInfoRow('Ad', serviceRequest.customerData!['name']),
                          if (serviceRequest.customerData!['phone'] != null)
                            _buildInfoRow('Telefon', serviceRequest.customerData!['phone']),
                          if (serviceRequest.customerData!['address'] != null)
                            _buildInfoRow('Adres', serviceRequest.customerData!['address']),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 16),

                // Ekipman bilgileri
                if (serviceRequest.equipmentData != null && serviceRequest.equipmentData!.isNotEmpty)
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
                          const SizedBox(height: 12),
                          if (serviceRequest.equipmentData!['brand'] != null)
                            _buildInfoRow('Marka', serviceRequest.equipmentData!['brand']),
                          if (serviceRequest.equipmentData!['model'] != null)
                            _buildInfoRow('Model', serviceRequest.equipmentData!['model']),
                          if (serviceRequest.equipmentData!['serial_number'] != null)
                            _buildInfoRow('Seri No', serviceRequest.equipmentData!['serial_number']),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 16),

                // Servis detayları
                if (serviceRequest.serviceDetails != null && serviceRequest.serviceDetails!.isNotEmpty)
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
                          const SizedBox(height: 12),
                          if (serviceRequest.serviceDetails!['problem_description'] != null)
                            _buildInfoRow('Sorun', serviceRequest.serviceDetails!['problem_description']),
                          if (serviceRequest.serviceDetails!['service_performed'] != null)
                            _buildInfoRow('Yapılan İşlemler', serviceRequest.serviceDetails!['service_performed']),
                          if (serviceRequest.serviceDetails!['notes'] != null)
                            _buildInfoRow('Notlar', serviceRequest.serviceDetails!['notes']),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 16),

                // Kullanılan ürünler
                if (serviceRequest.serviceDetails != null && 
                    serviceRequest.serviceDetails!['used_products'] != null &&
                    (serviceRequest.serviceDetails!['used_products'] as List).isNotEmpty)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Kullanılan Ürünler',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 12),
                          ..._buildUsedProductsList(serviceRequest.serviceDetails!['used_products']),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 16),

                // İmza alanı
                if (serviceRequest.technicianSignature != null)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Teknisyen İmzası',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Container(
                            width: double.infinity,
                            height: 120,
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey[300]!),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Center(
                              child: Text(
                                serviceRequest.technicianSignature!,
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 24),

                // Eylem butonları
                if (serviceRequest.isSlipDraft) ...[
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : () => _completeSlip(serviceRequest),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: _isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              'Fişi Tamamla',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                
                if (serviceRequest.isSlipCompleted) ...[
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : () => _signSlip(serviceRequest),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: _isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              'Fişi İmzala',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // PDF olarak kaydet/paylaş
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => _sharePDF(serviceRequest),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFB73D3D),
                      side: const BorderSide(color: Color(0xFFB73D3D)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    icon: const Icon(Icons.share),
                    label: const Text(
                      'PDF Olarak Paylaş',
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
            width: 100,
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
      case 'draft':
        color = Colors.orange;
        break;
      case 'completed':
        color = Colors.blue;
        break;
      case 'signed':
        color = Colors.green;
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

  void _completeSlip(ServiceRequest serviceRequest) async {
    setState(() {
      _isLoading = true;
    });

    try {
      final service = ref.read(serviceRequestServiceProvider);
      await service.completeServiceSlip(widget.serviceRequestId);

      // Provider'ı yenile
      ref.invalidate(serviceRequestByIdProvider(widget.serviceRequestId));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Servis fişi tamamlandı')),
        );
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

  void _signSlip(ServiceRequest serviceRequest) async {
    // İmza dialog'u göster
    final signature = await _showSignatureDialog();
    if (signature == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final service = ref.read(serviceRequestServiceProvider);
      await service.signServiceSlip(widget.serviceRequestId, signature);

      // Provider'ı yenile
      ref.invalidate(serviceRequestByIdProvider(widget.serviceRequestId));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Servis fişi imzalandı')),
        );
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

  Future<String?> _showSignatureDialog() async {
    final controller = TextEditingController();
    
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('İmza'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'İmzanızı yazın...',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                Navigator.pop(context, controller.text);
              }
            },
            child: const Text('İmzala'),
          ),
        ],
      ),
    );
  }

  void _sharePDF(ServiceRequest serviceRequest) {
    // PDF oluşturma ve paylaşma işlemi
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('PDF paylaşma özelliği yakında eklenecek')),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day.toString().padLeft(2, '0')}.${dateTime.month.toString().padLeft(2, '0')}.${dateTime.year} ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }

  List<Widget> _buildUsedProductsList(dynamic usedProducts) {
    if (usedProducts == null) return [];
    
    final products = usedProducts as List;
    if (products.isEmpty) return [];

    return products.map<Widget>((product) {
      return Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
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
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
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
                  Row(
                    children: [
                      Text(
                        'Miktar: ${product['quantity']} ${product['unit'] ?? 'adet'}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      if (product['price'] != null && product['price'] > 0) ...[
                        const SizedBox(width: 16),
                        Text(
                          'Birim Fiyat: ${product['price']} TL',
                          style: const TextStyle(
                            fontSize: 13,
                            color: Colors.green,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            Icon(
              Icons.inventory_2,
              color: Colors.grey[600],
            ),
          ],
        ),
      );
    }).toList();
  }
}
