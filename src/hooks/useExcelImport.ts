
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { importCustomersFromExcel } from '@/utils/excelUtils';
import { useQueryClient } from '@tanstack/react-query';
import type { Customer } from '@/types/customer';

export const useExcelImport = (onClose: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ 
    total: 0, 
    success: 0, 
    failed: 0, 
    duplicates: 0,
    invalidRows: 0 
  });
  const queryClient = useQueryClient();

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
      setProgress(10);
      
      // Parse Excel file
      const { customers: importedCustomers, duplicates, invalidRows } = await importCustomersFromExcel(selectedFile);
      
      // Update stats for UI with duplicates information
      setStats({ 
        total: selectedFile.size > 0 ? importedCustomers.length + duplicates + invalidRows : 0, 
        success: 0, 
        failed: 0, 
        duplicates,
        invalidRows
      });
      setProgress(30);
      
      console.log(`İçe aktarılacak toplam yeni müşteri sayısı: ${importedCustomers.length}`);
      console.log(`Mükerrer müşteri sayısı: ${duplicates}`);
      console.log(`Geçersiz satır sayısı: ${invalidRows}`);
      
      if (importedCustomers.length === 0) {
        setProgress(100);
        setTimeout(() => {
          onClose();
          setSelectedFile(null);
          if (duplicates > 0 && invalidRows === 0) {
            toast.info('Tüm müşteriler zaten sisteme eklenmiş');
          } else if (invalidRows > 0 && duplicates === 0) {
            toast.error(`${invalidRows} satır geçersiz veri içeriyor. Hiçbir müşteri içe aktarılamadı.`);
          } else if (invalidRows > 0 && duplicates > 0) {
            toast.error(`${duplicates} müşteri zaten mevcut ve ${invalidRows} satır geçersiz veri içeriyor.`);
          }
        }, 1500);
        return;
      }
      
      // Process in batches to avoid timeout issues
      const BATCH_SIZE = 50;
      let successCount = 0;
      let failedCount = 0;
      
      for (let i = 0; i < importedCustomers.length; i += BATCH_SIZE) {
        const batch = importedCustomers.slice(i, i + BATCH_SIZE);
        console.log(`${i+1}-${i+batch.length} arası müşteriler işleniyor (Toplam: ${importedCustomers.length})`);
        
        // Prepare batch for insertion
        const insertBatch = batch.map(customer => ({
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
        }));
        
        // Insert batch
        const { data, error } = await supabase
          .from('customers')
          .insert(insertBatch)
          .select();
          
        if (error) {
          console.error('Batch insert error:', error);
          failedCount += batch.length;
        } else {
          successCount += data?.length || 0;
          console.log(`${data?.length || 0} müşteri başarıyla eklendi`);
        }
        
        // Update stats and progress
        setStats({
          total: importedCustomers.length + duplicates + invalidRows,
          success: successCount,
          failed: failedCount,
          duplicates,
          invalidRows
        });
        
        const newProgress = 30 + Math.floor((i + batch.length) / importedCustomers.length * 70);
        setProgress(Math.min(newProgress, 95));
      }
      
      // Complete import
      setProgress(100);
      
      // Close dialog and refresh data
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        
        let message = `${successCount} müşteri başarıyla içe aktarıldı`;
        if (failedCount > 0) message += `, ${failedCount} başarısız`;
        if (stats.duplicates > 0) message += `, ${stats.duplicates} mükerrer`;
        if (stats.invalidRows > 0) message += `, ${stats.invalidRows} geçersiz veri`;
        
        if (successCount > 0) {
          toast.success(message);
        } else if (failedCount > 0) {
          toast.error(message);
        } else {
          toast.info(message);
        }
      }, 1500);
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('İçe aktarma sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    selectedFile,
    progress,
    stats,
    handleFileChange,
    handleImport
  };
};
