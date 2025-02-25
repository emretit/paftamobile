
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import Products from "@/pages/Products";
import ProductForm from "@/pages/ProductForm";
import ProductDetails from "@/pages/ProductDetails";
import Contacts from "@/pages/Contacts";
import ContactDetails from "@/pages/ContactDetails";
import CustomerForm from "@/pages/CustomerForm";
import CustomerEdit from "@/pages/CustomerEdit";
import Suppliers from "@/pages/Suppliers";
import SupplierDetails from "@/pages/SupplierDetails";
import SupplierForm from "@/pages/SupplierForm";
import Proposals from "@/pages/Proposals";
import ProposalForm from "@/pages/ProposalForm";
import Deals from "@/pages/Deals";
import DealsTable from "@/pages/DealsTable";
import Calendar from "@/pages/Calendar";
import Finance from "@/pages/Finance";
import Service from "@/pages/Service";
import Settings from "@/pages/Settings";
import PurchaseInvoices from "@/pages/PurchaseInvoices";
import SalesInvoices from "@/pages/SalesInvoices";
import Auth from "@/pages/Auth";
import Employees from "@/pages/Employees";
import EmployeeForm from "@/pages/EmployeeForm";
import EmployeeEdit from "@/pages/EmployeeEdit";
import EmployeeDetails from "@/pages/EmployeeDetails";

const queryClient = new QueryClient();

const App = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/products" element={<Products isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/product-form" element={<ProductForm />} />
          <Route path="/product-form/:id" element={<ProductForm />} />
          <Route path="/product-details/:id" element={<ProductDetails />} />
          <Route path="/contacts" element={<Contacts isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/contacts/new" element={<CustomerForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/contacts/:id" element={<ContactDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/contacts/:id/edit" element={<CustomerEdit isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/suppliers" element={<Suppliers isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/supplier/:id" element={<SupplierDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/supplier-form" element={<SupplierForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/supplier-form/:id" element={<SupplierForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/proposals" element={<Proposals isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/proposal-form" element={<ProposalForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/deals" element={<Deals isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/deals-table" element={<DealsTable isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/calendar" element={<Calendar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/finance" element={<Finance isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/service" element={<Service isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/settings" element={<Settings isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/purchase-invoices" element={<PurchaseInvoices isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/sales-invoices" element={<SalesInvoices isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/employees" element={<Employees isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/employee-form" element={<EmployeeForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/employee-form/:id" element={<EmployeeForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/employees/:id" element={<EmployeeDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
          <Route path="/employee/:id/edit" element={<EmployeeEdit isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
