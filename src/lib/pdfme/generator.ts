import type { Template } from '@pdfme/common';
import { getPdfmePlugins } from './plugins';
import { getDefaultFonts } from './fonts';

export async function generatePdfWithPdfme(template: Template, inputs?: Record<string, any>) {
  const [{ generate }, plugins] = await Promise.all([
    import('@pdfme/generator'),
    getPdfmePlugins(),
  ]);

  const preparedTemplate: Template = JSON.parse(JSON.stringify(template));
  
  // BLANK_PDF kontrolü - playground'daki gibi
  const { BLANK_PDF } = await import('@pdfme/common');
  if (preparedTemplate.basePdf === 'BLANK_PDF') {
    preparedTemplate.basePdf = BLANK_PDF;
  }

  // Problemli elementleri tamamen temizle
  if (preparedTemplate.schemas && Array.isArray(preparedTemplate.schemas)) {
    preparedTemplate.schemas = preparedTemplate.schemas.map((schema: any) => {
      const cleanedSchema: any = {};
      
      // Sadece desteklenen tipleri koru
      Object.keys(schema).forEach(key => {
        const element = schema[key];
        if (element && element.type) {
          // Signature ve diğer problemli tipleri atla
          if (element.type === 'signature') {
            console.log(`⚠️ Signature elementi atlandı: ${key}`);
            return;
          }
          
          // Sadece güvenli tipleri al
          const safeTypes = ['text', 'image', 'line', 'rectangle', 'ellipse', 'table', 'checkbox'];
          if (safeTypes.includes(element.type)) {
            // Element kopyala ve problemli fontName'i temizle
            const cleanElement = { ...element };
            if (cleanElement.fontName === 'NotoSerifJP-Regular') {
              delete cleanElement.fontName; // Default font kullan
            }
            
            // Image elementler için ek log
            if (element.type === 'image') {
              console.log(`🖼️ Image elementi korunuyor: ${key}`, {
                hasContent: !!cleanElement.content,
                hasSrc: !!cleanElement.src,
                position: cleanElement.position
              });
            }
            
            cleanedSchema[key] = cleanElement;
          } else {
            console.log(`⚠️ Desteklenmeyen tip atlandı: ${key} (${element.type})`);
          }
        }
      });
      
      return cleanedSchema;
    });
  }

  console.log('🧹 Temizlenmiş template:', preparedTemplate);

  const pdf = await generate({
    template: preparedTemplate,
    inputs: [inputs ?? {}],
    plugins,
    // Font options kaldırıldı - PDFme built-in fontları kullanacak
  });

  return pdf;
}
