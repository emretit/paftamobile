
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
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
import Employees from "@/pages/Employees";
import AddEmployee from "@/pages/AddEmployee";
import EmployeeDetails from "@/pages/EmployeeDetails";
import EmployeeForm from "@/pages/EmployeeForm";
import PurchaseManagement from "@/pages/PurchaseManagement";
import Proposals from "@/pages/Proposals";
import ProposalCreate from "@/pages/ProposalCreate";
import ProposalDetail from "@/pages/ProposalDetail";
import ProposalEdit from "@/pages/ProposalEdit";
import Tasks from "@/pages/Tasks";
import Opportunities from "@/pages/crm/Opportunities";
import CrmDashboard from "@/pages/crm/CrmDashboard";
import Orders from "@/pages/Orders";
import OrdersList from "@/pages/OrdersList";

// Interface for route configuration
interface RouteConfig {
  path: string;
  component: any; // Using any for component type to avoid excessive prop passing
  protected: boolean;
}

// Define all application routes
export const appRoutes: RouteConfig[] = [
  { path: "/", component: Index, protected: false },
  { path: "/auth", component: Auth, protected: false },
  { path: "/dashboard", component: Dashboard, protected: true },
  { path: "/products", component: Products, protected: true },
  { path: "/product-form", component: ProductForm, protected: true },
  { path: "/product-form/:id", component: ProductForm, protected: true },
  { path: "/product-details/:id", component: ProductDetails, protected: true },
  { path: "/contacts", component: Contacts, protected: true },
  { path: "/contacts/new", component: CustomerForm, protected: true },
  { path: "/contacts/:id", component: ContactDetails, protected: true },
  { path: "/contacts/:id/edit", component: CustomerEdit, protected: true },
  { path: "/suppliers", component: Suppliers, protected: true },
  { path: "/supplier/:id", component: SupplierDetails, protected: true },
  { path: "/supplier-form", component: SupplierForm, protected: true },
  { path: "/supplier-form/:id", component: SupplierForm, protected: true },
  { path: "/employees", component: Employees, protected: true },
  { path: "/add-employee", component: AddEmployee, protected: true },
  { path: "/employees/:id", component: EmployeeDetails, protected: true },
  { path: "/employee-form/:id", component: EmployeeForm, protected: true },
  { path: "/finance", component: Finance, protected: true },
  { path: "/service", component: Service, protected: true },
  { path: "/settings", component: Settings, protected: true },
  { path: "/purchase-invoices", component: PurchaseInvoices, protected: true },
  { path: "/sales-invoices", component: SalesInvoices, protected: true },
  { path: "/purchase-management", component: PurchaseManagement, protected: true },
  { path: "/proposals", component: Proposals, protected: true },
  { path: "/proposal/create", component: ProposalCreate, protected: true },
  { path: "/proposal/:id", component: ProposalDetail, protected: true },
  { path: "/proposal/edit/:id", component: ProposalEdit, protected: true },
  { path: "/tasks", component: Tasks, protected: true },
  { path: "/opportunities", component: Opportunities, protected: true },
  { path: "/crm", component: CrmDashboard, protected: true },
  { path: "/orders/list", component: OrdersList, protected: true },
  { path: "/orders/purchase", component: Orders, protected: true },
];
