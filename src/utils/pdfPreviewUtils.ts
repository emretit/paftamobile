import { toast } from 'sonner';

/**
 * Generates sample input data for PDF templates based on the provided schemas
 * @param schemas - The PDFme template schemas
 * @returns Object with sample data for each field
 */
export function generateSampleInputs(schemas: any): Record<string, any> {
  console.log('🔍 Schemas received:', schemas);
  
  const sampleInputs: Record<string, any> = {};

  try {
    // PDFme şemalarını işle - schemas bir array of objects olmalı
    if (schemas && Array.isArray(schemas)) {
      // Her sayfa için şemaları işle
      schemas.forEach((pageSchema, pageIndex) => {
        console.log(`📄 Sayfa ${pageIndex} şeması:`, pageSchema);
        
        if (pageSchema && typeof pageSchema === 'object') {
          // Her sayfadaki alanları işle
          Object.keys(pageSchema).forEach(fieldName => {
            const fieldConfig = pageSchema[fieldName];
            console.log(`🔧 Alan işleniyor: ${fieldName}`, fieldConfig);
            
            if (fieldConfig && typeof fieldConfig === 'object') {
              generateFieldSampleData(fieldName, fieldConfig, sampleInputs);
            }
          });
        }
      });
    } else if (schemas && typeof schemas === 'object') {
      // Eğer schemas direkt bir object ise
      Object.keys(schemas).forEach(fieldName => {
        const fieldConfig = schemas[fieldName];
        console.log(`🔧 Alan işleniyor: ${fieldName}`, fieldConfig);
        
        if (fieldConfig && typeof fieldConfig === 'object') {
          generateFieldSampleData(fieldName, fieldConfig, sampleInputs);
        }
      });
    }

    // Eksik önemli alanlar için fallback'ler ekle
    addFallbackSampleData(sampleInputs);

  } catch (error) {
    console.error('❌ Schema işleme hatası:', error);
    // Hata durumunda temel örnek veriler oluştur
    sampleInputs['logo'] = generateImagePlaceholder();
    sampleInputs['companyName'] = 'ABC Teknoloji A.Ş.';
    sampleInputs['title'] = 'Örnek Teklif';
    sampleInputs['customerName'] = 'Örnek Müşteri';
    sampleInputs['date'] = new Date().toLocaleDateString('tr-TR');
    sampleInputs['total'] = '15,750.00 ₺';
  }

  console.log('✅ Örnek veriler hazırlandı:', Object.keys(sampleInputs));
  console.log('📊 Sample inputs:', sampleInputs);
  return sampleInputs;
}

/**
 * Generates sample data for a specific field based on its configuration
 */
function generateFieldSampleData(fieldName: string, fieldConfig: any, sampleInputs: Record<string, any>) {
  // Alan türünü belirle - PDFme'de type veya schema property'si kullanılır
  const fieldType = fieldConfig.type || fieldConfig.schema || 'text';
  
  console.log(`🎯 Alan: ${fieldName}, Tür: ${fieldType}`, fieldConfig);

  // Alan türüne göre örnek veri üret
  switch (fieldType) {
    case 'text':
      sampleInputs[fieldName] = generateTextSampleData(fieldName);
      break;

    case 'image':
      sampleInputs[fieldName] = generateImagePlaceholder();
      break;

    case 'signature':
      sampleInputs[fieldName] = generateSignaturePlaceholder();
      break;

    case 'table':
      sampleInputs[fieldName] = generateTableSampleData();
      break;

    case 'line':
      sampleInputs[fieldName] = '';
      break;

    case 'rectangle':
    case 'ellipse':
      sampleInputs[fieldName] = '';
      break;
          
    default:
      // Bilinmeyen türler için field adına göre tahmin et
      if (fieldName.toLowerCase().includes('logo') || 
          fieldName.toLowerCase().includes('image') || 
          fieldName.toLowerCase().includes('resim')) {
        sampleInputs[fieldName] = generateImagePlaceholder();
      } else if (fieldName.toLowerCase().includes('signature') || 
                 fieldName.toLowerCase().includes('imza')) {
        sampleInputs[fieldName] = generateSignaturePlaceholder();
      } else if (fieldName.toLowerCase().includes('table') || 
                 fieldName.toLowerCase().includes('tablo')) {
        sampleInputs[fieldName] = generateTableSampleData();
      } else {
        sampleInputs[fieldName] = generateTextSampleData(fieldName);
      }
      break;
  }
}

/**
 * Generates text sample data based on field name
 */
function generateTextSampleData(fieldName: string): string {
  const lowerFieldName = fieldName.toLowerCase();
  
  if (lowerFieldName.includes('company') || lowerFieldName.includes('şirket')) {
    return 'ABC Teknoloji A.Ş.';
  } else if (lowerFieldName.includes('title') || lowerFieldName.includes('başlık')) {
    return 'Profesyonel Hizmet Teklifi';
  } else if (lowerFieldName.includes('customer') || lowerFieldName.includes('müşteri')) {
    return 'XYZ İnşaat Ltd. Şti.';
  } else if (lowerFieldName.includes('date') || lowerFieldName.includes('tarih')) {
    return new Date().toLocaleDateString('tr-TR');
  } else if (lowerFieldName.includes('amount') || lowerFieldName.includes('total') || lowerFieldName.includes('tutar')) {
    return '15,750.00 ₺';
  } else if (lowerFieldName.includes('address') || lowerFieldName.includes('adres')) {
    return 'Atatürk Mah. İstiklal Cad. No:45 Şişli/İstanbul';
  } else if (lowerFieldName.includes('phone') || lowerFieldName.includes('telefon')) {
    return '+90 (212) 555 01 23';
  } else if (lowerFieldName.includes('email') || lowerFieldName.includes('eposta')) {
    return 'info@abcteknoloji.com';
  } else if (lowerFieldName.includes('tax') || lowerFieldName.includes('vergi')) {
    return '1234567890';
  } else if (lowerFieldName.includes('description') || lowerFieldName.includes('açıklama')) {
    return 'Bu teklif 30 gün süreyle geçerlidir ve tüm malzeme dahildir.';
  } else {
    return `${fieldName} örnek değeri`;
  }
}

