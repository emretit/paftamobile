/**
 * Template Field Standards - Teklifler için standart field isimlendirme rehberi
 * 
 * Bu dosya template oluştururken hangi field isimlerinin kullanılması gerektiğini belirtir.
 * Böylece her template'te aynı isimler kullanılır ve veri eşleştirmesi sorunsuz çalışır.
 */

export interface TemplateFieldStandard {
  fieldName: string;           // Önerilen field ismi
  alternativeNames: string[];  // Alternatif isimler
  dataType: 'text' | 'image' | 'table' | 'date' | 'number';
  category: string;           // Kategori
  description: string;        // Açıklama
  required: boolean;          // Zorunlu mu?
  example: string;           // Örnek değer
}

/**
 * TEKLİFLER İÇİN STANDART FIELD LİSTESİ
 * Bu field'lar her template'te bulunmalı
 */
export const PROPOSAL_FIELD_STANDARDS: TemplateFieldStandard[] = [
  // ============ TEKLİF BİLGİLERİ ============
  {
    fieldName: 'proposalNumber',
    alternativeNames: ['proposal_number', 'teklifNo', 'number', 'no'],
    dataType: 'text',
    category: 'Teklif Bilgileri',
    description: 'Teklif numarası - tablodaki "Teklif No" kolonu',
    required: true,
    example: 'TEK-2025-001'
  },
  {
    fieldName: 'proposalTitle',
    alternativeNames: ['proposal_title', 'teklifBaslik', 'title', 'baslik'],
    dataType: 'text',
    category: 'Teklif Bilgileri',
    description: 'Teklif başlığı - proposal.title alanı',
    required: true,
    example: 'Yazılım Geliştirme Hizmeti'
  },
  {
    fieldName: 'proposalDate',
    alternativeNames: ['proposal_date', 'teklifTarih', 'date', 'tarih'],
    dataType: 'date',
    category: 'Teklif Bilgileri',
    description: 'Teklif tarihi - tablodaki "Oluşturma Tarihi" kolonu',
    required: true,
    example: '15.01.2025'
  },
  {
    fieldName: 'proposalValidUntil',
    alternativeNames: ['valid_until', 'gecerlilik', 'validUntil', 'gecerli'],
    dataType: 'date',
    category: 'Teklif Bilgileri',
    description: 'Geçerlilik tarihi - tablodaki "Geçerlilik" kolonu',
    required: true,
    example: '15.02.2025'
  },
  {
    fieldName: 'proposalStatus',
    alternativeNames: ['proposal_status', 'durum', 'status'],
    dataType: 'text',
    category: 'Teklif Bilgileri',
    description: 'Teklif durumu - tablodaki "Durum" kolonu',
    required: false,
    example: 'Gönderildi'
  },

  // ============ MÜŞTERİ BİLGİLERİ ============
  {
    fieldName: 'customerName',
    alternativeNames: ['customer_name', 'musteriAd', 'musteri', 'customer'],
    dataType: 'text',
    category: 'Müşteri Bilgileri',
    description: 'Müşteri adı - tablodaki "Müşteri" kolonu',
    required: true,
    example: 'ABC Teknoloji'
  },
  {
    fieldName: 'customerCompany',
    alternativeNames: ['customer_company', 'musteriSirket', 'customerSirket'],
    dataType: 'text',
    category: 'Müşteri Bilgileri',
    description: 'Müşteri şirket adı',
    required: false,
    example: 'ABC Teknoloji Ltd. Şti.'
  },
  {
    fieldName: 'customerEmail',
    alternativeNames: ['customer_email', 'musteriEmail'],
    dataType: 'text',
    category: 'Müşteri Bilgileri',
    description: 'Müşteri e-mail adresi',
    required: false,
    example: 'info@abcteknoloji.com'
  },
  {
    fieldName: 'customerAddress',
    alternativeNames: ['customer_address', 'musteriAdres'],
    dataType: 'text',
    category: 'Müşteri Bilgileri',
    description: 'Müşteri adresi',
    required: false,
    example: 'İstanbul, Türkiye'
  },

  // ============ SATIŞ TEMSİLCİSİ ============
  {
    fieldName: 'employeeName',
    alternativeNames: ['employee_name', 'satisTemsilci', 'employee', 'temsilci'],
    dataType: 'text',
    category: 'Satış Temsilcisi',
    description: 'Satış temsilcisi adı - tablodaki "Satış Temsilcisi" kolonu',
    required: true,
    example: 'Mehmet Yılmaz'
  },
  {
    fieldName: 'employeeTitle',
    alternativeNames: ['employee_title', 'temsilciUnvan'],
    dataType: 'text',
    category: 'Satış Temsilcisi',
    description: 'Satış temsilcisi ünvanı',
    required: false,
    example: 'Satış Danışmanı'
  },
  {
    fieldName: 'employeeEmail',
    alternativeNames: ['employee_email', 'temsilciEmail'],
    dataType: 'text',
    category: 'Satış Temsilcisi',
    description: 'Satış temsilcisi e-mail',
    required: false,
    example: 'mehmet@ngsteknoloji.com'
  },

  // ============ FİNANSAL BİLGİLER ============
  {
    fieldName: 'totalAmount',
    alternativeNames: ['total_amount', 'genelToplam', 'toplam', 'total', 'tutar'],
    dataType: 'text',
    category: 'Finansal Bilgiler',
    description: 'Toplam tutar - tablodaki "Toplam Tutar" kolonu',
    required: true,
    example: '13.000,00 ₺'
  },
  {
    fieldName: 'subtotal',
    alternativeNames: ['ara_toplam', 'araToplam', 'subTotal'],
    dataType: 'text',
    category: 'Finansal Bilgiler',
    description: 'Ara toplam (KDV hariç)',
    required: false,
    example: '10.833,33 ₺'
  },
  {
    fieldName: 'taxAmount',
    alternativeNames: ['tax_amount', 'kdvTutar', 'kdv', 'vergi'],
    dataType: 'text',
    category: 'Finansal Bilgiler',
    description: 'KDV tutarı',
    required: false,
    example: '2.166,67 ₺'
  },
  {
    fieldName: 'currency',
    alternativeNames: ['para_birimi', 'paraBirimi', 'doviz'],
    dataType: 'text',
    category: 'Finansal Bilgiler',
    description: 'Para birimi',
    required: false,
    example: 'TRY'
  },

  // ============ ÜRÜN/HİZMET BİLGİLERİ ============
  {
    fieldName: 'itemsTable',
    alternativeNames: ['items_table', 'urunTablo', 'kalemler', 'items', 'products'],
    dataType: 'table',
    category: 'Ürün/Hizmet',
    description: 'Ürün/hizmet tablosu - proposal.items verilerinden',
    required: true,
    example: 'Tablo formatında ürün listesi'
  },
  {
    fieldName: 'itemCount',
    alternativeNames: ['item_count', 'kalemSayisi', 'urunSayisi'],
    dataType: 'text',
    category: 'Ürün/Hizmet',
    description: 'Toplam kalem sayısı',
    required: false,
    example: '3 kalem'
  },

  // ============ ŞİRKET BİLGİLERİ ============
  {
    fieldName: 'companyName',
    alternativeNames: ['company_name', 'sirketAd', 'sirket', 'company'],
    dataType: 'text',
    category: 'Şirket Bilgileri',
    description: 'Şirket adı (sabit)',
    required: true,
    example: 'NGS TEKNOLOJİ'
  },
  {
    fieldName: 'companyLogo',
    alternativeNames: ['company_logo', 'sirketLogo', 'logo'],
    dataType: 'image',
    category: 'Şirket Bilgileri',
    description: 'Şirket logosu',
    required: false,
    example: 'Logo resmi'
  },
  {
    fieldName: 'companyAddress',
    alternativeNames: ['company_address', 'sirketAdres', 'address'],
    dataType: 'text',
    category: 'Şirket Bilgileri',
    description: 'Şirket adresi',
    required: false,
    example: 'İstanbul, Türkiye'
  },

  // ============ ŞART VE KOŞULLAR ============
  {
    fieldName: 'paymentTerms',
    alternativeNames: ['payment_terms', 'odemeSart', 'odemeKosul'],
    dataType: 'text',
    category: 'Şartlar',
    description: 'Ödeme şartları',
    required: false,
    example: '30 gün vadeli'
  },
  {
    fieldName: 'deliveryTerms',
    alternativeNames: ['delivery_terms', 'teslimatSart', 'teslimat'],
    dataType: 'text',
    category: 'Şartlar',
    description: 'Teslimat şartları',
    required: false,
    example: '15 gün içinde'
  },
  {
    fieldName: 'warrantyTerms',
    alternativeNames: ['warranty_terms', 'garantiSart', 'garanti'],
    dataType: 'text',
    category: 'Şartlar',
    description: 'Garanti şartları',
    required: false,
    example: '1 yıl garanti'
  },

  // ============ EK BİLGİLER ============
  {
    fieldName: 'notes',
    alternativeNames: ['notlar', 'aciklama'],
    dataType: 'text',
    category: 'Ek Bilgiler',
    description: 'Genel notlar',
    required: false,
    example: 'Ek bilgiler...'
  },
  {
    fieldName: 'description',
    alternativeNames: ['aciklama', 'detay'],
    dataType: 'text',
    category: 'Ek Bilgiler',
    description: 'Teklif açıklaması',
    required: false,
    example: 'Detaylı açıklama...'
  }
];

