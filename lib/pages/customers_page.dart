import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/customer_provider.dart';
import '../models/customer.dart';

class CustomersPage extends ConsumerStatefulWidget {
  const CustomersPage({super.key});

  @override
  ConsumerState<CustomersPage> createState() => _CustomersPageState();
}

class _CustomersPageState extends ConsumerState<CustomersPage> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedFilter = 'Tümü';
  String _selectedType = 'Tümü';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final customersAsync = ref.watch(customersProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF2F2F7),
      appBar: AppBar(
        title: Text(
          'Müşteriler',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontSize: 17,
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: const Color(0xFFF2F2F7),
        foregroundColor: const Color(0xFF000000),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        actions: [
          CupertinoButton(
            padding: const EdgeInsets.all(8),
            onPressed: () => context.go('/customers/new'),
            child: const Icon(
              CupertinoIcons.plus_circle_fill,
              color: Color(0xFFD32F2F),
              size: 24,
            ),
          ),
        ],
      ),
      body: Column(
        children: [
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
                
                // Durum filtreleri
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('Tümü', _selectedFilter == 'Tümü', (v) {
                        setState(() => _selectedFilter = v);
                      }),
                      const SizedBox(width: 8),
                      _buildFilterChip('Aktif', _selectedFilter == 'Aktif', (v) {
                        setState(() => _selectedFilter = v);
                      }),
                      const SizedBox(width: 8),
                      _buildFilterChip('Pasif', _selectedFilter == 'Pasif', (v) {
                        setState(() => _selectedFilter = v);
                      }),
                      const SizedBox(width: 8),
                      _buildFilterChip('Potansiyel', _selectedFilter == 'Potansiyel', (v) {
                        setState(() => _selectedFilter = v);
                      }),
                    ],
                  ),
                ),

                const SizedBox(height: 8),

                // Tip filtreleri  
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildTypeChip('Tümü', _selectedType == 'Tümü', (v) {
                        setState(() => _selectedType = v);
                      }),
                      const SizedBox(width: 8),
                      _buildTypeChip('Bireysel', _selectedType == 'Bireysel', (v) {
                        setState(() => _selectedType = v);
                      }),
                      const SizedBox(width: 8),
                      _buildTypeChip('Kurumsal', _selectedType == 'Kurumsal', (v) {
                        setState(() => _selectedType = v);
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Müşteri listesi
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(customersProvider);
              },
              color: const Color(0xFFD32F2F),
              child: customersAsync.when(
                data: (customers) {
                  final filteredCustomers = _filterCustomers(customers);
                  
                  if (filteredCustomers.isEmpty) {
                    return _buildEmptyState();
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredCustomers.length,
                    itemBuilder: (context, index) {
                      return _buildCustomerCard(filteredCustomers[index]);
                    },
                  );
                },
                loading: () => const Center(
                  child: CupertinoActivityIndicator(color: Color(0xFFD32F2F)),
                ),
                error: (error, stack) => _buildErrorState(error.toString()),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, Function(String) onTap) {
    return CupertinoButton(
      onPressed: () => onTap(label),
      padding: EdgeInsets.zero,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFD32F2F) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFFD32F2F) : const Color(0xFFE5E5EA),
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

  Widget _buildTypeChip(String label, bool isSelected, Function(String) onTap) {
    return CupertinoButton(
      onPressed: () => onTap(label),
      padding: EdgeInsets.zero,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF3B82F6).withOpacity(0.1) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFF3B82F6) : const Color(0xFFE5E5EA),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              label == 'Kurumsal' 
                ? CupertinoIcons.building_2_fill 
                : label == 'Bireysel' 
                  ? CupertinoIcons.person_fill
                  : CupertinoIcons.list_bullet,
              size: 14,
              color: isSelected ? const Color(0xFF3B82F6) : const Color(0xFF8E8E93),
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? const Color(0xFF3B82F6) : const Color(0xFF8E8E93),
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCustomerCard(Customer customer) {
    final statusColor = _getStatusColor(customer.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.go('/customers/${customer.id}'),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    // Avatar
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            statusColor.withOpacity(0.2),
                            statusColor.withOpacity(0.1),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        customer.type == 'kurumsal' 
                          ? CupertinoIcons.building_2_fill
                          : CupertinoIcons.person_fill,
                        color: statusColor,
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
                            customer.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF000000),
                            ),
                          ),
                          if (customer.company != null && customer.company!.isNotEmpty) ...[
                            const SizedBox(height: 2),
                            Text(
                              customer.company!,
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xFF8E8E93),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    
                    // Durum badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        _getStatusText(customer.status),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: statusColor,
                        ),
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // İletişim bilgileri
                Row(
                  children: [
                    if (customer.email != null && customer.email!.isNotEmpty) ...[
                      Expanded(
                        child: Row(
                          children: [
                            const Icon(
                              CupertinoIcons.mail,
                              size: 14,
                              color: Color(0xFF8E8E93),
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                customer.email!,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Color(0xFF8E8E93),
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    if (customer.mobilePhone != null && customer.mobilePhone!.isNotEmpty) ...[
                      const SizedBox(width: 16),
                      Row(
                        children: [
                          const Icon(
                            CupertinoIcons.phone,
                            size: 14,
                            color: Color(0xFF8E8E93),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            customer.mobilePhone!,
                            style: const TextStyle(
                              fontSize: 13,
                              color: Color(0xFF8E8E93),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
                
                // Bakiye ve segment bilgisi
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Bakiye
                    Row(
                      children: [
                        const Icon(
                          CupertinoIcons.money_dollar_circle,
                          size: 16,
                          color: Color(0xFF22C55E),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _formatCurrency(customer.balance),
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF22C55E),
                          ),
                        ),
                      ],
                    ),
                    
                    // Segment
                    if (customer.customerSegment != null && customer.customerSegment!.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF9333EA).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          customer.customerSegment!,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF9333EA),
                          ),
                        ),
                      ),
                  ],
                ),
                
                // Hızlı işlem butonları
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildQuickActionButton(
                      CupertinoIcons.phone_fill,
                      const Color(0xFF22C55E),
                      () {
                        // TODO: Telefon ara
                      },
                    ),
                    const SizedBox(width: 8),
                    _buildQuickActionButton(
                      CupertinoIcons.mail_solid,
                      const Color(0xFF3B82F6),
                      () {
                        // TODO: E-posta gönder
                      },
                    ),
                    const Spacer(),
                    _buildQuickActionButton(
                      CupertinoIcons.chevron_right,
                      const Color(0xFF8E8E93),
                      () => context.go('/customers/${customer.id}'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActionButton(IconData icon, Color color, VoidCallback onTap) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: color, size: 18),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFFD32F2F).withOpacity(0.1),
              borderRadius: BorderRadius.circular(40),
            ),
            child: const Icon(
              CupertinoIcons.person_2,
              size: 40,
              color: Color(0xFFD32F2F),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            _searchQuery.isNotEmpty ? 'Arama sonucu bulunamadı' : 'Henüz müşteri yok',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Color(0xFF000000),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _searchQuery.isNotEmpty 
              ? 'Farklı bir arama terimi deneyin'
              : 'İlk müşterinizi ekleyin',
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF8E8E93),
            ),
          ),
          if (_searchQuery.isEmpty) ...[
            const SizedBox(height: 24),
            CupertinoButton(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              color: const Color(0xFFD32F2F),
              borderRadius: BorderRadius.circular(10),
              onPressed: () => context.go('/customers/new'),
              child: const Text(
                'Müşteri Ekle',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            CupertinoIcons.exclamationmark_triangle,
            size: 48,
            color: Color(0xFFEF4444),
          ),
          const SizedBox(height: 16),
          const Text(
            'Bir hata oluştu',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Color(0xFF000000),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            error,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF8E8E93),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          CupertinoButton(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            color: const Color(0xFFD32F2F),
            borderRadius: BorderRadius.circular(10),
            onPressed: () => ref.invalidate(customersProvider),
            child: const Text(
              'Tekrar Dene',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  List<Customer> _filterCustomers(List<Customer> customers) {
    var filtered = customers;

    // Arama filtresi
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      filtered = filtered.where((customer) {
        return customer.name.toLowerCase().contains(query) ||
               (customer.company?.toLowerCase().contains(query) ?? false) ||
               (customer.email?.toLowerCase().contains(query) ?? false) ||
               (customer.mobilePhone?.contains(query) ?? false);
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
        filtered = filtered.where((customer) => customer.status == statusFilter).toList();
      }
    }

    // Tip filtresi
    if (_selectedType != 'Tümü') {
      String typeFilter;
      switch (_selectedType) {
        case 'Bireysel':
          typeFilter = 'bireysel';
          break;
        case 'Kurumsal':
          typeFilter = 'kurumsal';
          break;
        default:
          typeFilter = '';
      }
      
      if (typeFilter.isNotEmpty) {
        filtered = filtered.where((customer) => customer.type == typeFilter).toList();
      }
    }

    return filtered;
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'aktif':
        return const Color(0xFF22C55E);
      case 'pasif':
        return const Color(0xFFEF4444);
      case 'potansiyel':
        return const Color(0xFFFF9500);
      default:
        return const Color(0xFF8E8E93);
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

  String _formatCurrency(double? amount) {
    if (amount == null) return '₺0,00';
    return '₺${amount.toStringAsFixed(2).replaceAll('.', ',')}';
  }
}
