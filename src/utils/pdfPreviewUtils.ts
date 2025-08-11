import { toast } from 'sonner';

/**
 * PDFme template için standardize edilmiş örnek veri üretir
 */
export const generateSampleInputs = (schemas: any[]): Record<string, any> => {
  const sampleInputs: Record<string, any> = {};
  
  if (schemas && schemas[0]) {
    Object.keys(schemas[0]).forEach((key) => {
      switch (key) {
        // Şirket bilgileri
        case 'companyName':
        case 'sirketBaslik':
          sampleInputs[key] = 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ';
          break;
        case 'companyAddress':
          sampleInputs[key] = 'Eğitim Mah. Muratpaşa Cad. No:1 D:29-30\nKadıköy, İstanbul 34000\nTel: 0 (212) 577 35 72';
          break;
          
        // Teklif bilgileri
        case 'proposalTitle':
        case 'teklifBaslik':
          sampleInputs[key] = 'TEKLİF FORMU';
          break;
        case 'proposalNumber':
          sampleInputs[key] = 'Teklif No: NT.2025-001';
          break;
        case 'proposalDate':
        case 'date':
        case 'tarihDeger':
          sampleInputs[key] = 'Tarih: ' + new Date().toLocaleDateString('tr-TR');
          break;
          
        // Müşteri bilgileri
        case 'customerName':
        case 'musteriBaslik':
          sampleInputs[key] = 'BAHÇEŞEHİR GÖLEVLERİ SİTESİ';
          break;
        case 'customerHeader':
          sampleInputs[key] = 'Müşteri Bilgileri:';
          break;
          
        // Finansal bilgiler
        case 'totalAmount':
        case 'toplamDeger':
          sampleInputs[key] = '8,260.00 $';
          break;
        case 'subtotalLabel':
          sampleInputs[key] = 'Ara Toplam:';
          break;
        case 'subtotalAmount':
        case 'subtotal':
          sampleInputs[key] = '7,000.00 $';
          break;
        case 'taxLabel':
        case 'taxInput':
          sampleInputs[key] = 'KDV (%18):';
          break;
        case 'taxAmount':
        case 'tax':
          sampleInputs[key] = '1,260.00 $';
          break;
        case 'totalLabel':
          sampleInputs[key] = 'GENEL TOPLAM:';
          break;
        case 'total':
          sampleInputs[key] = '8,260.00 $';
          break;
          
        // PDFme Quote Template alanları
        case 'head':
          sampleInputs[key] = 'QUOTE';
          break;
        case 'preparedForLabel':
          sampleInputs[key] = 'Prepared for:';
          break;
        case 'preparedForInput':
          sampleInputs[key] = 'İmam Dîane\n+123 456 7890\n63 İvy Road, Hawkville, GA, USA 31036';
          break;
        case 'quoteInfo':
          sampleInputs[key] = 'Quote No: 12345\n18 June 2025\nValid Until: 16 July 2025';
          break;
        case 'thankyou':
          sampleInputs[key] = 'Thank you for your interest!';
          break;
          
        // Başlıklar ve etiketler
        case 'itemsHeader':
          sampleInputs[key] = 'Teklif Edilen Ürün/Hizmetler:';
          break;
        case 'termsHeader':
          sampleInputs[key] = 'Şartlar ve Koşullar:';
          break;
          
        // Şartlar ve imza
        case 'paymentTerms':
          sampleInputs[key] = '• Ödeme: %50 peşin, %50 iş bitimi\n• Teslimat: Siparişe müteakip 10 iş günü\n• Garanti: 2 yıl üretici garantisi';
          break;
        case 'validityPeriod':
          sampleInputs[key] = 'Bu teklif 30 gün geçerlidir.';
          break;
        case 'signature':
          sampleInputs[key] = 'Saygılarımızla,\n\nNGS Teknoloji\nSatış Departmanı';
          break;
        case 'footer':
          sampleInputs[key] = 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ | www.ngsteknoloji.com | info@ngsteknoloji.com';
          break;
          
        // Tablo ve liste örnekleri
        case 'urunTablosu':
          sampleInputs[key] = [
            ['1', 'IP Kamera Sistemi (8 adet)', '8', '750.00 $', '6,000.00 $'],
            ['2', 'DVR Kayıt Cihazı', '1', '500.00 $', '500.00 $'],
            ['3', 'Kurulum ve Konfigürasyon', '1', '500.00 $', '500.00 $']
          ];
          break;
          
        // Diğer özel alanlar
        case 'teklifNoDeger':
          sampleInputs[key] = 'NT.2025-001';
          break;
        case 'hazirlayanDeger':
          sampleInputs[key] = 'Nurettin Emre AYDIN';
          break;
        case 'brutToplamDeger':
          sampleInputs[key] = '7,000.00 $';
          break;
        case 'kdvDeger':
          sampleInputs[key] = '1,260.00 $';
          break;
          
        // Fatura alanları
        case 'invoiceHeader':
          sampleInputs[key] = 'FATURA';
          break;
        case 'customerInfo':
          sampleInputs[key] = 'Bahçeşehir Gölevleri Sitesi\nBahçeşehir Mah. \nİstanbul, Türkiye';
          break;
        case 'invoiceDetails':
          sampleInputs[key] = 'Fatura No: F-2025-001\nTarih: ' + new Date().toLocaleDateString('tr-TR');
          break;
        case 'billToHeader':
          sampleInputs[key] = 'Faturalanan:';
          break;
        case 'subtotalSection':
          sampleInputs[key] = 'Ara Toplam';
          break;
          
        // Default olarak field adına uygun örnek
        default:
          if (key.toLowerCase().includes('name') || key.toLowerCase().includes('isim')) {
            sampleInputs[key] = 'Örnek İsim';
          } else if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('tutar')) {
            sampleInputs[key] = '1,000.00 $';
          } else if (key.toLowerCase().includes('date') || key.toLowerCase().includes('tarih')) {
            sampleInputs[key] = new Date().toLocaleDateString('tr-TR');
          } else if (key.toLowerCase().includes('address') || key.toLowerCase().includes('adres')) {
            sampleInputs[key] = 'Örnek Adres';
          } else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('telefon')) {
            sampleInputs[key] = '+90 212 577 35 72';
          } else if (key.toLowerCase().includes('email') || key.toLowerCase().includes('mail')) {
            sampleInputs[key] = 'info@ngsteknoloji.com';
          } else {
            sampleInputs[key] = `Örnek ${key}`;
          }
      }
    });
  } else {
    // Fallback örnek veriler
    sampleInputs.companyName = 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ';
    sampleInputs.proposalTitle = 'TEKLİF FORMU';
    sampleInputs.customerName = 'BAHÇEŞEHİR GÖLEVLERİ SİTESİ';
    sampleInputs.totalAmount = '8,260.00 $';
  }
  
  return sampleInputs;
};

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
