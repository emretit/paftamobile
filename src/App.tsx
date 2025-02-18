
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
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
import SalesInvoices from "@/pages/SalesInvoices";
import PurchaseInvoices from "@/pages/PurchaseInvoices";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/contacts/:id" element={<ContactDetails />} />
        <Route path="/customer-form" element={<CustomerForm />} />
        <Route path="/customer-form/:id" element={<CustomerForm />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/supplier-form" element={<SupplierForm />} />
        <Route path="/supplier-form/:id" element={<SupplierForm />} />
        <Route path="/suppliers/:id" element={<SupplierDetails />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/proposal-form" element={<ProposalForm />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/deals-table" element={<DealsTable />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/service" element={<Service />} />
        <Route path="/sales-invoices" element={<SalesInvoices />} />
        <Route path="/purchase-invoices" element={<PurchaseInvoices />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
