
import * as XLSX from 'xlsx';
import { Customer } from '@/types/customer';
import { toast } from 'sonner';

// Export customers to Excel
export const exportCustomersToExcel = (customers: Customer[]) => {
  try {
    // Prepare data for export - clean up unnecessary fields
    const dataToExport = customers.map(customer => ({
      name: customer.name,
      email: customer.email || '',
      mobile_phone: customer.mobile_phone || '',
      office_phone: customer.office_phone || '',
      company: customer.company || '',
      type: customer.type,
      status: customer.status,
      representative: customer.representative || '',
      balance: customer.balance,
      address: customer.address || '',
      tax_number: customer.tax_number || '',
      tax_office: customer.tax_office || ''
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Müşteriler');
    
    // Generate Excel file and download
    XLSX.writeFile(workbook, 'musteriler.xlsx');
    
    toast.success('Müşteriler Excel dosyası başarıyla indirildi');
  } catch (error) {
    console.error('Excel export error:', error);
    toast.error('Excel dosyası oluşturulurken bir hata oluştu');
  }
};

// Import customers from Excel
export const importCustomersFromExcel = async (file: File): Promise<Customer[]> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          if (!e.target?.result) {
            toast.error('Dosya okunamadı');
            reject(new Error('Dosya okunamadı'));
            return;
          }
          
          // Parse Excel file
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Map the data to Customer type
          const customers = jsonData.map((row: any) => ({
            name: row.name || '',
            email: row.email || null,
            mobile_phone: row.mobile_phone || null,
            office_phone: row.office_phone || null,
            company: row.company || null,
            type: (row.type === 'kurumsal' || row.type === 'bireysel') ? row.type : 'bireysel',
            status: ['aktif', 'pasif', 'potansiyel'].includes(row.status) ? row.status : 'potansiyel',
            representative: row.representative || null,
            balance: Number(row.balance) || 0,
            address: row.address || null,
            tax_number: row.tax_number || null,
            tax_office: row.tax_office || null
          })) as Customer[];
          
          toast.success(`${customers.length} müşteri başarıyla içe aktarıldı`);
          resolve(customers);
        } catch (error) {
          console.error('Excel parse error:', error);
          toast.error('Excel dosyası işlenirken bir hata oluştu');
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('File reading error:', error);
        toast.error('Dosya okunurken bir hata oluştu');
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Excel dosyası işlenirken bir hata oluştu');
      reject(error);
    }
  });
};
