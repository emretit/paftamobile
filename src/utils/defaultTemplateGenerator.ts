import { PROPOSAL_FIELD_STANDARDS } from './templateFieldStandards';

/**
 * Yeni şablon oluştururken kullanılacak varsayılan template yapısı
 */

export interface DefaultTemplateConfig {
  includeAll?: boolean;        // Tüm field'ları dahil et
  templateType: 'minimal' | 'standard' | 'detailed';
  pageSize?: 'A4' | 'A3' | 'Letter';
}

/**
 * Template türüne göre veritabanı kategorisi döndür
 */
export function getTemplateCategory(templateType: 'minimal' | 'standard' | 'detailed'): string {
  // Veritabanı constraint'ine uygun olarak 'general' kullan
  return 'general';
}

/**
 * Template türüne göre veritabanı template_type döndür
 */
export function getTemplateType(): string {
  // Veritabanı constraint'ine uygun olarak 'proposal' kullan
  return 'proposal';
}

/**
 * Zorunlu field'ları içeren minimal template oluştur
 */
export function generateMinimalTemplate(): any {
  const requiredFields = PROPOSAL_FIELD_STANDARDS.filter(field => field.required);
  
  return {
    basePdf: "BLANK_PDF",
    schemas: [
      [
        // Teklif başlık bilgileri (sol üst)
        {
          name: "proposalNumber",
          type: "text",
          position: { x: 20, y: 20 },
          width: 80,
          height: 8,
          fontSize: 12,
          fontColor: "#333333"
        },
        {
          name: "proposalTitle",
          type: "text", 
          position: { x: 20, y: 35 },
          width: 200,
          height: 12,
          fontSize: 18,
          fontWeight: "bold",
          fontColor: "#000000"
        },
        {
          name: "proposalDate",
          type: "text",
          position: { x: 20, y: 55 },
          width: 80,
          height: 8,
          fontSize: 10,
          fontColor: "#666666"
        },

        // Şirket bilgileri (sağ üst)
        {
          name: "companyName",
          type: "text",
          position: { x: 350, y: 20 },
          width: 120,
          height: 12,
          fontSize: 14,
          fontWeight: "bold",
          fontColor: "#000000"
        },

        // Müşteri bilgileri (sol orta)
        {
          name: "customerName",
          type: "text",
          position: { x: 20, y: 85 },
          width: 150,
          height: 10,
          fontSize: 12,
          fontColor: "#000000"
        },

        // Satış temsilcisi (sağ orta)
        {
          name: "employeeName",
          type: "text",
          position: { x: 350, y: 85 },
          width: 120,
          height: 10,
          fontSize: 12,
          fontColor: "#000000"
        },

        // Ürün tablosu (orta)
        {
          name: "itemsTable",
          type: "table",
          position: { x: 20, y: 130 },
          width: 450,
          height: 200,
          borderWidth: 1,
          borderColor: "#cccccc"
        },

        // Toplam tutar (sağ alt)
        {
          name: "totalAmount",
          type: "text",
          position: { x: 350, y: 350 },
          width: 120,
          height: 12,
          fontSize: 16,
          fontWeight: "bold",
          fontColor: "#000000"
        },

        // Geçerlilik tarihi (sol alt)
        {
          name: "proposalValidUntil",
          type: "text",
          position: { x: 20, y: 380 },
          width: 150,
          height: 8,
          fontSize: 10,
          fontColor: "#666666"
        }
      ]
    ]
  };
}

/**
 * Standart field'ları içeren template oluştur
 */
