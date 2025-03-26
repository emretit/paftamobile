
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Customer } from '@/types/customer';
import { Proposal } from '@/types/proposal';
import { Product } from '@/types/product';

// Export customers to Excel
export const exportCustomersToExcel = (customers: Customer[], fileName = 'customers.xlsx') => {
  try {
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(customers);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Save file
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
    
    return true;
  } catch (error) {
    console.error('Error exporting customers to Excel:', error);
    return false;
  }
};

// Import customers from Excel
export const importCustomersFromExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        console.error('Error importing Excel file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Export proposals to Excel
export const exportProposalsToExcel = (proposals: Proposal[], fileName = 'proposals.xlsx') => {
  try {
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(proposals);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Proposals');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Save file
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
    
    return true;
  } catch (error) {
    console.error('Error exporting proposals to Excel:', error);
    return false;
  }
};

// Export products to Excel
export const exportProductsToExcel = (products: Product[], fileName = 'products.xlsx') => {
  try {
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(products);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Save file
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
    
    return true;
  } catch (error) {
    console.error('Error exporting products to Excel:', error);
    return false;
  }
};
