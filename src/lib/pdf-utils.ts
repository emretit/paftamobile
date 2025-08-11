import { toast } from 'sonner';
import { generatePdfWithPdfme } from './pdfme/generator';

/**
 * Playground gibi direkt PDF oluşturma ve indirme işlevi
 */
export async function generateAndDownloadPdf(template: any, inputs?: Record<string, any>, filename: string = 'document') {
  try {
    const pdf = await generatePdfWithPdfme(template, inputs);
    
    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Direkt indirme yap
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // URL'yi temizle
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    
    toast.success('PDF oluşturuldu ve indirildi');
    return true;
  } catch (error: any) {
    console.error('❌ PDF Generate hatası:', error);
    toast.error(`PDF oluşturulamadı: ${error?.message || 'Bilinmeyen hata'}`);
    return false;
  }
}

/**
 * PDF indirme işlevi
 */
export async function downloadPdf(template: any, inputs?: Record<string, any>, filename: string = 'document') {
  try {
    const pdf = await generatePdfWithPdfme(template, inputs);
    
    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    
    toast.success('PDF indirildi');
    return true;
  } catch (error: any) {
    console.error('❌ PDF Download hatası:', error);
    toast.error(`PDF indirilemedi: ${error?.message || 'Bilinmeyen hata'}`);
    return false;
  }
}

/**
 * Örnek veri oluşturucu
 */
export function generateSampleData(schema: any): Record<string, any> {
  const sampleInputs: Record<string, any> = {};
  
  if (Array.isArray(schema?.schemas) && schema.schemas[0]) {
    Object.entries(schema.schemas[0]).forEach(([field, cfg]: any) => {
      const type = cfg?.type || 'text';
      const fieldKey = String(field);
      
      if (type === 'table') {
        sampleInputs[fieldKey] = [
          ['Ürün/Hizmet', 'Miktar', 'Birim Fiyat', 'Toplam'],
          ['Örnek Hizmet', '1', '1.000,00', '1.000,00'],
          ['Örnek Ürün', '2', '500,00', '1.000,00']
        ];
      } else if (type === 'image' || fieldKey.toLowerCase().includes('logo')) {
        sampleInputs[fieldKey] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      } else if (type === 'checkbox') {
        sampleInputs[fieldKey] = true;
      } else {
        sampleInputs[fieldKey] = getDefaultSampleValue(fieldKey);
      }
    });
  }
  
  return sampleInputs;
}

function getDefaultSampleValue(field: string): string {
  const f = field.toLowerCase();
  
  if (f.includes('company') || f.includes('sirket')) return 'NGS TEKNOLOJİ';
  if (f.includes('title') || f.includes('baslik')) return 'TEKLİF FORMU';
  if (f.includes('name') || f.includes('musteri') || f.includes('customer')) return 'ÖRNEK MÜŞTERİ';
  if (f.includes('date') || f.includes('tarih')) return new Date().toLocaleDateString('tr-TR');
  if (f.includes('total') || f.includes('amount') || f.includes('tutar')) return '2.260,00 ₺';
  if (f.includes('number') || f.includes('no')) return 'TEK-2025-001';
  if (f.includes('email')) return 'ornek@firma.com';
  if (f.includes('phone') || f.includes('telefon')) return '+90 555 123 45 67';
  if (f.includes('address') || f.includes('adres')) return 'Örnek Mahallesi, Örnek Caddesi No:1, İstanbul';
  
  return `Örnek ${field}`;
}
