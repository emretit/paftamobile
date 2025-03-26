
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import Proposals from "./pages/Proposals";
import ProposalDetail from "./pages/ProposalDetail";
import ProposalCreate from "./pages/ProposalCreate";
import ProposalEdit from "./pages/ProposalEdit";
import PurchaseManagement from "./pages/PurchaseManagement";
import OrderManagement from "./pages/OrderManagement";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Dashboard
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        }
      />
      <Route
        path="/customers"
        element={
          <Customers
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        }
      />
      <Route
        path="/customers/:id"
        element={
          <CustomerDetail
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        }
      />
      <Route
        path="/products"
        element={
          <Products
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        }
      />
      <Route
        path="/proposals"
        element={
          <Proposals
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        }
      />
      <Route
        path="/proposals/new"
        element={
          <ProposalCreate
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        }
      />
      <Route
        path="/proposals/:id"
        element={
          <ProposalDetail
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        }
      />
      <Route
        path="/proposals/:id/edit"
        element={
          <ProposalEdit
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        }
      />
      <Route
        path="/purchases/*"
        element={
          <PurchaseManagement
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        }
      />
      <Route
        path="/orders"
        element={
          <OrderManagement
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        }
      />
      <Route
        path="/orders/new"
        element={
          <OrderManagement
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
