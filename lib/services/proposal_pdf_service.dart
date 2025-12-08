import 'dart:convert';
import 'dart:typed_data';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/proposal.dart';

class ProposalPdfService {
  // Web uygulamasındaki PDF renderer'ı kullanarak PDF oluştur
  Future<Uint8List> generateProposalPdfFromWeb(Proposal proposal, {String? templateId}) async {
    try {
      final supabase = Supabase.instance.client;
      
      // Get current session
      final session = supabase.auth.currentSession;
      if (session == null) {
        throw Exception('Kullanıcı oturumu bulunamadı');
      }

      // Call Edge Function
      final response = await supabase.functions.invoke(
        'generate-proposal-pdf',
        body: {
          'proposalId': proposal.id,
          if (templateId != null) 'templateId': templateId,
        },
        headers: {
          'Authorization': 'Bearer ${session.accessToken}',
        },
      );

      if (response.status != 200) {
        final errorData = response.data as Map<String, dynamic>?;
        throw Exception(errorData?['error'] ?? 'PDF oluşturulamadı');
      }

      final responseData = response.data as Map<String, dynamic>;
      if (responseData['success'] != true) {
        throw Exception(responseData['error'] ?? 'PDF oluşturulamadı');
      }

      // Decode base64 PDF data
      final pdfBase64 = responseData['pdfData'] as String;
      final pdfBytes = base64Decode(pdfBase64);

      return pdfBytes;
    } catch (e) {
      print('Web PDF generation error: $e');
      rethrow;
    }
  }

  // PDF'i görüntüle ve paylaş
  Future<void> previewAndShare(Uint8List pdfBytes, String fileName) async {
    await Printing.layoutPdf(
      onLayout: (format) async => pdfBytes,
    );
  }

  // PDF'i paylaş
  Future<void> sharePdf(Uint8List pdfBytes, String fileName) async {
    await Printing.sharePdf(
      bytes: pdfBytes,
      filename: fileName,
    );
  }
}
