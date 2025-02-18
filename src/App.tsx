
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Contacts from "./pages/Contacts";
import ContactDetails from "./pages/ContactDetails";
import CustomerForm from "./pages/CustomerForm";
import Deals from "./pages/Deals";
import Suppliers from "./pages/Suppliers";
import SupplierDetails from "./pages/SupplierDetails";
import SupplierForm from "./pages/SupplierForm";
import Employees from "./pages/Employees";
import Finance from "./pages/Finance";
import Service from "./pages/Service";
import PurchaseInvoices from "./pages/PurchaseInvoices";
import SalesInvoices from "./pages/SalesInvoices";
import Proposals from "./pages/Proposals";

const queryClient = new QueryClient();

const App = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/contacts" element={<Contacts isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/contacts/new" element={<CustomerForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/contacts/:id" element={<ContactDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/contacts/:id/edit" element={<CustomerForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/suppliers" element={<Suppliers isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/suppliers/new" element={<SupplierForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/suppliers/:id" element={<SupplierDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/suppliers/:id/edit" element={<SupplierForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/deals" element={<Deals isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/proposals" element={<Proposals isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/employees" element={<Employees isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/finance" element={<Finance isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/service" element={<Service isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/purchase-invoices" element={<PurchaseInvoices isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
            <Route path="/sales-invoices" element={<SalesInvoices isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
