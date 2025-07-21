import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Invoice } from '@/types/productMapping';

interface InvoiceDetailsPanelProps {
  invoice: Invoice | null;
}

const InvoiceDetailsPanel: React.FC<InvoiceDetailsPanelProps> = ({ invoice }) => {
  return (
    <Card>
      <CardHeader className="bg-blue-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          EVRAK BİLGİLERİ
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Gönderen</label>
            <p className="font-semibold">{invoice?.supplierName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Tedarikçi</label>
            <p className="font-semibold">{invoice?.supplierName}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Adres</label>
            <p className="text-sm text-gray-700">-</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Vergi No</label>
            <p className="font-semibold">{invoice?.supplierTaxNumber}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Belge No</label>
            <p className="font-semibold">{invoice?.invoiceNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Tarihi</label>
            <p className="font-semibold">
              {invoice ? format(new Date(invoice.invoiceDate), 'dd.MM.yyyy', { locale: tr }) : '-'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Vadesi</label>
            <p className="font-semibold">
              {invoice ? format(new Date(invoice.invoiceDate), 'dd.MM.yyyy', { locale: tr }) : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Proje</label>
            <select className="w-full p-2 border rounded text-sm">
              <option>(isteğe bağlı)</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Masraf Kalemi</label>
            <select className="w-full p-2 border rounded text-sm">
              <option>Masraf kalemi seçin</option>
            </select>
          </div>
          <div></div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-600">Açıklama</label>
          <textarea 
            className="w-full p-2 border rounded text-sm h-20"
            placeholder="Açıklama giriniz..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceDetailsPanel;