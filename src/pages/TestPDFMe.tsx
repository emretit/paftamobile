import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExportPdfButton } from '@/components/quotations/ExportPdfButton';
import { toast } from 'sonner';

const TestPDFMe: React.FC = () => {
  const [testData] = useState({
    id: 'test-123',
    proposal_number: 'TKL-2025-001',
    title: 'Web Sitesi Geliştirme Projesi',
    customer_name: 'ABC Teknoloji Ltd. Şti.',
    customer_address: 'Merkez Mah. Teknoloji Cad. No:123 Şişli/İstanbul',
    total_amount: 125000,
    created_at: new Date().toISOString(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    payment_terms: '30 gün vadeli ödeme, %2 peşin indirimi uygulanır.',
    notes: 'Bu teklif 30 gün geçerlidir. Tüm fiyatlar KDV dahildir. Teslimat süresi sipariş onayından sonra 15 iş günüdür.',
    company_name: 'XYZ Yazılım A.Ş.',
    company_address: 'Sanayi Mah. Yazılım Cad. No:456 Kadıköy/İstanbul',
    company_phone: 'Tel: (212) 555-0123 | Email: info@xyzyazilim.com'
  });

  const handleTestExport = () => {
    toast.info('Test PDF export başlatılıyor...');
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">PDFMe Test Sayfası</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.open('/settings/templates/pdfme', '_blank')}
          >
            Şablon Düzenleyici
          </Button>
          <ExportPdfButton 
            quotationId={testData.id}
            quotationData={testData}
            label="Test PDF Çıktısı"
          />
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Test Teklif Verisi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Teklif Bilgileri</h3>
            <div className="space-y-1 text-sm">
              <div><strong>Teklif No:</strong> {testData.proposal_number}</div>
              <div><strong>Başlık:</strong> {testData.title}</div>
              <div><strong>Tutar:</strong> {testData.total_amount.toLocaleString('tr-TR')} ₺</div>
              <div><strong>Tarih:</strong> {new Date(testData.created_at).toLocaleDateString('tr-TR')}</div>
              <div><strong>Geçerlilik:</strong> {new Date(testData.valid_until).toLocaleDateString('tr-TR')}</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Müşteri Bilgileri</h3>
            <div className="space-y-1 text-sm">
              <div><strong>Müşteri:</strong> {testData.customer_name}</div>
              <div><strong>Adres:</strong> {testData.customer_address}</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Şirket Bilgileri</h3>
            <div className="space-y-1 text-sm">
              <div><strong>Şirket:</strong> {testData.company_name}</div>
              <div><strong>Adres:</strong> {testData.company_address}</div>
              <div><strong>İletişim:</strong> {testData.company_phone}</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Ödeme Koşulları</h3>
            <div className="space-y-1 text-sm">
              <div>{testData.payment_terms}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Notlar</h3>
          <p className="text-sm">{testData.notes}</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">PDFMe Entegrasyon Durumu</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Templates tablosu oluşturuldu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">PDFMe Designer entegre edildi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">PDF Generator entegre edildi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">ExportPdfButton bileşeni hazır</span>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Kullanım Adımları:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Önce "Şablon Düzenleyici" butonuna tıklayarak PDF şablonunuzu tasarlayın</li>
            <li>Şablonunuzu kaydedin</li>
            <li>"Test PDF Çıktısı" butonuna tıklayarak PDF'i test edin</li>
            <li>PDF otomatik olarak indirilir ve yeni sekmede açılır</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};

export default TestPDFMe;