
import { 
  LayoutDashboard, 
  Users, 
  PieChart,
  Truck,
  Wallet,
  Wrench,
  FileDown,
  FileUp,
  FileText,
  Package,
  Settings,
  Briefcase,
  ListTodo,
  ShoppingCart,
  UserCircle,
  Lightbulb
} from "lucide-react";

// Define the CRM category items
const crmItems = [
  { path: "/opportunities", icon: Lightbulb, label: "Fırsatlar" },
  { path: "/proposals", icon: FileText, label: "Teklifler" },
  { path: "/tasks", icon: ListTodo, label: "Görevler" }
];

export const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Gösterge Paneli" },
  {
    category: "CRM",
    icon: Briefcase,
    items: crmItems,
    path: "/crm"
  },
  { path: "/contacts", icon: Users, label: "Müşteriler" },
  { path: "/suppliers", icon: Truck, label: "Tedarikçiler" },
  { path: "/employees", icon: UserCircle, label: "Çalışanlar" },
  { path: "/products", icon: Package, label: "Ürünler & Hizmetler" },
  { path: "/finance", icon: Wallet, label: "Finans" },
  { path: "/purchase-management", icon: ShoppingCart, label: "Satın Alma" },
  { path: "/service", icon: Wrench, label: "Servis" },
  { path: "/purchase-invoices", icon: FileDown, label: "Alış Faturaları" },
  { path: "/sales-invoices", icon: FileUp, label: "Satış Faturaları" }
];

export const settingsItem = {
  path: "/settings",
  icon: Settings,
  label: "Ayarlar & Yönetim"
};
