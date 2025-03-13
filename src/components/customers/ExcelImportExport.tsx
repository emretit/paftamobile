
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { exportCustomersToExcel, importCustomersFromExcel } from '@/utils/excelUtils';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, Upload } from 'lucide-react';
import type { Customer } from '@/types/customer';

interface ExcelImportExportProps {
  customers: Customer[];
}

const ExcelImportExport = ({ customers }: ExcelImportExportProps) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const handleExport = () => {
    exportCustomersToExcel(customers);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Lütfen bir Excel dosyası seçin');
      return;
    }

    try {
      setIsLoading(true);
      const importedCustomers = await importCustomersFromExcel(selectedFile);
      
      // Insert the imported customers into the database
      for (const customer of importedCustomers) {
        const { error } = await supabase
          .from('customers')
          .insert({
            name: customer.name,
            email: customer.email,
            mobile_phone: customer.mobile_phone,
            office_phone: customer.office_phone,
            company: customer.company,
            type: customer.type,
            status: customer.status,
            representative: customer.representative,
            balance: customer.balance,
            address: customer.address,
            tax_number: customer.tax_number,
            tax_office: customer.tax_office
          });
          
        if (error) {
          console.error('Error inserting customer:', error);
          toast.error(`Bir müşteri eklenirken hata oluştu: ${error.message}`);
        }
      }
      
      // Close dialog and refresh data
      setIsImportDialogOpen(false);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Müşteriler başarıyla içe aktarıldı');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('İçe aktarma sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2" 
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Excel İndir
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2" 
          onClick={() => setIsImportDialogOpen(true)}
        >
          <Upload className="h-4 w-4" />
          Excel Yükle
        </Button>
      </div>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excel Dosyasından Müşteri İçe Aktar</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              Lütfen bir Excel dosyası seçin. Dosya şu sütunları içermelidir: name, email, mobile_phone, office_phone, company, type, status, representative, balance, address, tax_number, tax_office.
            </p>
            
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary/90
              "
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              İptal
            </Button>
            <Button disabled={!selectedFile || isLoading} onClick={handleImport}>
              {isLoading ? 'İçe Aktarılıyor...' : 'İçe Aktar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExcelImportExport;