/**
 * Kategorilere göre field'ları grupla
 */
export function getFieldsByCategory(): Record<string, TemplateFieldStandard[]> {
  return PROPOSAL_FIELD_STANDARDS.reduce((groups, field) => {
    if (!groups[field.category]) {
      groups[field.category] = [];
    }
    groups[field.category].push(field);
    return groups;
  }, {} as Record<string, TemplateFieldStandard[]>);
}

/**
 * Zorunlu field'ları getir
 */
export function getRequiredFields(): TemplateFieldStandard[] {
  return PROPOSAL_FIELD_STANDARDS.filter(field => field.required);
}

/**
 * Field ismine göre standard'ı bul
 */
export function findFieldStandard(fieldName: string): TemplateFieldStandard | null {
  const lowerFieldName = fieldName.toLowerCase();
  
  return PROPOSAL_FIELD_STANDARDS.find(standard => 
    standard.fieldName.toLowerCase() === lowerFieldName ||
    standard.alternativeNames.some(alt => alt.toLowerCase() === lowerFieldName)
  ) || null;
}

/**
 * Template field coverage analizi
 */
export function analyzeTemplateCoverage(templateFields: string[]): {
  coverage: number;
  missingRequired: TemplateFieldStandard[];
  matchedFields: { field: string; standard: TemplateFieldStandard }[];
  unmatchedFields: string[];
} {
  const requiredFields = getRequiredFields();
  const matchedFields: { field: string; standard: TemplateFieldStandard }[] = [];
  const unmatchedFields: string[] = [];
  
  // Her template field'ını kontrol et
  templateFields.forEach(field => {
    const standard = findFieldStandard(field);
    if (standard) {
      matchedFields.push({ field, standard });
    } else {
      unmatchedFields.push(field);
    }
  });
  
  // Eksik zorunlu field'ları bul
  const matchedStandards = matchedFields.map(m => m.standard);
  const missingRequired = requiredFields.filter(req => 
    !matchedStandards.some(matched => matched.fieldName === req.fieldName)
  );
  
  // Coverage hesapla
  const coverage = Math.round((matchedFields.length / PROPOSAL_FIELD_STANDARDS.length) * 100);
  
  return {
    coverage,
    missingRequired,
    matchedFields,
    unmatchedFields
  };
}

/**
 * Template oluşturma rehberi
 */
export const TEMPLATE_CREATION_GUIDE = {
  title: "Template Oluşturma Rehberi",
  description: "Teklifler için template oluştururken bu field isimlerini kullanın",
  categories: getFieldsByCategory(),
  examples: {
    minimal: [
      'proposalNumber', 'proposalTitle', 'proposalDate', 
      'customerName', 'employeeName', 'totalAmount', 'itemsTable'
    ],
    standard: [
      'proposalNumber', 'proposalTitle', 'proposalDate', 'proposalValidUntil',
      'companyName', 'companyLogo',
      'customerName', 'customerCompany', 
      'employeeName', 'employeeTitle',
      'itemsTable', 'subtotal', 'taxAmount', 'totalAmount',
      'paymentTerms'
    ],
    detailed: PROPOSAL_FIELD_STANDARDS.map(field => field.fieldName)
  }
};

export default PROPOSAL_FIELD_STANDARDS;
