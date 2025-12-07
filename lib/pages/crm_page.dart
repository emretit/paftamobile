import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/crm_provider.dart';
import '../providers/sales_provider.dart';
import '../models/opportunity.dart';

/// CRM Dashboard Sayfası - Dashboard ile aynı tasarım dili
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
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF3B82F6), Color(0xFF2563EB)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                CupertinoIcons.chart_bar_alt_fill,
                color: Colors.white,
                size: 16,
              ),
            ),
            const SizedBox(width: 10),
            const Text('CRM'),
          ],
        ),
        backgroundColor: const Color(0xFFF2F2F7),
        foregroundColor: const Color(0xFF000000),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            onPressed: () => context.go('/sales/opportunities/new'),
            icon: const Icon(CupertinoIcons.plus_circle_fill, size: 24),
            color: const Color(0xFF3B82F6),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF3B82F6),
          unselectedLabelColor: const Color(0xFF8E8E93),
          indicatorColor: const Color(0xFF3B82F6),
          indicatorWeight: 3,
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
          _buildSummaryTab(context, crmStatsAsync, opportunitiesAsync),
          _buildOpportunitiesTab(context, opportunitiesAsync),
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
      color: const Color(0xFF3B82F6),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          children: [
            // Gradient Header - Dashboard gibi
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF3B82F6), Color(0xFF2563EB)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                children: [
                  // Stats Cards Compact
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 20, 16, 20),
                    child: crmStatsAsync.when(
                      data: (stats) => _buildCompactStats(stats),
                      loading: () => _buildLoadingStats(),
                      error: (_, __) => const SizedBox.shrink(),
                    ),
                  ),
                ],
              ),
            ),
            
            // Main Content
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Son Fırsatlar
                  _buildSectionHeader('Son Fırsatlar', () => context.go('/sales/opportunities')),
                  const SizedBox(height: 12),
                  opportunitiesAsync.when(
                    data: (opportunities) => _buildRecentOpportunitiesCompact(opportunities),
                    loading: () => _buildLoadingOpportunities(),
                    error: (_, __) => _buildEmptyState('Fırsatlar yüklenemedi', CupertinoIcons.exclamationmark_triangle),
                  ),
                  const SizedBox(height: 20),
                  
                  // Hızlı Erişim
                  _buildSectionHeader('Hızlı Erişim', null),
                  const SizedBox(height: 12),
                  _buildQuickActionsCompact(context),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Kompakt İstatistikler
  Widget _buildCompactStats(Map<String, dynamic> stats) {
    return Row(
      children: [
        Expanded(
          child: _buildStatBubble(
            '${stats['totalOpportunities'] ?? 0}',
            'Toplam',
            CupertinoIcons.star_fill,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatBubble(
            '${stats['activeOpportunities'] ?? 0}',
            'Aktif',
            CupertinoIcons.bolt_fill,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatBubble(
            '${stats['wonOpportunities'] ?? 0}',
            'Kazanılan',
            CupertinoIcons.checkmark_circle_fill,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatBubble(
            '₺${_formatNumber(stats['totalValue'] ?? 0)}',
            'Değer',
            CupertinoIcons.money_dollar_circle_fill,
          ),
        ),
      ],
    );
  }

  Widget _buildStatBubble(String value, String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: Colors.white.withOpacity(0.3),
          width: 1.5,
        ),
      ),
      child: Column(
        children: [
          Icon(icon, color: Colors.white, size: 20),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.5,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withOpacity(0.9),
              fontSize: 11,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  // Bölüm Başlığı
  Widget _buildSectionHeader(String title, VoidCallback? onViewAll) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF000000),
            letterSpacing: -0.5,
          ),
        ),
        if (onViewAll != null)
          TextButton(
            onPressed: onViewAll,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Tümünü Gör',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF3B82F6),
                  ),
                ),
                const SizedBox(width: 2),
                const Icon(
                  CupertinoIcons.chevron_right,
                  size: 14,
                  color: Color(0xFF3B82F6),
                ),
              ],
            ),
          ),
      ],
    );
  }

  // Kompakt Fırsatlar
  Widget _buildRecentOpportunitiesCompact(List<Opportunity> opportunities) {
    if (opportunities.isEmpty) {
      return _buildEmptyState('Henüz fırsat bulunmuyor', CupertinoIcons.star);
    }

    return Column(
      children: opportunities.take(4).map((opp) => _buildOpportunityItemCompact(opp)).toList(),
    );
  }

  Widget _buildOpportunityItemCompact(Opportunity opportunity) {
    final statusColor = _getStatusColor(opportunity.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.grey.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.go('/sales/opportunities/${opportunity.id}'),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  width: 6,
                  height: 40,
                  decoration: BoxDecoration(
                    color: statusColor,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        opportunity.title,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF000000),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (opportunity.customerName != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          opportunity.customerName!,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '₺${_formatNumber(opportunity.value ?? 0)}',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: statusColor,
                      ),
                    ),
                    if (opportunity.expectedCloseDate != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        _formatDate(opportunity.expectedCloseDate!),
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF8E8E93),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Kompakt Hızlı Erişim
  Widget _buildQuickActionsCompact(BuildContext context) {
    final actions = [
      _QuickAction('Yeni Fırsat', CupertinoIcons.plus_circle_fill, const Color(0xFFFF9500), '/sales/opportunities/new'),
      _QuickAction('Müşteriler', CupertinoIcons.person_2_fill, const Color(0xFF10B981), '/customers'),
      _QuickAction('Teklifler', CupertinoIcons.doc_fill, const Color(0xFF8B5CF6), '/sales/proposals'),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.0,
      ),
      itemCount: actions.length,
      itemBuilder: (context, index) {
        final action = actions[index];
        return _buildQuickActionCard(action);
      },
    );
  }

  Widget _buildQuickActionCard(_QuickAction action) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => context.go(action.route),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: action.color.withOpacity(0.15),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: action.color.withOpacity(0.08),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      action.color.withOpacity(0.15),
                      action.color.withOpacity(0.08),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(action.icon, color: action.color, size: 22),
              ),
              const SizedBox(height: 8),
              Text(
                action.label,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF000000),
                ),
                textAlign: TextAlign.center,
              ),
            ],
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
      color: const Color(0xFF3B82F6),
      child: opportunitiesAsync.when(
        data: (opportunities) {
          if (opportunities.isEmpty) {
            return _buildEmptyState('Henüz fırsat bulunmuyor', CupertinoIcons.star);
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: opportunities.length,
            itemBuilder: (context, index) {
              return _buildOpportunityItemCompact(opportunities[index]);
            },
          );
        },
        loading: () => const Center(child: CupertinoActivityIndicator()),
        error: (e, _) => _buildEmptyState('Fırsatlar yüklenemedi', CupertinoIcons.exclamationmark_triangle),
      ),
    );
  }

  Widget _buildPipelineTab(BuildContext context, AsyncValue<List<Opportunity>> opportunitiesAsync) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(opportunitiesProvider);
      },
      color: const Color(0xFF3B82F6),
      child: opportunitiesAsync.when(
        data: (opportunities) {
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
                const SizedBox(height: 12),
                _buildPipelineStage('Nitelikli', stages['qualified'] ?? [], const Color(0xFFFF9500)),
                const SizedBox(height: 12),
                _buildPipelineStage('Teklif', stages['proposal'] ?? [], const Color(0xFF9333EA)),
                const SizedBox(height: 12),
                _buildPipelineStage('Müzakere', stages['negotiation'] ?? [], const Color(0xFFEF4444)),
                const SizedBox(height: 12),
                _buildPipelineStage('Kazanıldı', stages['won'] ?? [], const Color(0xFF22C55E)),
              ],
            ),
          );
        },
        loading: () => const Center(child: CupertinoActivityIndicator()),
        error: (e, _) => _buildEmptyState('Pipeline yüklenemedi', CupertinoIcons.exclamationmark_triangle),
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
            padding: const EdgeInsets.all(12),
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
                        fontSize: 14,
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
                    fontSize: 13,
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
                  fontSize: 12,
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
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (opportunity.customerName != null)
                  Text(
                    opportunity.customerName!,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF8E8E93),
                    ),
                  ),
              ],
            ),
          ),
          Text(
            '₺${_formatNumber(opportunity.value ?? 0)}',
            style: TextStyle(
              fontSize: 12,
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
      children: List.generate(
        4,
        (index) => Expanded(
          child: Container(
            margin: EdgeInsets.only(left: index > 0 ? 10 : 0),
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: Colors.white.withOpacity(0.3),
                width: 1.5,
              ),
            ),
            child: const Center(
              child: CupertinoActivityIndicator(color: Colors.white),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingOpportunities() {
    return Column(
      children: List.generate(
        3,
        (index) => Container(
          margin: const EdgeInsets.only(bottom: 8),
          height: 60,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.withOpacity(0.1)),
          ),
          child: const Center(
            child: CupertinoActivityIndicator(),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, size: 40, color: Colors.grey[400]),
          const SizedBox(height: 12),
          Text(
            message,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
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

class _QuickAction {
  final String label;
  final IconData icon;
  final Color color;
  final String route;

  _QuickAction(this.label, this.icon, this.color, this.route);
}

