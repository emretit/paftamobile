import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Drag & Drop PDF template editor component
import { DragDropPDFEditor } from './template-designer/DragDropPDFEditor';

interface Template {
  id: string;
  name: string;
  template_json: any;
  created_at: string;
  updated_at: string;
}

export const TemplateManagement: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load templates from database
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', userRes.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Şablonlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setIsEditing(true);
    setActiveTab('designer');
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setActiveTab('designer');
  };

  const handleDeleteTemplate = async (template: Template) => {
    if (!confirm(`"${template.name}" şablonunu silmek istediğinizden emin misiniz?`)) return;

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', template.id);

      if (error) throw error;
      toast.success('Şablon silindi');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Şablon silinirken hata oluştu');
    }
  };

  const handlePreviewTemplate = async (template: Template) => {
    try {
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes, table, line, rectangle, ellipse, svg, checkbox, radioGroup, select, date, time, dateTime } = await import('@pdfme/schemas');

      // NGS Mock data for preview
      const mockInputs = {
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

      toast.info('PDF önizlemesi oluşturuluyor...');

      const pdf = await generate({
        template: template.template_json,
        inputs: [mockInputs],
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

      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      
      toast.success('PDF önizlemesi oluşturuldu!');
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Önizleme oluşturulamadı: ' + error.message);
    }
  };

  const handleSaveTemplate = async (template: any) => {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;

      const templateName = selectedTemplate?.name || 'Yeni Şablon';

      if (selectedTemplate?.id) {
        // Update existing template
        const { error } = await supabase
          .from('templates')
          .update({ 
            name: templateName,
            template_json: template 
          })
          .eq('id', selectedTemplate.id);

        if (error) throw error;
        toast.success('Şablon güncellendi');
      } else {
        // Create new template
        const { error } = await supabase
          .from('templates')
          .insert({
            name: templateName,
            template_json: template,
            user_id: userRes.user.id
          });

        if (error) throw error;
        toast.success('Şablon kaydedildi');
      }

      setIsEditing(false);
      setActiveTab('list');
      loadTemplates();
    } catch (error) {
      console.error('Save template error:', error);
      toast.error('Şablon kaydedilemedi');
    }
  };

  // Create a ready-to-use default PDFMe template in DB


  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[200px]">
          <div className="text-muted-foreground">Şablonlar yükleniyor...</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">PDF Şablon Yönetimi</h2>
        <Button onClick={handleNewTemplate} className="flex items-center gap-2">
          <Plus size={16} />
          Yeni Şablon
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Şablon Listesi</TabsTrigger>
          <TabsTrigger value="designer" disabled={!isEditing}>
            {selectedTemplate ? 'Şablon Düzenle' : 'Yeni Şablon'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {templates.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Henüz şablon yok</h3>
              <p className="text-muted-foreground mb-4">
                Teklif PDF'leriniz için özel şablonlar oluşturun
              </p>
              <Button onClick={handleNewTemplate}>
                <Plus size={16} className="mr-2" />
                İlk Şablonunuzu Oluşturun
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium truncate">{template.name}</h3>
                    <Badge variant="secondary">PDFMe</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    Güncelleme: {new Date(template.updated_at).toLocaleDateString('tr-TR')}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreviewTemplate(template)}
                      className="flex-1"
                    >
                      <Eye size={14} className="mr-1" />
                      Önizle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {/* Bilgi kartı ve eski route kaldırıldı */}
        </TabsContent>

        <TabsContent value="designer">
          {isEditing && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {selectedTemplate ? `"${selectedTemplate.name}" Düzenleniyor` : 'Yeni Şablon Oluşturuluyor'}
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setActiveTab('list');
                  }}>
                    İptal
                  </Button>
                </div>
              </div>
              
              <DragDropPDFEditor
                initialTemplate={selectedTemplate?.template_json || null}
                onSave={handleSaveTemplate}
                onPreview={async (template) => {
                  try {
                    const { generate } = await import('@pdfme/generator');
                    const { text, image, barcodes, table, line, rectangle, ellipse, svg, checkbox, radioGroup, select, date, time, dateTime } = await import('@pdfme/schemas');
                    
                    // NGS Mock data - şablonumuzla uyumlu
                    const mockInputs = {
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
                    
                    toast.info('PDF önizlemesi oluşturuluyor...');
                    
                    const pdf = await generate({
                      template,
                      inputs: [mockInputs],
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

                    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    setTimeout(() => URL.revokeObjectURL(url), 5000);
                    
                    toast.success('PDF önizlemesi oluşturuldu!');
                  } catch (error) {
                    console.error('Preview error:', error);
                    toast.error('Önizleme oluşturulamadı: ' + error.message);
                  }
                }}
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplateManagement;
