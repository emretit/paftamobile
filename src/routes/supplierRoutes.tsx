
import Suppliers from "@/pages/Suppliers";
import SupplierDetails from "@/pages/SupplierDetails";
import SupplierForm from "@/pages/SupplierForm";
import { RouteConfig } from "./types";

// Define supplier routes
export const supplierRoutes: RouteConfig[] = [
  { path: "/suppliers", component: Suppliers, protected: true },
  { path: "/supplier/:id", component: SupplierDetails, protected: true },
  { path: "/supplier-form", component: SupplierForm, protected: true },
  { path: "/supplier-form/:id", component: SupplierForm, protected: true },
];
