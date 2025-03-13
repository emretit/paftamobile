
import * as XLSX from 'xlsx';
import { Customer } from '@/types/customer';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

// Check if customer exists based on unique identifiers (name, email, tax_number)
const checkCustomerExists = async (customer: Partial<Customer>): Promise<boolean> => {
  // Create filters for checking duplicates
  const filters = [];
  
  // Always check by name (required field)
  filters.push(`name.ilike.${encodeURIComponent(customer.name || '')}`);
  
  // Check by email if available
  if (customer.email) {
    filters.push(`email.eq.${encodeURIComponent(customer.email)}`);
  }
  
  // Check by tax_number if available (especially for corporate customers)
  if (customer.tax_number) {
    filters.push(`tax_number.eq.${encodeURIComponent(customer.tax_number)}`);
  }

  if (filters.length === 0) return false;
  
  // Build OR query string
  const filterString = filters.join(',');
  
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .or(filterString);
      
    if (error) {
      console.error('Error checking existing customer:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (err) {
    console.error('Exception checking customer exists:', err);
    return false;
  }
};

// Import customers from Excel
export const importCustomersFromExcel = async (file: File): Promise<Customer[]> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
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
          console.log(`Excel'den okunan toplam kayıt sayısı: ${jsonData.length}`);
          
          // Map the data to Customer type and check for duplicates
          const customersToImport: Customer[] = [];
          const duplicates: number = 0;
          
          for (let index = 0; index < jsonData.length; index++) {
            const row = jsonData[index] as any;
            
            // Log problematic rows to help debug
            if (!row.name || typeof row.name !== 'string') {
              console.warn(`Uyarı - Satır ${index + 2}: Geçersiz isim değeri:`, row.name);
              continue; // Skip invalid rows
            }
            
            const customer = {
              name: row.name || `Müşteri ${index + 1}`, // Provide a default value if name is missing
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
            };
            
            // Check if customer already exists
            const exists = await checkCustomerExists(customer);
            
            if (!exists) {
              customersToImport.push(customer as Customer);
            }
          }
          
          console.log(`İşlenen ve benzersiz müşteri sayısı: ${customersToImport.length}`);
          console.log(`Mevcut sistemde bulunan müşteri sayısı: ${jsonData.length - customersToImport.length}`);
          
          toast.success(`${customersToImport.length} yeni müşteri bulundu ve içe aktarılmaya hazır`);
          resolve(customersToImport);
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
