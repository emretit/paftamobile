import { toast } from 'sonner';
import { generatePdfWithPdfme } from './pdfme/generator';

/**
 * PDF oluşturup yeni sekmede açma işlevi - tarayıcının kendi kaydet butonu ile indirme
 */
export async function generateAndDownloadPdf(template: any, inputs?: Record<string, any>, filename: string = 'document') {
  try {
    const pdf = await generatePdfWithPdfme(template, inputs);
    
    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Yeni sekmede aç - indirme yapmak yerine
    const win = window.open(url, '_blank');
    if (!win) {
      // Popup engellenirse fallback olarak indirme yap
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('PDF indirildi (popup engellendi)');
    } else {
      toast.success('PDF yeni sekmede açıldı');
    }
    
    // URL'yi temizle
    setTimeout(() => URL.revokeObjectURL(url), 30000); // Daha uzun süre tut
    
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
        // Template'teki mevcut image data'sını kullan
        if (cfg?.content && cfg.content !== '') {
          console.log(`🖼️ Template'te mevcut image bulundu: ${fieldKey}`, cfg.content.substring(0, 50) + '...');
          sampleInputs[fieldKey] = cfg.content; // Mevcut image'i kullan
        } else if (cfg?.src && cfg.src !== '') {
          console.log(`🖼️ Template'te src image bulundu: ${fieldKey}`, cfg.src.substring(0, 50) + '...');
          sampleInputs[fieldKey] = cfg.src; // src'deki image'i kullan
        } else {
          console.log(`⚠️ Image bulunamadı, placeholder kullanılıyor: ${fieldKey}`);
          // Daha görünür bir placeholder logo
          sampleInputs[fieldKey] = createPlaceholderLogo();
        }
      } else if (type === 'checkbox') {
        sampleInputs[fieldKey] = true;
      } else {
        sampleInputs[fieldKey] = getDefaultSampleValue(fieldKey);
      }
    });
  }
  
  return sampleInputs;
}

/**
 * Görünür placeholder logo oluştur
 */
function createPlaceholderLogo(): string {
  // SVG tabanlı daha büyük ve görünür logo
  const svg = `<svg width="100" height="50" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="50" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
    <text x="50" y="30" text-anchor="middle" fill="#666" font-size="12" font-family="Arial">LOGO</text>
  </svg>`;
  
  // SVG'yi base64'e çevir
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
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
