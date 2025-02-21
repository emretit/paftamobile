
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Contacts from "@/pages/Contacts";
import ContactDetails from "@/pages/ContactDetails";
import CustomerForm from "@/pages/CustomerForm";
import Suppliers from "@/pages/Suppliers";
import SupplierForm from "@/pages/SupplierForm";
import SupplierDetails from "@/pages/SupplierDetails";
import Proposals from "@/pages/Proposals";
import ProposalForm from "@/pages/ProposalForm";
import Deals from "@/pages/Deals";
import DealsTable from "@/pages/DealsTable";
import Employees from "@/pages/Employees";
import Finance from "@/pages/Finance";
import Service from "@/pages/Service";
import Calendar from "@/pages/Calendar";
import SalesInvoices from "@/pages/SalesInvoices";
import PurchaseInvoices from "@/pages/PurchaseInvoices";
import Products from "@/pages/Products";
import ProductForm from "@/pages/ProductForm";
import ProductDetails from "@/pages/ProductDetails";
import Settings from "@/pages/Settings";
import EmployeeFormPage from "./pages/EmployeeForm";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/contacts" element={<Contacts isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/contacts/:id" element={<ContactDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/customer-form" element={<CustomerForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/customer-form/:id" element={<CustomerForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/suppliers" element={<Suppliers isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/supplier-form" element={<SupplierForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/supplier-form/:id" element={<SupplierForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/suppliers/:id" element={<SupplierDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/proposals" element={<Proposals isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/proposal-form" element={<ProposalForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/deals" element={<Deals isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/deals-table" element={<DealsTable isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route
            path="/employees/new"
            element={<EmployeeFormPage isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}
          />
          <Route path="/employees" element={<Employees isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/finance" element={<Finance isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/service" element={<Service isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/calendar" element={<Calendar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/sales-invoices" element={<SalesInvoices isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/purchase-invoices" element={<PurchaseInvoices isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/products" element={<Products isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/product-form" element={<ProductForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/product-form/:id" element={<ProductForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/product-details/:id" element={<ProductDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/settings" element={<Settings isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
