import { VeribanEInvoicePanel } from "../components/veriban/VeribanEInvoicePanel";
import VeribanInvoices from "../pages/VeribanInvoices";

export const veribanRoutes = [
  {
    path: "/veriban",
    component: VeribanEInvoicePanel,
    protected: true,
  },
  {
    path: "/veriban/invoices",
    component: VeribanInvoices,
    protected: true,
  },
];