import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/order.dart';
import '../models/invoice.dart';
import '../models/proposal.dart';
import '../models/opportunity.dart';

class SalesService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Satış siparişlerini getir
  Future<List<Order>> getSalesOrders({String? companyId}) async {
    try {
      dynamic query = _supabase
          .from('orders')
          .select('*')
          .order('created_at', ascending: false);

      if (companyId != null) {
        query = query.eq('company_id', companyId);
      }

      final response = await query;
      return (response as List).map((json) => Order.fromJson(json)).toList();
    } catch (e) {
      print('Satış siparişleri getirme hatası: $e');
      throw Exception('Satış siparişleri getirilemedi: $e');
    }
  }

  // Satış faturalarını getir
  Future<List<Invoice>> getSalesInvoices({String? companyId}) async {
    try {
      dynamic query = _supabase
          .from('sales_invoices')
          .select('*')
          .order('created_at', ascending: false);

      if (companyId != null) {
        query = query.eq('company_id', companyId);
      }

      final response = await query;
      return (response as List).map((json) => Invoice.fromJson(json)).toList();
    } catch (e) {
      print('Satış faturaları getirme hatası: $e');
      throw Exception('Satış faturaları getirilemedi: $e');
    }
  }

  // Teklifleri getir
  Future<List<Proposal>> getProposals({String? companyId}) async {
    try {
      dynamic query = _supabase
          .from('proposals')
          .select('*')
          .order('created_at', ascending: false);

      if (companyId != null) {
        query = query.eq('company_id', companyId);
      }

      final response = await query;
      return (response as List).map((json) => Proposal.fromJson(json)).toList();
    } catch (e) {
      print('Teklifler getirme hatası: $e');
      throw Exception('Teklifler getirilemedi: $e');
    }
  }

  // Fırsatları getir
  Future<List<Opportunity>> getOpportunities({String? companyId}) async {
    try {
      dynamic query = _supabase
          .from('opportunities')
          .select('*')
          .order('created_at', ascending: false);

      if (companyId != null) {
        query = query.eq('company_id', companyId);
      }

      final response = await query;
      return (response as List).map((json) => Opportunity.fromJson(json)).toList();
    } catch (e) {
      print('Fırsatlar getirme hatası: $e');
      throw Exception('Fırsatlar getirilemedi: $e');
    }
  }
}

