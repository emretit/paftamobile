import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class CustomersPage extends ConsumerStatefulWidget {
  const CustomersPage({super.key});

  @override
  ConsumerState<CustomersPage> createState() => _CustomersPageState();
}

class _CustomersPageState extends ConsumerState<CustomersPage> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedFilter = 'Tümü';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFF2F2F7),
      child: Column(
        children: [
          // Custom AppBar
          Container(
            color: const Color(0xFFF2F2F7),
            padding: const EdgeInsets.only(
              top: 44, // Status bar height
              left: 16,
              right: 16,
              bottom: 8,
            ),
            child: Row(
              children: [
                Text(
                  'Müşteriler',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontSize: 17,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Spacer(),
                CupertinoButton(
                  onPressed: () {
                    // Yeni müşteri ekleme sayfasına git
                    // TODO: Implement add customer functionality
                  },
                  child: const Icon(
                    CupertinoIcons.add_circled,
                    color: Color(0xFFB73D3D),
                    size: 24,
                  ),
                ),
              ],
            ),
          ),
          
          // Arama ve Filtre
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              children: [
                // Arama çubuğu
                CupertinoSearchTextField(
                  controller: _searchController,
                  placeholder: 'Müşteri ara...',
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value;
                    });
                  },
                  backgroundColor: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
                
                const SizedBox(height: 12),
                
                // Filtre butonları
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('Tümü', _selectedFilter == 'Tümü'),
                      const SizedBox(width: 8),
                      _buildFilterChip('Aktif', _selectedFilter == 'Aktif'),
                      const SizedBox(width: 8),
                      _buildFilterChip('Pasif', _selectedFilter == 'Pasif'),
                      const SizedBox(width: 8),
                      _buildFilterChip('Potansiyel', _selectedFilter == 'Potansiyel'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Müşteri listesi
          Expanded(
            child: _buildCustomersList(),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected) {
    return CupertinoButton(
      onPressed: () {
        setState(() {
          _selectedFilter = label;
        });
      },
      padding: EdgeInsets.zero,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFB73D3D) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFFB73D3D) : const Color(0xFFE5E5EA),
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF8E8E93),
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildCustomersList() {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _fetchCustomers(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CupertinoActivityIndicator(
              color: Color(0xFFB73D3D),
            ),
          );
        }

        if (snapshot.hasError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  CupertinoIcons.exclamationmark_triangle,
                  size: 48,
                  color: Colors.red[400],
                ),
                const SizedBox(height: 16),
                Text(
                  'Hata oluştu',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Colors.red[600],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Müşteriler yüklenemedi',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          );
        }

        final customers = snapshot.data ?? [];
        final filteredCustomers = _filterCustomers(customers);

        if (filteredCustomers.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  CupertinoIcons.person_2,
                  size: 48,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                Text(
                  _searchQuery.isNotEmpty ? 'Arama sonucu bulunamadı' : 'Henüz müşteri yok',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _searchQuery.isNotEmpty 
                    ? 'Farklı bir arama terimi deneyin'
                    : 'İlk müşterinizi ekleyin',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            setState(() {});
          },
          color: const Color(0xFFB73D3D),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: filteredCustomers.length,
            itemBuilder: (context, index) {
              final customer = filteredCustomers[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: _buildCustomerCard(customer),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildCustomerCard(Map<String, dynamic> customer) {
    return Container(
      padding: const EdgeInsets.all(16),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Müşteri avatarı
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFFB73D3D).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Icon(
                  customer['type'] == 'kurumsal' 
                    ? CupertinoIcons.building_2_fill
                    : CupertinoIcons.person_fill,
                  color: const Color(0xFFB73D3D),
                  size: 24,
                ),
              ),
              
              const SizedBox(width: 12),
              
              // Müşteri bilgileri
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      customer['name'] ?? 'İsimsiz',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (customer['company'] != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        customer['company'],
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: const Color(0xFF8E8E93),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              
              // Durum etiketi
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _getStatusColor(customer['status']).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _getStatusText(customer['status']),
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: _getStatusColor(customer['status']),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          // İletişim bilgileri
          if (customer['email'] != null || customer['mobile_phone'] != null) ...[
            Row(
              children: [
                if (customer['email'] != null) ...[
                  Icon(
                    CupertinoIcons.mail,
                    size: 16,
                    color: const Color(0xFF8E8E93),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      customer['email'],
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: const Color(0xFF8E8E93),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
                if (customer['mobile_phone'] != null) ...[
                  const SizedBox(width: 16),
                  Icon(
                    CupertinoIcons.phone,
                    size: 16,
                    color: const Color(0xFF8E8E93),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    customer['mobile_phone'],
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF8E8E93),
                    ),
                  ),
                ],
              ],
            ),
          ],
          
          if (customer['address'] != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  CupertinoIcons.location,
                  size: 16,
                  color: const Color(0xFF8E8E93),
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    customer['address'],
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF8E8E93),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
          
          const SizedBox(height: 12),
          
          // Alt bilgiler
          Row(
            children: [
              Text(
                'Bakiye: ${_formatCurrency(customer['balance'] ?? 0)}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: const Color(0xFF8E8E93),
                ),
              ),
              const Spacer(),
              Text(
                'Son görüşme: ${_formatDate(customer['last_interaction'])}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: const Color(0xFF8E8E93),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<List<Map<String, dynamic>>> _fetchCustomers() async {
    try {
      final response = await Supabase.instance.client
          .from('customers')
          .select('*')
          .order('created_at', ascending: false);
      
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Müşteriler yüklenirken hata oluştu: $e');
    }
  }

  List<Map<String, dynamic>> _filterCustomers(List<Map<String, dynamic>> customers) {
    var filtered = customers;

    // Arama filtresi
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((customer) {
        final name = (customer['name'] ?? '').toString().toLowerCase();
        final company = (customer['company'] ?? '').toString().toLowerCase();
        final email = (customer['email'] ?? '').toString().toLowerCase();
        final query = _searchQuery.toLowerCase();
        
        return name.contains(query) || 
               company.contains(query) || 
               email.contains(query);
      }).toList();
    }

    // Durum filtresi
    if (_selectedFilter != 'Tümü') {
      String statusFilter;
      switch (_selectedFilter) {
        case 'Aktif':
          statusFilter = 'aktif';
          break;
        case 'Pasif':
          statusFilter = 'pasif';
          break;
        case 'Potansiyel':
          statusFilter = 'potansiyel';
          break;
        default:
          statusFilter = '';
      }
      
      if (statusFilter.isNotEmpty) {
        filtered = filtered.where((customer) {
          return customer['status'] == statusFilter;
        }).toList();
      }
    }

    return filtered;
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'aktif':
        return Colors.green;
      case 'pasif':
        return Colors.red;
      case 'potansiyel':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String? status) {
    switch (status) {
      case 'aktif':
        return 'Aktif';
      case 'pasif':
        return 'Pasif';
      case 'potansiyel':
        return 'Potansiyel';
      default:
        return 'Bilinmiyor';
    }
  }

  String _formatCurrency(dynamic amount) {
    if (amount == null) return '₺0,00';
    final num = double.tryParse(amount.toString()) ?? 0;
    return '₺${num.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'Bilinmiyor';
    
    try {
      final dateTime = DateTime.parse(date.toString());
      final now = DateTime.now();
      final difference = now.difference(dateTime);
      
      if (difference.inDays == 0) {
        return 'Bugün';
      } else if (difference.inDays == 1) {
        return 'Dün';
      } else if (difference.inDays < 7) {
        return '${difference.inDays} gün önce';
      } else {
        return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
      }
    } catch (e) {
      return 'Bilinmiyor';
    }
  }
}
