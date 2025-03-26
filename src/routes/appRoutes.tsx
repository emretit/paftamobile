
import { RouteConfig } from "./types";
import { publicRoutes } from "./publicRoutes";
import { dashboardRoutes } from "./dashboardRoutes";
import { productRoutes } from "./productRoutes";
import { customerRoutes } from "./customerRoutes";
import { supplierRoutes } from "./supplierRoutes";
import { employeeRoutes } from "./employeeRoutes";
import { financeRoutes } from "./financeRoutes";
import { serviceRoutes } from "./serviceRoutes";
import { orderRoutes } from "./orderRoutes";
import { crmRoutes } from "./crmRoutes";
import { settingsRoutes } from "./settingsRoutes";

// Combine all route groups
export const appRoutes: RouteConfig[] = [
  ...publicRoutes,
  ...dashboardRoutes,
  ...productRoutes,
  ...customerRoutes,
  ...supplierRoutes,
  ...employeeRoutes,
  ...financeRoutes,
  ...serviceRoutes,
  ...orderRoutes,
  ...crmRoutes,
  ...settingsRoutes,
];
