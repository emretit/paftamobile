import { Proposal } from '@/types/proposal';

export class PDFMeGenerator {
  async generateProposalPDF(proposal: Proposal, template: any): Promise<void> {
    try {
      // Dynamically import PDFMe to avoid SSR issues
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes, table, line, rectangle, ellipse, svg, checkbox, radioGroup, select, date, time, dateTime } = await import('@pdfme/schemas');
      
      // Map proposal data to template inputs
      const inputs = this.mapProposalToInputs(proposal, template);
      
      // Generate PDF with all schema types
      const pdf = await generate({
        template,
        inputs: [inputs],
        plugins: { 
          text, 
          image, 
          qrcode: barcodes.qrcode,
          ean13: barcodes.ean13,
          table,
          line,
          rectangle,
          ellipse,
          svg,
          checkbox,
          radioGroup,
          select,
          date,
          time,
          dateTime
        } as any
      });

      // Download the PDF
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `teklif-${proposal.proposal_number || proposal.number || 'NGS-TEKLIF'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('PDF oluşturulamadı: ' + error.message);
    }
  }

  async generatePreviewPDF(template: any, mockData?: Record<string, any>): Promise<void> {
    try {
      // Dynamically import PDFMe to avoid SSR issues
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes, table, line, rectangle, ellipse, svg, checkbox, radioGroup, select, date, time, dateTime } = await import('@pdfme/schemas');
      
      // Use mock data or default values
      const inputs = mockData || this.getMockData();
      
      const pdf = await generate({
        template,
        inputs: [inputs],
        plugins: { 
          text, 
          image, 
          qrcode: barcodes.qrcode,
          ean13: barcodes.ean13,
          table,
          line,
          rectangle,
          ellipse,
          svg,
          checkbox,
          radioGroup,
          select,
          date,
          time,
          dateTime
        } as any
      });

      // Download preview
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ngs-sablon-onizleme.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Preview generation error:', error);
      throw new Error('Önizleme oluşturulamadı: ' + error.message);
    }
  }

  private mapProposalToInputs(proposal: Proposal, template: any): Record<string, any> {
    // Convert proposal items to NGS table format
    const itemsArray = Array.isArray((proposal as any).items) ? (proposal as any).items : [];
    const proposalItemsTable = itemsArray.length > 0 
      ? itemsArray.map((item: any, index: number) => [
          (index + 1).toString(), // No
          item.description || item.name || 'Ürün/Hizmet',
          `${item.quantity || 1},00 Ad`,
          item.unit_price ? `${item.unit_price.toLocaleString('tr-TR')} ${(proposal as any).currency || '$'}` : '0 $',
          item.total_price ? `${item.total_price.toLocaleString('tr-TR')} ${(proposal as any).currency || '$'}` : '0 $'
        ])
      : [['1', 'Ürün/Hizmet bulunamadı', '1,00 Ad', '0 $', '0 $']];

    // Calculate totals
    const subTotal = itemsArray.reduce((sum: number, item: any) => {
      return sum + (Number(item?.total_price) || 0);
    }, 0);
    const discountAmount = Number((proposal as any)?.discount_amount) || 0;
    const netTotal = subTotal - discountAmount;
    const vatRate = Number((proposal as any)?.vat_rate) || 20;
    const vatAmount = netTotal * (vatRate / 100);
    const grandTotal = netTotal + vatAmount;
    const currency = (proposal as any)?.currency || '$';

    // NGS Teklif Formu Data Mapping - Schema field adlarına uygun
    return {
      // NGS Logo ve Şirket Bilgileri
      ngsLogo: '',
      sirketBaslik: 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ',
      merkezAdres: 'Merkez    : Eğitim mah. Muratpaşa cad. No:1 D:29-30 Kadıköy, İstanbul',
      subeAdres: 'Şube      : Topçular Mah. İşgören Sok. No: 2 A Keresteciler Sit. Eyüp, İstanbul',
      
      // Teklif Başlığı
      teklifBaslik: 'TEKLİF FORMU',
      
      // Sağ üst bilgiler
      tarihLabel: 'Tarih',
      tarihDeger: `: ${proposal.created_at ? new Date(proposal.created_at).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR')}`,
      gecerlilikLabel: 'Geçerlilik',
      gecerlilikDeger: `: ${proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString('tr-TR') : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR')}`,
      teklifNoLabel: 'Teklif No',
      teklifNoDeger: `: ${proposal.proposal_number || proposal.number || 'NT.2508-1364.01'}`,
      hazirlayanLabel: 'Hazırlayan',
      hazirlayanDeger: `: ${(proposal as any)?.employee_name || 'Nurettin Emre AYDIN'}`,
      
      // Müşteri Bilgileri
      musteriBaslik: ((proposal as any)?.customer_company || proposal.customer_name || 'MÜŞTERİ ADI').toUpperCase(),
      sayinLabel: `Sayın\n${(proposal as any)?.contact_person || 'Müşteri Temsilcisi'},\nYapmış olduğumuz görüşmeler sonrasında hazırlamış olduğumuz fiyat teklifimizi değerlendirmenize sunarız.`,
      
      // Ürün Tablosu
      urunTablosu: proposalItemsTable,
      
      // Mali Özet
      brutToplamLabel: 'Brüt Toplam',
      brutToplamDeger: `${subTotal.toLocaleString('tr-TR')} ${currency}`,
      indirimLabel: 'İndirim',
      indirimDeger: `${discountAmount.toLocaleString('tr-TR')} ${currency}`,
      netToplamLabel: 'Net Toplam',
      netToplamDeger: `${netTotal.toLocaleString('tr-TR')} ${currency}`,
      kdvLabel: `KDV %${vatRate}`,
      kdvDeger: `${vatAmount.toLocaleString('tr-TR')} ${currency}`,
      toplamLabel: 'Toplam',
      toplamDeger: `${grandTotal.toLocaleString('tr-TR')} ${currency}`,
      
      // Notlar Bölümü
      notlarBaslik: 'Notlar           :',
      fiyatlarNotu: `Fiyatlar         : Teklifimiz ${currency} cinsindan Merkez Bankası Döviz Satış Kuruna göre hazırlanmıştır.`,
      odemeNotu: `Ödeme          : ${proposal.payment_terms || 'Siparişte %50 nakit avans, %50 iş bitimi nakit tahsil edilecektir.'}`,
      garantiNotu: `Garanti          : ${(proposal as any)?.warranty_terms || 'Ürünlerimiz fatura tarihinden itibaren fabrikasyon hatalarına karşı 2(iki) yıl garantilidir'}`,
      stokTeslimNotu: `Stok ve Teslim : ${proposal.delivery_terms || 'Ürünler siparişe sonra 5 gün içinde temin edilecektir. Tahmini iş süresi ürün teslimatından sonra 10 iş günüdür.'}`,
      ticariSartlarNotu: 'Ticari Şartlar   :',
      
      // Alt NGS Logo ve Bilgiler
      altNgsLogo: '',
      altSirketBilgi: 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ\nEğitim mah. Muratpaşa cad. No:1 D:29-30 Kadıköy, İstanbul\nwww.ngsteknoloji.com / 0 (212) 577 35 72',
      sayfaNo: 'Sayfa 1/2',
      
      // İmza Alanları
      musteriImzaKutu: '',
      musteriImzaBaslik: 'Teklifi Kabul Eden Firma Yetkilisi',
      musteriImzaAlt: 'Kaşe - İmza',
      sirketImzaKutu: '',
      sirketImzaBaslik: 'Teklifi Onaylayan Firma Yetkilisi',
      sirketImzaAlt: 'Kaşe - İmza',
      sirketImzaAdi: (proposal as any)?.employee_name || 'Nurettin Emre AYDIN',
      
      // Ek araçlar için varsayılan değerler
      cizgiOrnek: '',
      dikdortgenOrnek: '',
      elipsOrnek: '',
      checkboxOrnek: true,
      checkboxEtiket: 'Şartları kabul ediyorum',
      secimKutusu: 'Nakit',
      tarihAlani: new Date().toLocaleDateString('tr-TR'),
      saatAlani: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      qrKodOrnek: `${proposal.proposal_number || proposal.number || 'TKL-001'} | ${proposal.customer_name || 'Müşteri'} | ${grandTotal.toLocaleString('tr-TR')} ${currency}`,
      imzaKutusu: '',
      imzaEtiket: 'İmza:',
      logoAlani: '',
      barkodEAN13: (proposal.proposal_number || proposal.number || '1234567890123').replace(/[^0-9]/g, '').padEnd(13, '0').substring(0, 13)
    };
  }