export function generateStandardTemplate(): any {
  return {
    basePdf: "BLANK_PDF",
    schemas: [
      [
        // Teklif başlık bilgileri
        {
          name: "proposalNumber",
          type: "text",
          position: { x: 20, y: 20 },
          width: 80,
          height: 8,
          fontSize: 12
        },
        {
          name: "proposalTitle",
          type: "text",
          position: { x: 20, y: 35 },
          width: 200,
          height: 12,
          fontSize: 18,
          fontWeight: "bold"
        },
        {
          name: "proposalDate",
          type: "text",
          position: { x: 20, y: 55 },
          width: 80,
          height: 8,
          fontSize: 10
        },
        {
          name: "proposalValidUntil",
          type: "text",
          position: { x: 120, y: 55 },
          width: 80,
          height: 8,
          fontSize: 10
        },

        // Şirket bilgileri
        {
          name: "companyName",
          type: "text",
          position: { x: 350, y: 20 },
          width: 120,
          height: 12,
          fontSize: 14,
          fontWeight: "bold"
        },
        {
          name: "companyAddress",
          type: "text",
          position: { x: 350, y: 40 },
          width: 120,
          height: 20,
          fontSize: 9
        },

        // Müşteri bilgileri
        {
          name: "customerName",
          type: "text",
          position: { x: 20, y: 85 },
          width: 150,
          height: 10,
          fontSize: 12,
          fontWeight: "bold"
        },
        {
          name: "customerCompany",
          type: "text",
          position: { x: 20, y: 100 },
          width: 150,
          height: 8,
          fontSize: 10
        },
        {
          name: "customerAddress",
          type: "text",
          position: { x: 20, y: 115 },
          width: 150,
          height: 15,
          fontSize: 9
        },

        // Satış temsilcisi
        {
          name: "employeeName",
          type: "text",
          position: { x: 350, y: 85 },
          width: 120,
          height: 10,
          fontSize: 12,
          fontWeight: "bold"
        },
        {
          name: "employeeTitle",
          type: "text",
          position: { x: 350, y: 100 },
          width: 120,
          height: 8,
          fontSize: 10
        },
        {
          name: "employeeEmail",
          type: "text",
          position: { x: 350, y: 115 },
          width: 120,
          height: 8,
          fontSize: 9
        },

        // Ürün tablosu
        {
          name: "itemsTable",
          type: "table",
          position: { x: 20, y: 150 },
          width: 450,
          height: 180
        },

        // Finansal bilgiler
        {
          name: "subtotal",
          type: "text",
          position: { x: 350, y: 350 },
          width: 120,
          height: 10,
          fontSize: 12
        },
        {
          name: "taxAmount",
          type: "text",
          position: { x: 350, y: 365 },
          width: 120,
          height: 10,
          fontSize: 12
        },
        {
          name: "totalAmount",
          type: "text",
          position: { x: 350, y: 385 },
          width: 120,
          height: 12,
          fontSize: 16,
          fontWeight: "bold"
        },

        // Şartlar
        {
          name: "paymentTerms",
          type: "text",
          position: { x: 20, y: 420 },
          width: 450,
          height: 15,
          fontSize: 9
        },
        {
          name: "deliveryTerms",
          type: "text",
          position: { x: 20, y: 440 },
          width: 450,
          height: 15,
          fontSize: 9
        }
      ]
    ]
  };
}

/**
 * Tüm field'ları içeren detaylı template oluştur
 */
