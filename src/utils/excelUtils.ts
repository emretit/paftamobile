
import * as XLSX from 'xlsx';
import { Customer } from '@/types/customer';

// Helper function to convert sheet data to an array of objects
export const importExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData as any[]);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Helper function to export data to Excel
export const exportToExcel = (data: any[], filename: string): void => {
  // Parse data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Write and download file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Export customer data
export const exportCustomersToExcel = (customers: Customer[]): void => {
  // Format customer data for export
  const formattedData = customers.map(customer => ({
    'Müşteri Adı': customer.name,
    'Şirket': customer.company || '',
    'E-posta': customer.email || '',
    'Telefon': customer.mobile_phone || '',
    'Ofis Telefonu': customer.office_phone || '',
    'Temsilci': customer.representative || '',
    'Tip': customer.type || '',
    'Durum': customer.status || '',
    'Bakiye': customer.balance || 0,
    'Adres': customer.address || '',
    'Vergi Numarası': customer.tax_number || '',
    'Vergi Dairesi': customer.tax_office || ''
  }));
  
  // Export to Excel
  exportToExcel(formattedData, 'Müşteriler');
};

// Import customer data and return as Customer objects
export const importCustomersFromExcel = async (file: File): Promise<{
  customers: Partial<Customer>[];
  duplicates: number;
  invalidRows: number;
}> => {
  try {
    // Parse Excel data
    const data = await importExcel(file);
    
    // Track stats
    let duplicates = 0;
    let invalidRows = 0;
    
    // Check for existing customers to avoid duplicates
    const { data: existingCustomers } = await fetch('/api/customers').then(res => res.json());
    const existingEmails = new Set(existingCustomers?.map((c: Customer) => c.email?.toLowerCase()) || []);
    const existingNames = new Set(existingCustomers?.map((c: Customer) => c.name?.toLowerCase()) || []);
    
    // Process and validate imported data
    const customers = data
      .filter(row => {
        // Skip rows without required fields
        if (!row.name || !row.type || !row.status) {
          invalidRows++;
          return false;
        }
        
        // Check for duplicates
        const email = row.email?.toLowerCase();
        const name = row.name?.toLowerCase();
        
        if ((email && existingEmails.has(email)) || existingNames.has(name)) {
          duplicates++;
          return false;
        }
        
        return true;
      })
      .map(row => ({
        name: row.name,
        email: row.email,
        mobile_phone: row.mobile_phone,
        office_phone: row.office_phone,
        company: row.company,
        type: row.type,
        status: row.status,
        representative: row.representative,
        balance: row.balance || 0,
        address: row.address,
        tax_number: row.tax_number,
        tax_office: row.tax_office
      }));
    
    return { customers, duplicates, invalidRows };
  } catch (error) {
    console.error('Error importing customers from Excel:', error);
    throw error;
  }
};
