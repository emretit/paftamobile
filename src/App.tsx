
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthGuard from './components/AuthGuard';
import { handleApiRequest } from './api/routes';

// Import all page components
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import ProductDetails from './pages/ProductDetails';
import Contacts from './pages/Contacts';
import CustomerForm from './pages/CustomerForm';
import ContactDetails from './pages/ContactDetails';
import CustomerEdit from './pages/CustomerEdit';
import Suppliers from './pages/Suppliers';
import SupplierDetails from './pages/SupplierDetails';
import SupplierForm from './pages/SupplierForm';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import EmployeeDetails from './pages/EmployeeDetails';
import EmployeeForm from './pages/EmployeeForm';
import Finance from './pages/Finance';
import Service from './pages/Service';
import Settings from './pages/Settings';
import PurchaseInvoices from './pages/PurchaseInvoices';
import SalesInvoices from './pages/SalesInvoices';
import PurchaseManagement from './pages/PurchaseManagement';
import Proposals from './pages/Proposals';
import ProposalCreate from './pages/ProposalCreate';
import ProposalDetail from './pages/ProposalDetail';
import ProposalEdit from './pages/ProposalEdit';
import Tasks from './pages/Tasks';
import Opportunities from './pages/Opportunities';
import CrmDashboard from './pages/CrmDashboard';

const originalFetch = window.fetch;
window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
  const url = input.toString();
  
  if (url.startsWith('/api/')) {
    return handleApiRequest(url);
  }
  
  return originalFetch(input, init);
};

const queryClient = new QueryClient();

function App() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const PublicRoute = ({ children }: { children: React.ReactNode }) => children;
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
    <AuthGuard>{children}</AuthGuard>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/products"
            element={<ProtectedRoute><Products isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/product-form"
            element={<ProtectedRoute><ProductForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/product-form/:id"
            element={<ProtectedRoute><ProductForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/product-details/:id"
            element={<ProtectedRoute><ProductDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/contacts"
            element={<ProtectedRoute><Contacts isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/contacts/new"
            element={<ProtectedRoute><CustomerForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/contacts/:id"
            element={<ProtectedRoute><ContactDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/contacts/:id/edit"
            element={<ProtectedRoute><CustomerEdit isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/suppliers"
            element={<ProtectedRoute><Suppliers isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/supplier/:id"
            element={<ProtectedRoute><SupplierDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/supplier-form"
            element={<ProtectedRoute><SupplierForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/supplier-form/:id"
            element={<ProtectedRoute><SupplierForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          
          <Route
            path="/employees"
            element={<ProtectedRoute><Employees isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/add-employee"
            element={<ProtectedRoute><AddEmployee isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/employees/:id"
            element={<ProtectedRoute><EmployeeDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/employee-form/:id"
            element={<ProtectedRoute><EmployeeForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          
          <Route
            path="/finance"
            element={<ProtectedRoute><Finance isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/service"
            element={<ProtectedRoute><Service isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/settings"
            element={<ProtectedRoute><Settings isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/purchase-invoices"
            element={<ProtectedRoute><PurchaseInvoices isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/sales-invoices"
            element={<ProtectedRoute><SalesInvoices isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/purchase-management"
            element={<ProtectedRoute><PurchaseManagement isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/proposals"
            element={<ProtectedRoute><Proposals isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/proposal/create"
            element={<ProtectedRoute><ProposalCreate isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/proposal/:id"
            element={<ProtectedRoute><ProposalDetail isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/proposal/edit/:id"
            element={<ProtectedRoute><ProposalEdit isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/tasks"
            element={<ProtectedRoute><Tasks isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/opportunities"
            element={<ProtectedRoute><Opportunities isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
          <Route
            path="/crm"
            element={<ProtectedRoute><CrmDashboard isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></ProtectedRoute>}
          />
        </Routes>
      </Router>
      
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