export function generateDetailedTemplate(): any {
  return {
    basePdf: "BLANK_PDF",
    schemas: [
      [
        // Şirket logosu
        {
          name: "companyLogo",
          type: "image",
          position: { x: 400, y: 10 },
          width: 70,
          height: 35
        },

        // Teklif başlık bilgileri
        {
          name: "proposalNumber",
          type: "text",
          position: { x: 20, y: 20 },
          width: 80,
          height: 8,
          fontSize: 12
        },
        {
          name: "proposalTitle",
          type: "text",
          position: { x: 20, y: 35 },
          width: 200,
          height: 12,
          fontSize: 18,
          fontWeight: "bold"
        },
        {
          name: "proposalDate",
          type: "text",
          position: { x: 20, y: 55 },
          width: 80,
          height: 8,
          fontSize: 10
        },
        {
          name: "proposalValidUntil",
          type: "text",
          position: { x: 120, y: 55 },
          width: 80,
          height: 8,
          fontSize: 10
        },
        {
          name: "proposalStatus",
          type: "text",
          position: { x: 220, y: 55 },
          width: 80,
          height: 8,
          fontSize: 10
        },

        // Şirket bilgileri
        {
          name: "companyName",
          type: "text",
          position: { x: 320, y: 50 },
          width: 150,
          height: 12,
          fontSize: 14,
          fontWeight: "bold"
        },
        {
          name: "companyAddress",
          type: "text",
          position: { x: 320, y: 65 },
          width: 150,
          height: 20,
          fontSize: 9
        },
        {
          name: "companyPhone",
          type: "text",
          position: { x: 320, y: 90 },
          width: 150,
          height: 8,
          fontSize: 9
        },
        {
          name: "companyEmail",
          type: "text",
          position: { x: 320, y: 100 },
          width: 150,
          height: 8,
          fontSize: 9
        },

        // Müşteri bilgileri
        {
          name: "customerName",
          type: "text",
          position: { x: 20, y: 85 },
          width: 150,
          height: 10,
          fontSize: 12,
          fontWeight: "bold"
        },
        {
          name: "customerCompany",
          type: "text",
          position: { x: 20, y: 100 },
          width: 150,
          height: 8,
          fontSize: 10
        },
        {
          name: "customerEmail",
          type: "text",
          position: { x: 20, y: 115 },
          width: 150,
          height: 8,
          fontSize: 9
        },
        {
          name: "customerPhone",
          type: "text",
          position: { x: 20, y: 125 },
          width: 150,
          height: 8,
          fontSize: 9
        },
        {
          name: "customerAddress",
          type: "text",
          position: { x: 20, y: 135 },
          width: 150,
          height: 20,
          fontSize: 9
        },

        // Satış temsilcisi
        {
          name: "employeeName",
          type: "text",
          position: { x: 180, y: 85 },
          width: 120,
          height: 10,
          fontSize: 12,
          fontWeight: "bold"
        },
        {
          name: "employeeTitle",
          type: "text",
          position: { x: 180, y: 100 },
          width: 120,
          height: 8,
          fontSize: 10
        },
        {
          name: "employeeEmail",
          type: "text",
          position: { x: 180, y: 115 },
          width: 120,
          height: 8,
          fontSize: 9
        },
        {
          name: "employeePhone",
          type: "text",
          position: { x: 180, y: 125 },
          width: 120,
          height: 8,
          fontSize: 9
        },

        // Ürün tablosu
        {
          name: "itemsTable",
          type: "table",
          position: { x: 20, y: 170 },
          width: 450,
          height: 150
        },

        // Kalem sayısı
        {
          name: "itemCount",
          type: "text",
          position: { x: 20, y: 330 },
          width: 100,
          height: 8,
          fontSize: 9
        },

        // Finansal bilgiler
        {
          name: "subtotal",
          type: "text",
          position: { x: 350, y: 340 },
          width: 120,
          height: 10,
          fontSize: 12
        },
        {
          name: "taxAmount",
          type: "text",
          position: { x: 350, y: 355 },
          width: 120,
          height: 10,
          fontSize: 12
        },
        {
          name: "totalAmount",
          type: "text",
          position: { x: 350, y: 375 },
          width: 120,
          height: 12,
          fontSize: 16,
          fontWeight: "bold"
        },
        {
          name: "currency",
          type: "text",
          position: { x: 430, y: 375 },
          width: 40,
          height: 8,
          fontSize: 10
        },

        // Şartlar
        {
          name: "paymentTerms",
          type: "text",
          position: { x: 20, y: 410 },
          width: 450,
          height: 15,
          fontSize: 9
        },
        {
          name: "deliveryTerms",
          type: "text",
          position: { x: 20, y: 430 },
          width: 450,
          height: 15,
          fontSize: 9
        },
        {
          name: "warrantyTerms",
          type: "text",
          position: { x: 20, y: 450 },
          width: 450,
          height: 15,
          fontSize: 9
        },

        // Notlar
        {
          name: "notes",
          type: "text",
          position: { x: 20, y: 480 },
          width: 450,
          height: 30,
          fontSize: 9
        },
        {
          name: "description",
          type: "text",
          position: { x: 20, y: 520 },
          width: 450,
          height: 20,
          fontSize: 9
        }
      ]
    ]
  };
}

/**
 * Template türüne göre varsayılan template oluştur
 */
export function generateDefaultTemplate(config: DefaultTemplateConfig): any {
  switch (config.templateType) {
    case 'minimal':
      return generateMinimalTemplate();
    case 'standard':
      return generateStandardTemplate();
    case 'detailed':
      return generateDetailedTemplate();
    default:
      return generateMinimalTemplate();
  }
}

/**
 * Yeni şablon oluşturma rehberi
 */
export const NEW_TEMPLATE_GUIDE = {
  minimal: {
    name: "Minimal Şablon",
    description: "Sadece zorunlu alanları içerir",
    fields: ["proposalNumber", "proposalTitle", "proposalDate", "customerName", "employeeName", "totalAmount", "itemsTable", "proposalValidUntil"],
    estimatedTime: "2 dk"
  },
  standard: {
    name: "Standart Şablon", 
    description: "En çok kullanılan alanları içerir",
    fields: ["Minimal alanlar", "şirket bilgileri", "müşteri detayları", "finansal özet", "temel şartlar"],
    estimatedTime: "5 dk"
  },
  detailed: {
    name: "Detaylı Şablon",
    description: "Tüm mevcut alanları içerir",
    fields: ["Tüm standart alanlar", "logo", "iletişim bilgileri", "detaylı şartlar", "notlar"],
    estimatedTime: "10 dk"
  }
};

export default {
  generateDefaultTemplate,
  generateMinimalTemplate,
  generateStandardTemplate, 
  generateDetailedTemplate,
  getTemplateCategory,
  getTemplateType,
  NEW_TEMPLATE_GUIDE
};
