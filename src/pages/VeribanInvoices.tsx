import React from 'react';
import DefaultLayout from '../components/layouts/DefaultLayout';
import VeribanDashboard from '../components/veriban/VeribanDashboard';

const VeribanInvoices: React.FC = () => {
  return (
    <DefaultLayout isCollapsed={false} setIsCollapsed={() => {}} title="Veriban E-Fatura Dashboard">
      <VeribanDashboard />
    </DefaultLayout>
  );
};

export default VeribanInvoices; 