  private convertItemsToTableData(items: any[]): string[][] {
    if (!items || items.length === 0) {
      return [['Ürün/Hizmet bulunamadı', '-', '-', '-', '-']];
    }

    return items.map(item => [
      item.name || 'Ürün',
      (item.quantity || 0).toString(),
      item.unit || 'Adet',
      item.unit_price ? `${item.unit_price.toLocaleString('tr-TR')} ₺` : '0 ₺',
      item.total_price ? `${item.total_price.toLocaleString('tr-TR')} ₺` : '0 ₺'
    ]);
  }

  private getMockData(): Record<string, any> {
    // NGS Mock Data - Şablonumuza uygun
    return {
      // NGS Logo ve Şirket Bilgileri
      ngsLogo: '',
      sirketBaslik: 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ',
      merkezAdres: 'Merkez    : Eğitim mah. Muratpaşa cad. No:1 D:29-30 Kadıköy, İstanbul',
      subeAdres: 'Şube      : Topçular Mah. İşgören Sok. No: 2 A Keresteciler Sit. Eyüp, İstanbul',
      teklifBaslik: 'TEKLİF FORMU',
      tarihLabel: 'Tarih',
      tarihDeger: ': 08.08.2025',
      gecerlilikLabel: 'Geçerlilik',
      gecerlilikDeger: ': 15.08.2025',
      teklifNoLabel: 'Teklif No',
      teklifNoDeger: ': NT.2508-1364.01',
      hazirlayanLabel: 'Hazırlayan',
      hazirlayanDeger: ': Nurettin Emre AYDIN',
      musteriBaslik: 'BAHÇEŞEHİR GÖLEVLERİ SİTESİ',
      sayinLabel: 'Sayın\nMustafa Bey,\nYapmış olduğumuz görüşmeler sonrasında hazırlamış olduğumuz fiyat teklifimizi değerlendirmenize sunarız.',
      urunTablosu: [
        ['1', 'BİLGİSAYAR\nHP Pro Tower 290 BUC5S G9 İ7-13700 32GB 512GB SSD DOS', '1,00 Ad', '700,00 $', '700,00 $'],
        ['2', 'Windows 11 Pro Lisans', '1,00 Ad', '165,00 $', '165,00 $'],
        ['3', 'Uranium POE-G8002-96W 8 Port + 2 Port RJ45 Uplink POE Switch', '2,00 Ad', '80,00 $', '160,00 $'],
        ['4', 'İçilik, Montaj, Mühendislik ve Süpervizyon Hizmetleri, Programlama, Test, Devreye alma', '1,00 Ad', '75,00 $', '75,00 $']
      ],
      brutToplamLabel: 'Brüt Toplam',
      brutToplamDeger: '1.100,00 $',
      indirimLabel: 'İndirim',
      indirimDeger: '0,00 $',
      netToplamLabel: 'Net Toplam',
      netToplamDeger: '1.100,00 $',
      kdvLabel: 'KDV %20',
      kdvDeger: '220,00 $',
      toplamLabel: 'Toplam',
      toplamDeger: '1.320,00 $',
      notlarBaslik: 'Notlar           :',
      fiyatlarNotu: 'Fiyatlar         : Teklifimiz USD cinsindan Merkez Bankası Döviz Satış Kuruna göre hazırlanmıştır.',
      odemeNotu: 'Ödeme          : Siparişte %50 nakit avans, %50 iş bitimi nakit tahsil edilecektir.',
      garantiNotu: 'Garanti          : Ürünlerimiz fatura tarihinden itibaren fabrikasyon hatalarına karşı 2(iki) yıl garantilidir',
      stokTeslimNotu: 'Stok ve Teslim : Ürünler siparişe sonra 5 gün içinde temin edilecektir. Tahmini iş süresi ürün teslimatından sonra 10 iş günüdür.',
      ticariSartlarNotu: 'Ticari Şartlar   :',
      altNgsLogo: '',
      altSirketBilgi: 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ\nEğitim mah. Muratpaşa cad. No:1 D:29-30 Kadıköy, İstanbul\nwww.ngsteknoloji.com / 0 (212) 577 35 72',
      sayfaNo: 'Sayfa 1/2',
      musteriImzaKutu: '',
      musteriImzaBaslik: 'Teklifi Kabul Eden Firma Yetkilisi',
      musteriImzaAlt: 'Kaşe - İmza',
      sirketImzaKutu: '',
      sirketImzaBaslik: 'Teklifi Onaylayan Firma Yetkilisi',
      sirketImzaAlt: 'Kaşe - İmza',
      sirketImzaAdi: 'Nurettin Emre AYDIN',
      
      // Ek araçlar için sample data
      cizgiOrnek: '',
      dikdortgenOrnek: '',
      elipsOrnek: '',
      checkboxOrnek: true,
      checkboxEtiket: 'Şartları kabul ediyorum',
      secimKutusu: 'Nakit',
      tarihAlani: new Date().toLocaleDateString('tr-TR'),
      saatAlani: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      qrKodOrnek: 'https://example.com/teklif/NT.2508-1364.01',
      imzaKutusu: '',
      imzaEtiket: 'İmza:',
      logoAlani: '',
      barkodEAN13: '1234567890123'
    };
  }
}

export const pdfmeGenerator = new PDFMeGenerator();