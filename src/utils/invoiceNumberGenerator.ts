import { supabase } from "@/integrations/supabase/client";

/**
 * Fatura seri numarası oluşturucu
 * Format: 3 harf + yıl + 4 haneli numara (örn: FAT20250001)
 */
export async function generateInvoiceNumber(companyId: string): Promise<string> {
  try {
    // Mevcut en yüksek fatura numarasını bul
    const { data: lastInvoice, error } = await supabase
      .from('sales_invoices')
      .select('fatura_no')
      .eq('company_id', companyId)
      .not('fatura_no', 'is', null)
      .neq('fatura_no', '')
      .order('fatura_no', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    const currentYear = new Date().getFullYear().toString();
    const prefix = 'FAT'; // 3 harf prefix
    const yearPrefix = `${prefix}${currentYear}`;
    
    let nextNumber = 1;

    if (lastInvoice?.fatura_no) {
      // Mevcut fatura numarasından sonraki numarayı hesapla
      const lastNumber = extractNumberFromInvoiceNumber(lastInvoice.fatura_no, yearPrefix);
      if (lastNumber > 0) {
        nextNumber = lastNumber + 1;
      }
    }

    // 4 haneli numara formatında oluştur
    const paddedNumber = nextNumber.toString().padStart(4, '0');
    return `${yearPrefix}${paddedNumber}`;

  } catch (error) {
    console.error('Fatura numarası oluşturulurken hata:', error);
    // Hata durumunda varsayılan numara döndür
    const currentYear = new Date().getFullYear().toString();
    return `FAT${currentYear}0001`;
  }
}

/**
 * Fatura numarasından sayıyı çıkarır
 * Örnek: "FAT20250001" -> 1
 */
function extractNumberFromInvoiceNumber(invoiceNumber: string, yearPrefix: string): number {
  try {
    if (invoiceNumber.startsWith(yearPrefix)) {
      const numberPart = invoiceNumber.substring(yearPrefix.length);
      return parseInt(numberPart, 10) || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Fatura numarasının geçerli olup olmadığını kontrol eder
 */
export function isValidInvoiceNumber(invoiceNumber: string): boolean {
  const pattern = /^FAT\d{4}\d{4}$/; // FAT + 4 haneli yıl + 4 haneli numara
  return pattern.test(invoiceNumber);
}

/**
 * Fatura numarasından yılı çıkarır
 */
export function extractYearFromInvoiceNumber(invoiceNumber: string): number | null {
  try {
    const match = invoiceNumber.match(/^FAT(\d{4})/);
    return match ? parseInt(match[1], 10) : null;
  } catch {
    return null;
  }
}