/**
 * Generates a placeholder image as base64
 */
function generateImagePlaceholder(): string {
  // 100x100 piksel şeffaf PNG
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}

/**
 * Generates a signature placeholder
 */
function generateSignaturePlaceholder(): string {
  // Signature için özel placeholder veya boş string
  return generateImagePlaceholder();
}

/**
 * Generates sample table data
 */
function generateTableSampleData(): string[][] {
  return [
    ['Hizmet/Ürün', 'Miktar', 'Birim Fiyat', 'Toplam'],
    ['Web Tasarım Hizmeti', '1 adet', '8,000.00 ₺', '8,000.00 ₺'],
    ['SEO Optimizasyonu', '3 ay', '1,500.00 ₺', '4,500.00 ₺'],
    ['Hosting Hizmeti', '12 ay', '250.00 ₺', '3,000.00 ₺'],
    ['SSL Sertifikası', '1 adet', '250.00 ₺', '250.00 ₺']
  ];
}

/**
 * Adds fallback sample data for common missing fields
 */
function addFallbackSampleData(sampleInputs: Record<string, any>) {
  // Yaygın field isimleri için fallback'ler
  const commonFields = {
    'logo': generateImagePlaceholder(),
    'companyLogo': generateImagePlaceholder(),
    'signature': generateSignaturePlaceholder(),
    'customerSignature': generateSignaturePlaceholder(),
    'companyName': 'ABC Teknoloji A.Ş.',
    'customerName': 'XYZ İnşaat Ltd. Şti.',
    'proposalTitle': 'Profesyonel Hizmet Teklifi',
    'date': new Date().toLocaleDateString('tr-TR'),
    'validUntil': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
    'totalAmount': '15,750.00 ₺',
    'subtotal': '13,125.00 ₺',
    'tax': '2,625.00 ₺',
    'companyAddress': 'Atatürk Mah. İstiklal Cad. No:45 Şişli/İstanbul',
    'companyPhone': '+90 (212) 555 01 23',
    'companyEmail': 'info@abcteknoloji.com',
    'proposalItems': generateTableSampleData()
  };

  // Eksik alanları ekle
  Object.keys(commonFields).forEach(fieldName => {
    if (!(fieldName in sampleInputs)) {
      sampleInputs[fieldName] = commonFields[fieldName];
    }
  });
}

/**
 * PDFme template'i önizleme için generate eder ve yeni sekmede açar
 */
export const generatePDFPreview = async (template: any, templateName?: string) => {
  try {
    console.log('🎯 PDF Preview başlatılıyor...', templateName || 'Template');
    console.log('📋 Input template:', template);
    
    if (!template) {
      throw new Error('Template is null or undefined');
    }
    
    // PDFme modüllerini yükle
    console.log('📦 PDFme modülleri import ediliyor...');
    const { generate } = await import('@pdfme/generator');
    const { text, image, barcodes, line, rectangle, ellipse, table, checkbox, radioGroup, select, multiVariableText, dateTime } = await import('@pdfme/schemas');
    const { BLANK_PDF } = await import('@pdfme/common');
    
    console.log('✅ PDFme modülleri başarıyla yüklendi');

    // Template hazırla
    const preparedTemplate: any = JSON.parse(JSON.stringify(template));
    if (preparedTemplate && preparedTemplate.basePdf === 'BLANK_PDF') {
      console.log('📄 basePdf string\'i gerçek BLANK_PDF ile değiştiriliyor');
      preparedTemplate.basePdf = BLANK_PDF;
    }

    // Örnek veriler oluştur
    const sampleInputs = generateSampleInputs(preparedTemplate.schemas);
    console.log('📊 Örnek veriler hazırlandı:', Object.keys(sampleInputs));

    toast.info('PDF önizlemesi oluşturuluyor...');

    // PDF oluştur
    const pdf = await generate({
      template: preparedTemplate,
      inputs: [sampleInputs],
      plugins: {
        text,
        image,
        qrcode: barcodes.qrcode,
        ean13: barcodes.ean13,
        japanpost: barcodes.japanpost,
        line,
        rectangle,
        ellipse,
        table,
        checkbox,
        radioGroup,
        select,
        multiVariableText,
        dateTime,
      } as any,
    });

    console.log('✅ PDF oluşturuldu! Boyut:', pdf.buffer.byteLength, 'bytes');

    // PDF'i yeni sekmede aç
    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    console.log('🚀 PDF yeni sekmede açılıyor...');
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      console.warn('⚠️ Popup engellendi, indirme alternatifi sunuluyor');
      toast.error('Popup engellendi. PDF indiriliyor...');
      
      // Alternatif: Download linki
      const link = document.createElement('a');
      link.href = url;
      link.download = `${templateName || 'template'}-onizleme-${Date.now()}.pdf`;
      link.click();
      toast.success('PDF indirildi!');
    } else {
      toast.success('PDF önizlemesi oluşturuldu! 🎉');
    }
    
    // URL'i temizle
    setTimeout(() => {
      URL.revokeObjectURL(url);
      console.log('🧹 URL temizlendi');
    }, 10000);

  } catch (error: any) {
    console.error('❌ PDF Preview hatası:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      template: templateName
    });
    toast.error(`Önizleme oluşturulamadı: ${error?.message || 'Bilinmeyen hata'}`);
    throw error;
  }
};
