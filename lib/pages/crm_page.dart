import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/crm_provider.dart';
import '../providers/sales_provider.dart';
import '../models/opportunity.dart';

/// CRM Dashboard Sayfası
/// Web app'teki CRM modülünün mobil versiyonu
class CrmPage extends ConsumerStatefulWidget {
  const CrmPage({super.key});

  @override
  ConsumerState<CrmPage> createState() => _CrmPageState();
}

class _CrmPageState extends ConsumerState<CrmPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final crmStatsAsync = ref.watch(crmStatsProvider);
    final opportunitiesAsync = ref.watch(opportunitiesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF2F2F7),
      appBar: AppBar(
        title: Text(
          'CRM',
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
            onPressed: () => context.go('/sales/opportunities/new'),
            child: const Icon(
              CupertinoIcons.plus_circle_fill,
              color: Color(0xFFD32F2F),
              size: 24,
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFFD32F2F),
          unselectedLabelColor: const Color(0xFF8E8E93),
          indicatorColor: const Color(0xFFD32F2F),
          tabs: const [
            Tab(text: 'Özet'),
            Tab(text: 'Fırsatlar'),
            Tab(text: 'Pipeline'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Özet Tab
          _buildSummaryTab(context, crmStatsAsync, opportunitiesAsync),
          // Fırsatlar Tab
          _buildOpportunitiesTab(context, opportunitiesAsync),
          // Pipeline Tab
          _buildPipelineTab(context, opportunitiesAsync),
        ],
      ),
    );
  }

  Widget _buildSummaryTab(
    BuildContext context,
    AsyncValue<Map<String, dynamic>> crmStatsAsync,
    AsyncValue<List<Opportunity>> opportunitiesAsync,
  ) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(crmStatsProvider);
        ref.invalidate(opportunitiesProvider);
      },
      color: const Color(0xFFD32F2F),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // CRM İstatistikleri
            crmStatsAsync.when(
              data: (stats) => _buildStatsGrid(context, stats),
              loading: () => _buildLoadingStats(),
              error: (e, _) => _buildErrorCard('İstatistikler yüklenemedi'),
            ),
            const SizedBox(height: 24),

            // Son Fırsatlar
            Text(
              'Son Fırsatlar',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF000000),
              ),
            ),
            const SizedBox(height: 16),
            opportunitiesAsync.when(
              data: (opportunities) => _buildRecentOpportunities(context, opportunities),
              loading: () => const Center(child: CupertinoActivityIndicator()),
              error: (e, _) => _buildErrorCard('Fırsatlar yüklenemedi'),
            ),
            const SizedBox(height: 24),

            // Hızlı Erişim
            Text(
              'Hızlı Erişim',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF000000),
              ),
            ),
            const SizedBox(height: 16),
            _buildQuickActions(context),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsGrid(BuildContext context, Map<String, dynamic> stats) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Toplam Fırsat',
                '${stats['totalOpportunities'] ?? 0}',
                CupertinoIcons.star_fill,
                const Color(0xFFFF9500),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Aktif',
                '${stats['activeOpportunities'] ?? 0}',
                CupertinoIcons.bolt_fill,
                const Color(0xFF3B82F6),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Kazanılan',
                '${stats['wonOpportunities'] ?? 0}',
                CupertinoIcons.checkmark_circle_fill,
                const Color(0xFF22C55E),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Toplam Değer',
                '₺${_formatNumber(stats['totalValue'] ?? 0)}',
                CupertinoIcons.money_dollar_circle_fill,
                const Color(0xFF9333EA),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.1)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              Text(
                value,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(
              fontSize: 13,
              color: Color(0xFF8E8E93),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentOpportunities(BuildContext context, List<Opportunity> opportunities) {
    if (opportunities.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            const Icon(
              CupertinoIcons.star,
              size: 48,
              color: Color(0xFF8E8E93),
            ),
            const SizedBox(height: 12),
            const Text(
              'Henüz fırsat bulunmuyor',
              style: TextStyle(
                fontSize: 16,
                color: Color(0xFF8E8E93),
              ),
            ),
            const SizedBox(height: 16),
            CupertinoButton(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              color: const Color(0xFFD32F2F),
              borderRadius: BorderRadius.circular(8),
              onPressed: () => context.go('/sales/opportunities/new'),
              child: const Text(
                'Yeni Fırsat Ekle',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: opportunities.take(5).map((opp) => _buildOpportunityCard(context, opp)).toList(),
    );
  }

  Widget _buildOpportunityCard(BuildContext context, Opportunity opportunity) {
    final statusColor = _getStatusColor(opportunity.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.go('/sales/opportunities/${opportunity.id}'),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        opportunity.title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF000000),
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        _getStatusText(opportunity.status),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: statusColor,
                        ),
                      ),
                    ),
                  ],
                ),
                if (opportunity.customerName != null) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(
                        CupertinoIcons.person,
                        size: 14,
                        color: Color(0xFF8E8E93),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        opportunity.customerName!,
                        style: const TextStyle(
                          fontSize: 14,
                          color: Color(0xFF8E8E93),
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '₺${_formatNumber(opportunity.value ?? 0)}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF22C55E),
                      ),
                    ),
                    if (opportunity.expectedCloseDate != null)
                      Row(
                        children: [
                          const Icon(
                            CupertinoIcons.calendar,
                            size: 14,
                            color: Color(0xFF8E8E93),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _formatDate(opportunity.expectedCloseDate!),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF8E8E93),
                            ),
                          ),
                        ],
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

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      children: [
        _buildQuickActionCard(
          context,
          'Yeni Fırsat',
          'Yeni satış fırsatı oluştur',
          CupertinoIcons.plus_circle_fill,
          const Color(0xFFFF9500),
          () => context.go('/sales/opportunities/new'),
        ),
        const SizedBox(height: 12),
        _buildQuickActionCard(
          context,
          'Müşteriler',
          'Müşteri listesine git',
          CupertinoIcons.person_2_fill,
          const Color(0xFF3B82F6),
          () => context.go('/customers'),
        ),
        const SizedBox(height: 12),
        _buildQuickActionCard(
          context,
          'Teklifler',
          'Teklif listesine git',
          CupertinoIcons.doc_fill,
          const Color(0xFF9333EA),
          () => context.go('/sales/proposals'),
        ),
      ],
    );
  }

  Widget _buildQuickActionCard(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.1)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF000000),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF8E8E93),
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  CupertinoIcons.chevron_right,
                  color: Color(0xFF8E8E93),
                  size: 16,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildOpportunitiesTab(BuildContext context, AsyncValue<List<Opportunity>> opportunitiesAsync) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(opportunitiesProvider);
      },
      color: const Color(0xFFD32F2F),
      child: opportunitiesAsync.when(
        data: (opportunities) {
          if (opportunities.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    CupertinoIcons.star,
                    size: 64,
                    color: Color(0xFF8E8E93),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Henüz fırsat bulunmuyor',
                    style: TextStyle(
                      fontSize: 18,
                      color: Color(0xFF8E8E93),
                    ),
                  ),
                  const SizedBox(height: 24),
                  CupertinoButton(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    color: const Color(0xFFD32F2F),
                    borderRadius: BorderRadius.circular(10),
                    onPressed: () => context.go('/sales/opportunities/new'),
                    child: const Text(
                      'İlk Fırsatı Ekle',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: opportunities.length,
            itemBuilder: (context, index) {
              return _buildOpportunityCard(context, opportunities[index]);
            },
          );
        },
        loading: () => const Center(child: CupertinoActivityIndicator()),
        error: (e, _) => Center(child: Text('Hata: $e')),
      ),
    );
  }

  Widget _buildPipelineTab(BuildContext context, AsyncValue<List<Opportunity>> opportunitiesAsync) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(opportunitiesProvider);
      },
      color: const Color(0xFFD32F2F),
      child: opportunitiesAsync.when(
        data: (opportunities) {
          // Pipeline aşamalarına göre grupla
          final stages = {
            'new': opportunities.where((o) => o.status == 'new').toList(),
            'qualified': opportunities.where((o) => o.status == 'qualified').toList(),
            'proposal': opportunities.where((o) => o.status == 'proposal').toList(),
            'negotiation': opportunities.where((o) => o.status == 'negotiation').toList(),
            'won': opportunities.where((o) => o.status == 'won').toList(),
          };

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildPipelineStage('Yeni', stages['new'] ?? [], const Color(0xFF3B82F6)),
                const SizedBox(height: 16),
                _buildPipelineStage('Nitelikli', stages['qualified'] ?? [], const Color(0xFFFF9500)),
                const SizedBox(height: 16),
                _buildPipelineStage('Teklif', stages['proposal'] ?? [], const Color(0xFF9333EA)),
                const SizedBox(height: 16),
                _buildPipelineStage('Müzakere', stages['negotiation'] ?? [], const Color(0xFFEF4444)),
                const SizedBox(height: 16),
                _buildPipelineStage('Kazanıldı', stages['won'] ?? [], const Color(0xFF22C55E)),
              ],
            ),
          );
        },
        loading: () => const Center(child: CupertinoActivityIndicator()),
        error: (e, _) => Center(child: Text('Hata: $e')),
      ),
    );
  }

  Widget _buildPipelineStage(String title, List<Opportunity> opportunities, Color color) {
    final totalValue = opportunities.fold<double>(0, (sum, opp) => sum + (opp.value ?? 0));

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: color.withOpacity(0.05),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: color,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: color,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${opportunities.length}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: color,
                        ),
                      ),
                    ),
                  ],
                ),
                Text(
                  '₺${_formatNumber(totalValue)}',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
          if (opportunities.isNotEmpty)
            ...opportunities.take(3).map((opp) => _buildMiniOpportunityCard(opp, color)),
          if (opportunities.length > 3)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(
                '+${opportunities.length - 3} daha',
                style: TextStyle(
                  fontSize: 13,
                  color: color,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMiniOpportunityCard(Opportunity opportunity, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Color(0xFFF0F0F0)),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  opportunity.title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (opportunity.customerName != null)
                  Text(
                    opportunity.customerName!,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF8E8E93),
                    ),
                  ),
              ],
            ),
          ),
          Text(
            '₺${_formatNumber(opportunity.value ?? 0)}',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingStats() {
    return Row(
      children: [
        Expanded(child: _buildLoadingCard()),
        const SizedBox(width: 12),
        Expanded(child: _buildLoadingCard()),
      ],
    );
  }

  Widget _buildLoadingCard() {
    return Container(
      height: 100,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Center(child: CupertinoActivityIndicator()),
    );
  }

  Widget _buildErrorCard(String message) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red[200]!),
      ),
      child: Row(
        children: [
          Icon(CupertinoIcons.exclamationmark_circle, color: Colors.red[600]),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: TextStyle(color: Colors.red[600]),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'new':
        return const Color(0xFF3B82F6);
      case 'qualified':
        return const Color(0xFFFF9500);
      case 'proposal':
        return const Color(0xFF9333EA);
      case 'negotiation':
        return const Color(0xFFEF4444);
      case 'won':
        return const Color(0xFF22C55E);
      case 'lost':
        return const Color(0xFF8E8E93);
      default:
        return const Color(0xFF8E8E93);
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'new':
        return 'Yeni';
      case 'qualified':
        return 'Nitelikli';
      case 'proposal':
        return 'Teklif';
      case 'negotiation':
        return 'Müzakere';
      case 'won':
        return 'Kazanıldı';
      case 'lost':
        return 'Kaybedildi';
      default:
        return status;
    }
  }

  String _formatNumber(num value) {
    if (value >= 1000000) {
      return '${(value / 1000000).toStringAsFixed(1)}M';
    } else if (value >= 1000) {
      return '${(value / 1000).toStringAsFixed(1)}K';
    }
    return value.toStringAsFixed(0);
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

