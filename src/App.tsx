
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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
import Finance from "@/pages/Finance";
import Service from "@/pages/Service";
import Settings from "@/pages/Settings";
import PurchaseInvoices from "@/pages/PurchaseInvoices";
import SalesInvoices from "@/pages/SalesInvoices";
import Auth from "@/pages/Auth";
import AuthGuard from "@/components/AuthGuard";
import Employees from "@/pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import EmployeeDetails from "./pages/EmployeeDetails";
import EmployeeForm from "./pages/EmployeeForm";
import Dashboard from "./pages/Dashboard";
import PurchaseManagement from "@/pages/PurchaseManagement";

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
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
