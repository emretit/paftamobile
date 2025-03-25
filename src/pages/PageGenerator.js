
/**
 * This is a utility script to generate the remaining placeholder pages.
 * You can run this as a Node.js script in your project folder.
 * 
 * Run with: node PageGenerator.js
 */

const fs = require('fs');
const path = require('path');

const pagesToGenerate = [
  { name: 'ContactDetails', title: 'Müşteri Detayları' },
  { name: 'CustomerEdit', title: 'Müşteri Düzenleme' },
  { name: 'Suppliers', title: 'Tedarikçiler' },
  { name: 'SupplierDetails', title: 'Tedarikçi Detayları' },
  { name: 'SupplierForm', title: 'Tedarikçi Formu' },
  { name: 'Employees', title: 'Çalışanlar' },
  { name: 'AddEmployee', title: 'Çalışan Ekle' },
  { name: 'EmployeeDetails', title: 'Çalışan Detayları' },
  { name: 'EmployeeForm', title: 'Çalışan Formu' },
  { name: 'Finance', title: 'Finans' },
  { name: 'Service', title: 'Servis' },
  { name: 'Settings', title: 'Ayarlar' },
  { name: 'PurchaseInvoices', title: 'Satın Alma Faturaları' },
  { name: 'SalesInvoices', title: 'Satış Faturaları' },
  { name: 'PurchaseManagement', title: 'Satın Alma Yönetimi' },
  { name: 'ProposalDetail', title: 'Teklif Detayları' },
  { name: 'ProposalEdit', title: 'Teklif Düzenleme' },
  { name: 'Tasks', title: 'Görevler' },
  { name: 'Opportunities', title: 'Fırsatlar' },
  { name: 'CrmDashboard', title: 'CRM Panosu' },
];

const template = (name, title) => `import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

interface ${name}Props {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ${name}: React.FC<${name}Props> = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <PlaceholderPage 
      title="${title}" 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed} 
    />
  );
};

export default ${name};
`;

// Ensure the pages directory exists
const pagesDir = path.join(__dirname, '../pages');
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

// Generate each page
pagesToGenerate.forEach(page => {
  const filePath = path.join(pagesDir, `${page.name}.tsx`);
  fs.writeFileSync(filePath, template(page.name, page.title));
  console.log(`Generated ${filePath}`);
});

console.log('All placeholder pages generated successfully!');
