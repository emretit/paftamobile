import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Save } from 'lucide-react';
import { toast } from 'sonner';

interface DragDropPDFEditorProps {
  initialTemplate?: any | null;
  onSave: (template: any) => void;
  onPreview?: (template: any) => void;
}



export const DragDropPDFEditor: React.FC<DragDropPDFEditorProps> = ({
  initialTemplate,
  onSave,
  onPreview
}) => {
  const designerRef = useRef<HTMLDivElement>(null);
  const [designer, setDesigner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [templateName, setTemplateName] = useState('Yeni PDF Şablonu');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [tableColumns, setTableColumns] = useState({
    no: true,
    aciklama: true,
    urunHizmet: false,
    miktar: true,
    birimFiyat: true,
    tutar: true,
    birim: false,
    indirim: false
  });

  // Tablo kolonlarını güncelle
  const updateTableColumns = () => {
    if (designer && selectedElement === 'urunTablosu') {
      const activeColumns = [];
      const columnNames = [];
      const widthPercentages = [];
      
      if (tableColumns.no) { activeColumns.push("No"); columnNames.push("no"); widthPercentages.push(8); }
      if (tableColumns.aciklama) { activeColumns.push("Açıklama"); columnNames.push("aciklama"); widthPercentages.push(52); }
      if (tableColumns.urunHizmet) { activeColumns.push("Ürün/Hizmet"); columnNames.push("urunHizmet"); widthPercentages.push(25); }
      if (tableColumns.miktar) { activeColumns.push("Miktar"); columnNames.push("miktar"); widthPercentages.push(15); }
      if (tableColumns.birim) { activeColumns.push("Birim"); columnNames.push("birim"); widthPercentages.push(10); }
      if (tableColumns.birimFiyat) { activeColumns.push("Fiyat"); columnNames.push("birimFiyat"); widthPercentages.push(12); }
      if (tableColumns.indirim) { activeColumns.push("İndirim %"); columnNames.push("indirim"); widthPercentages.push(10); }
      if (tableColumns.tutar) { activeColumns.push("Tutar (KDV Hariç)"); columnNames.push("tutar"); widthPercentages.push(13); }

      try {
        const template = designer.getTemplate();
        const updatedSchemas = { ...template.schemas[0] };
        
        if (updatedSchemas.urunTablosu) {
          updatedSchemas.urunTablosu.head = activeColumns;
          updatedSchemas.urunTablosu.headWidthPercentages = widthPercentages;
        }
        
        designer.updateTemplate({
          ...template,
          schemas: [updatedSchemas]
        });
        
        console.log('Table columns updated:', activeColumns);
      } catch (error) {
        console.error('Error updating table columns:', error);
      }
    }
  };

  useEffect(() => {
    const initializePDFme = async () => {
      try {
        // Delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { Designer } = await import('@pdfme/ui');
        const { text, image, barcodes, table, line, rectangle, ellipse, svg, checkbox, radioGroup, select, date, time, dateTime } = await import('@pdfme/schemas');
        
        if (designerRef.current && !designer) {
          const defaultTemplate = initialTemplate || {
            basePdf: { width: 210, height: 297, padding: [20, 20, 20, 20] },
            schemas: [{}]
          };

          console.log('Creating PDFme Designer with template:', defaultTemplate);

          // NGS Teklif Formu - Gerçek Layout'a Uygun
          const predefinedSchemas = {
            // NGS Logo (Sol üst)
            'ngsLogo': {
              type: 'image',
              position: { x: 20, y: 15 },
              width: 25,
              height: 25
            },
            
            // Şirket Başlığı ve Adresler
            'sirketBaslik': {
              type: 'text',
              position: { x: 50, y: 18 },
              width: 80,
              height: 8,
              fontSize: 10,
              fontColor: '#000000',
              content: 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ'
            },
            'merkezAdres': {
              type: 'text',
              position: { x: 50, y: 28 },
              width: 80,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Merkez    : Eğitim mah. Muratpaşa cad. No:1 D:29-30 Kadıköy, İstanbul'
            },
            'subeAdres': {
              type: 'text',
              position: { x: 50, y: 35 },
              width: 80,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Şube      : Topçular Mah. İşgören Sok. No: 2 A Keresteciler Sit. Eyüp, İstanbul'
            },

            // Teklif Formu Başlığı (Orta)
            'teklifBaslik': {
              type: 'text',
              position: { x: 85, y: 50 },
              width: 40,
              height: 10,
              fontSize: 14,
              fontColor: '#000000',
              textAlign: 'center',
              content: 'TEKLİF FORMU'
            },

            // Sağ üst bilgiler
            'tarihLabel': {
              type: 'text',
              position: { x: 140, y: 15 },
              width: 15,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Tarih'
            },
            'tarihDeger': {
              type: 'text',
              position: { x: 158, y: 15 },
              width: 30,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: ': 08.08.2025'
            },
            'gecerlilikLabel': {
              type: 'text',
              position: { x: 140, y: 22 },
              width: 15,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Geçerlilik'
            },
            'gecerlilikDeger': {
              type: 'text',
              position: { x: 158, y: 22 },
              width: 30,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: ': 15.08.2025'
            },
            'teklifNoLabel': {
              type: 'text',
              position: { x: 140, y: 29 },
              width: 15,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Teklif No'
            },
            'teklifNoDeger': {
              type: 'text',
              position: { x: 158, y: 29 },
              width: 30,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: ': NT.2508-1364.01'
            },
            'hazirlayanLabel': {
              type: 'text',
              position: { x: 140, y: 36 },
              width: 15,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Hazırlayan'
            },
            'hazirlayanDeger': {
              type: 'text',
              position: { x: 158, y: 36 },
              width: 30,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: ': Nurettin Emre AYDIN'
            },

            // Müşteri Bilgileri
            'musteriBaslik': {
              type: 'text',
              position: { x: 20, y: 70 },
              width: 120,
              height: 8,
              fontSize: 11,
              fontColor: '#000000',
              content: 'BAHÇEŞEHİR GÖLEVLERİ SİTESİ'
            },
            'sayinLabel': {
              type: 'text',
              position: { x: 20, y: 80 },
              width: 170,
              height: 18,
              fontSize: 9,
              fontColor: '#000000',
              content: 'Sayın\nMustafa Bey,\nYapmış olduğumuz görüşmeler sonrasında hazırlamış olduğumuz fiyat teklifimizi değerlendirmenize sunarız.'
            },

            // Ürün Tablosu - Gerçek formata uygun
            'urunTablosu': {
              type: 'table',
              position: { x: 20, y: 105 },
              width: 170,
              height: 50,
              showHead: true,
              head: ["No", "Açıklama", "Miktar", "Fiyat", "Tutar (KDV Hariç)"],
              headWidthPercentages: [8, 52, 15, 12, 13],
              tableStyles: { 
                borderWidth: 0.5, 
                borderColor: '#000000',
                alternateBackgroundColor: '#ffffff'
              },
              headStyles: { 
                fontSize: 8, 
                fontColor: '#000000', 
                backgroundColor: '#ffffff',
                textAlign: 'center',
                verticalAlign: 'middle',
                borderWidth: 0.5,
                borderColor: '#000000',
                padding: [2, 2, 2, 2]
              },
              bodyStyles: { 
                fontSize: 7, 
                fontColor: '#000000',
                textAlign: 'left',
                verticalAlign: 'top',
                borderWidth: 0.5,
                borderColor: '#000000',
                padding: [2, 2, 2, 2],
                lineHeight: 1.2
              }
            },

            // Mali Özet - Sağda (Tablo altında)
            'brutToplamLabel': {
              type: 'text',
              position: { x: 125, y: 165 },
              width: 25,
              height: 6,
              fontSize: 9,
              fontColor: '#000000',
              content: 'Brüt Toplam'
            },
            'brutToplamDeger': {
              type: 'text',
              position: { x: 155, y: 165 },
              width: 30,
              height: 6,
              fontSize: 9,
              fontColor: '#000000',
              textAlign: 'right',
              content: '1.100,00 $'
            },
            'indirimLabel': {
              type: 'text',
              position: { x: 125, y: 172 },
              width: 25,
              height: 6,
              fontSize: 9,
              fontColor: '#000000',
              content: 'İndirim'
            },
            'indirimDeger': {
              type: 'text',
              position: { x: 155, y: 172 },
              width: 30,
              height: 6,
              fontSize: 9,
              fontColor: '#000000',
              textAlign: 'right',
              content: '0,00 $'
            },
            'netToplamLabel': {
              type: 'text',
              position: { x: 125, y: 179 },
              width: 25,
              height: 6,
              fontSize: 9,
              fontColor: '#000000',
              content: 'Net Toplam'
            },
            'netToplamDeger': {
              type: 'text',
              position: { x: 155, y: 179 },
              width: 30,
              height: 6,
              fontSize: 9,
              fontColor: '#000000',
              textAlign: 'right',
              content: '1.100,00 $'
            },
            'kdvLabel': {
              type: 'text',
              position: { x: 125, y: 186 },
              width: 25,
              height: 6,
              fontSize: 9,
              fontColor: '#000000',
              content: 'KDV %20'
            },
            'kdvDeger': {
              type: 'text',
              position: { x: 155, y: 186 },
              width: 30,
              height: 6,
              fontSize: 9,
              fontColor: '#000000',
              textAlign: 'right',
              content: '220,00 $'
            },
            'toplamLabel': {
              type: 'text',
              position: { x: 125, y: 193 },
              width: 25,
              height: 8,
              fontSize: 10,
              fontColor: '#000000',
              content: 'Toplam'
            },
            'toplamDeger': {
              type: 'text',
              position: { x: 155, y: 193 },
              width: 30,
              height: 8,
              fontSize: 10,
              fontColor: '#000000',
              textAlign: 'right',
              content: '1.320,00 $'
            },

            // Notlar Bölümü
            'notlarBaslik': {
              type: 'text',
              position: { x: 20, y: 210 },
              width: 20,
              height: 6,
              fontSize: 9,
              fontColor: '#000000',
              content: 'Notlar           :'
            },
            'fiyatlarNotu': {
              type: 'text',
              position: { x: 20, y: 220 },
              width: 170,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Fiyatlar         : Teklifimiz USD cinsindan Merkez Bankası Döviz Satış Kuruna göre hazırlanmıştır.'
            },
            'odemeNotu': {
              type: 'text',
              position: { x: 20, y: 227 },
              width: 170,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Ödeme          : Siparişte %50 nakit avans, %50 iş bitimi nakit tahsil edilecektir.'
            },
            'garantiNotu': {
              type: 'text',
              position: { x: 20, y: 234 },
              width: 170,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Garanti          : Ürünlerimiz fatura tarihinden itibaren fabrikasyon hatalarına karşı 2(iki) yıl garantilidir'
            },
            'stokTeslimNotu': {
              type: 'text',
              position: { x: 20, y: 241 },
              width: 170,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Stok ve Teslim : Ürünler siparişe sonra 5 gün içinde temin edilecektir. Tahmini iş süresi ürün teslimatından sonra 10 iş günüdür.'
            },
            'ticariSartlarNotu': {
              type: 'text',
              position: { x: 20, y: 248 },
              width: 170,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Ticari Şartlar   :'
            },

            // Alt NGS Logo ve Bilgiler
            'altNgsLogo': {
              type: 'image',
              position: { x: 20, y: 260 },
              width: 20,
              height: 20
            },
            'altSirketBilgi': {
              type: 'text',
              position: { x: 45, y: 263 },
              width: 80,
              height: 10,
              fontSize: 8,
              fontColor: '#000000',
              content: 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ\nEğitim mah. Muratpaşa cad. No:1 D:29-30 Kadıköy, İstanbul\nwww.ngsteknoloji.com / 0 (212) 577 35 72'
            },
            'sayfaNo': {
              type: 'text',
              position: { x: 170, y: 270 },
              width: 20,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              textAlign: 'right',
              content: 'Sayfa 1/2'
            },

            // İmza Alanları
            'musteriImzaKutu': {
              type: 'rectangle',
              position: { x: 25, y: 285 },
              width: 60,
              height: 30,
              borderWidth: 1,
              borderColor: '#000000',
              color: 'transparent'
            },
            'musteriImzaBaslik': {
              type: 'text',
              position: { x: 35, y: 290 },
              width: 40,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              textAlign: 'center',
              content: 'Teklifi Kabul Eden Firma Yetkilisi'
            },
            'musteriImzaAlt': {
              type: 'text',
              position: { x: 35, y: 305 },
              width: 40,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              textAlign: 'center',
              content: 'Kaşe - İmza'
            },

            'sirketImzaKutu': {
              type: 'rectangle',
              position: { x: 105, y: 285 },
              width: 60,
              height: 30,
              borderWidth: 1,
              borderColor: '#000000',
              color: 'transparent'
            },
            'sirketImzaBaslik': {
              type: 'text',
              position: { x: 115, y: 290 },
              width: 40,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              textAlign: 'center',
              content: 'Teklifi Onaylayan Firma Yetkilisi'
            },
            'sirketImzaAlt': {
              type: 'text',
              position: { x: 115, y: 305 },
              width: 40,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              textAlign: 'center',
              content: 'Kaşe - İmza'
            },
            'sirketImzaAdi': {
              type: 'text',
              position: { x: 115, y: 310 },
              width: 40,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              textAlign: 'center',
              content: 'Nurettin Emre AYDIN'
            },

            // ========== EK ARAÇLAR (Sayfa 2) ==========
            
            // Şekiller
            'cizgiOrnek': {
              type: 'line',
              position: { x: 20, y: 400 },
              width: 50,
              height: 1,
              color: '#000000'
            },
            'dikdortgenOrnek': {
              type: 'rectangle',
              position: { x: 80, y: 400 },
              width: 30,
              height: 20,
              borderWidth: 1,
              borderColor: '#000000',
              color: '#f0f0f0'
            },
            'elipsOrnek': {
              type: 'ellipse',
              position: { x: 120, y: 400 },
              width: 20,
              height: 20,
              borderWidth: 1,
              borderColor: '#000000',
              color: '#e0e0e0'
            },

            // Form Elemanları
            'checkboxOrnek': {
              type: 'checkbox',
              position: { x: 20, y: 430 },
              width: 4,
              height: 4,
              color: '#dc2626'
            },
            'checkboxEtiket': {
              type: 'text',
              position: { x: 27, y: 431 },
              width: 40,
              height: 6,
              fontSize: 9,
              fontColor: '#000000',
              content: 'Şartları kabul ediyorum'
            },

            // Seçim Kutusu
            'secimKutusu': {
              type: 'select',
              position: { x: 20, y: 445 },
              width: 40,
              height: 8,
              fontSize: 9,
              fontColor: '#000000',
              backgroundColor: '#ffffff',
              options: ['Nakit', 'Kredi Kartı', 'Havale', 'Çek']
            },

            // Tarih ve Saat
            'tarihAlani': {
              type: 'date',
              position: { x: 70, y: 445 },
              width: 30,
              height: 8,
              fontSize: 9,
              fontColor: '#000000',
              backgroundColor: '#ffffff',
              format: 'dd.MM.yyyy'
            },
            'saatAlani': {
              type: 'time',
              position: { x: 110, y: 445 },
              width: 25,
              height: 8,
              fontSize: 9,
              fontColor: '#000000',
              backgroundColor: '#ffffff',
              format: 'HH:mm'
            },

            // QR Kod
            'qrKodOrnek': {
              type: 'qrcode',
              position: { x: 145, y: 430 },
              width: 20,
              height: 20,
              barColor: '#000000',
              backgroundColor: '#ffffff'
            },

            // İmza Kutusu
            'imzaKutusu': {
              type: 'rectangle',
              position: { x: 20, y: 460 },
              width: 60,
              height: 25,
              borderWidth: 1,
              borderColor: '#000000',
              color: 'transparent'
            },
            'imzaEtiket': {
              type: 'text',
              position: { x: 22, y: 462 },
              width: 56,
              height: 6,
              fontSize: 8,
              fontColor: '#666666',
              content: 'İmza:'
            },

            // Logo/Resim Alanı
            'logoAlani': {
              type: 'image',
              position: { x: 90, y: 460 },
              width: 30,
              height: 15
            },

            // Barkod Örnekleri
            'barkodEAN13': {
              type: 'ean13',
              position: { x: 130, y: 460 },
              width: 30,
              height: 12,
              barColor: '#000000',
              backgroundColor: '#ffffff'
            }
          };

          const designerInstance = new Designer({
            domContainer: designerRef.current,
            template: {
              ...defaultTemplate,
              schemas: [predefinedSchemas] // Tüm alanları PDFme'nin schema panel'ine ekle
            },
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
            } as any,
            options: {
              theme: {
                token: {
                  colorPrimary: '#dc2626'
                }
              },
              ui: {
                sidebar: {
                  enabled: true,
                  width: 60
                },
                toolbar: {
                  enabled: true
                }
              }
            }
          });

          // Element seçim için DOM event listener
          const container = designerRef.current;
          if (container) {
            container.addEventListener('click', (e: any) => {
              // Tablo elementine tıklama kontrolü
              const target = e.target;
              if (target && target.closest && target.closest('[data-pdfme-key="urunTablosu"]')) {
                setSelectedElement('urunTablosu');
              } else {
                setSelectedElement(null);
              }
            });
          }

          // Designer yüklendikten sonra sample data'yı set et
          setTimeout(() => {
            try {
              const sampleData = {
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
                tarihAlani: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                saatAlani: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                qrKodOrnek: 'https://example.com/teklif/NT.2508-1364.01',
                imzaKutusu: '',
                imzaEtiket: 'İmza:',
                logoAlani: '',
                barkodEAN13: '1234567890123'
              };
              
              // PDFme Designer doesn't have updateInputs method
              // The sample data will be used during preview generation
              console.log('Sample data prepared successfully');
            } catch (error) {
              console.error('Error setting sample data:', error);
            }
          }, 500);

          setDesigner(designerInstance);
          setIsLoading(false);
          console.log('PDFme Designer initialized successfully');
        }
      } catch (error) {
        console.error('PDFMe initialization error:', error);
        toast.error('PDF tasarımcısı yüklenirken hata oluştu: ' + error.message);
        setIsLoading(false);
      }
    };

    initializePDFme();
  }, [initialTemplate]);

  const handleSave = () => {
    if (designer) {
      try {
        const template = designer.getTemplate();
        const templateData = {
          name: templateName,
          template: template,
          created_at: new Date().toISOString()
        };
        
        onSave(templateData);
        toast.success('PDF şablonu başarıyla kaydedildi!');
      } catch (error) {
        console.error('Template save error:', error);
        toast.error('Şablon kaydedilirken hata oluştu: ' + error.message);
      }
    }
  };

  const handlePreview = async () => {
    if (!designer) {
      toast.error('PDF tasarımcısı henüz yüklenmemiş');
      return;
    }

    try {
      const template = designer.getTemplate();
      
      // PDFme generator import
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes, table, line, rectangle, ellipse, svg, checkbox, radioGroup, select, date, time, dateTime, builtInPlugins } = await import('@pdfme/schemas');
      
      // NGS Teklif Formu için güncel sample data
      const sampleData = {
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
        tarihAlani: '11.08.2025',
        saatAlani: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        qrKodOrnek: 'https://example.com/teklif/NT.2508-1364.01',
        imzaKutusu: '',
        imzaEtiket: 'İmza:',
        logoAlani: '',
        barkodEAN13: '1234567890123'
      };

      // PDF Generate
      toast.info('PDF önizlemesi oluşturuluyor...');
      
      const pdf = await generate({
        template,
        inputs: [sampleData],
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

      // PDF'i yeni sekmede aç
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Memory temizligi için 5 saniye sonra URL'i temizle
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      
      toast.success('PDF önizlemesi oluşturuldu!');
      
    } catch (error) {
      console.error('Template preview error:', error);
      toast.error('Önizleme oluşturulurken hata oluştu: ' + error.message);
    }
  };

  return (
    <div className="flex h-[800px] bg-gray-50 rounded-lg overflow-hidden">
      {/* PDF Designer Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="template-name">Şablon Adı:</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-48"
                placeholder="Şablon adını girin"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              🎯 PDF'teki alanları tıklayın, sağ panelde özelleştirin
            </span>
            <Button
              onClick={handlePreview}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Önizle</span>
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              className="flex items-center space-x-2 bg-primary text-white"
            >
              <Save className="w-4 h-4" />
              <span>Kaydet</span>
            </Button>
          </div>
        </div>

        {/* Designer Container */}
        <div className="flex-1 relative">
          <div
            ref={designerRef}
            className="w-full h-full"
            style={{ minHeight: '600px' }}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">PDF tasarımcısı yükleniyor...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Column Control Panel - Right Side */}
      {selectedElement === 'urunTablosu' && (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Tablo Kolonları</h3>
              <Button 
                size="sm" 
                onClick={updateTableColumns}
                className="bg-primary text-white"
              >
                Uygula
              </Button>
            </div>
            
            <div className="space-y-3">
              {Object.entries(tableColumns).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {key === 'no' && 'No'}
                    {key === 'aciklama' && 'Açıklama'}
                    {key === 'urunHizmet' && 'Ürün/Hizmet'}
                    {key === 'miktar' && 'Miktar'}
                    {key === 'birim' && 'Birim'}
                    {key === 'birimFiyat' && 'Fiyat'}
                    {key === 'indirim' && 'İndirim %'}
                    {key === 'tutar' && 'Tutar'}
                  </label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setTableColumns(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 mt-4">
              💡 İstediğiniz kolonları seçin ve "Uygula" düğmesine basın
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropPDFEditor;