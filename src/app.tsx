import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PlaceholderPage from "./pages/PlaceholderPage";
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
import Opportunities from "@/pages/Opportunities";
import DealsTable from "@/pages/DealsTable";
import Finance from "@/pages/Finance";
import Service from "@/pages/Service";
import Settings from "@/pages/Settings";
import PurchaseInvoices from "@/pages/PurchaseInvoices";
import SalesInvoices from "@/pages/SalesInvoices";
import Auth from "@/pages/Auth";
import Tasks from "@/pages/Tasks";
import CrmDashboard from "@/pages/CrmDashboard";
import PurchaseManagement from "@/pages/PurchaseManagement";
import AuthGuard from "@/components/AuthGuard";
import Employees from "@/pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import EmployeeDetails from "./pages/EmployeeDetails";
import EmployeeForm from "./pages/EmployeeForm";
import AddProposal from "./pages/AddProposal";
import Dashboard from "./pages/Dashboard";
import ProposalDetails from "./pages/ProposalDetails";

const queryClient = new QueryClient();

const App = () => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={<AuthGuard><Dashboard isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/products"
          element={<AuthGuard><Products isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/product-form"
          element={<AuthGuard><ProductForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/product-form/:id"
          element={<AuthGuard><ProductForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/product-details/:id"
          element={<AuthGuard><ProductDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/contacts"
          element={<AuthGuard><Contacts isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/contacts/new"
          element={<AuthGuard><CustomerForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/contacts/:id"
          element={<AuthGuard><ContactDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/contacts/:id/edit"
          element={<AuthGuard><CustomerEdit isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/suppliers"
          element={<AuthGuard><Suppliers isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/supplier/:id"
          element={<AuthGuard><SupplierDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/supplier-form"
          element={<AuthGuard><SupplierForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/supplier-form/:id"
          element={<AuthGuard><SupplierForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        
        <Route
          path="/employees"
          element={<AuthGuard><Employees isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/add-employee"
          element={<AuthGuard><AddEmployee isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
         <Route
            path="/employees/:id"
            element={<AuthGuard><EmployeeDetails isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
          />
          <Route
            path="/employee-form/:id"
            element={<AuthGuard><EmployeeForm isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
          />
        
        <Route
          path="/finance"
          element={<AuthGuard><Finance isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/service"
          element={<AuthGuard><Service isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/settings"
          element={<AuthGuard><Settings isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/purchase-invoices"
          element={<AuthGuard><PurchaseInvoices isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/sales-invoices"
          element={<AuthGuard><SalesInvoices isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/tasks"
          element={<AuthGuard><Tasks isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        <Route
          path="/purchase-management"
          element={<AuthGuard><PurchaseManagement isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /></AuthGuard>}
        />
        
        {/* Replace CRM related routes with placeholder */}
        <Route
          path="/deals"
          element={<PlaceholderPage isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}
        />
        <Route
          path="/deals-table"
          element={<PlaceholderPage isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}
        />
        <Route
          path="/proposals"
          element={<PlaceholderPage isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}
        />
        <Route
          path="/opportunities"
          element={<PlaceholderPage isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}
        />
        <Route
          path="/crm-dashboard"
          element={<PlaceholderPage isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}
        />
        <Route
          path="/proposals/new"
          element={<PlaceholderPage isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}
        />
         <Route
          path="/proposals/:id"
          element={<PlaceholderPage isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}
        />
         <Route
          path="/proposals/edit/:id"
          element={<PlaceholderPage isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}
        />
         <Route
          path="/proposals/detail/:id"
          element={<PlaceholderPage isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
