
import { 
  LayoutDashboard, 
  Users, 
  PieChart,
  Truck,
  HardHat,
  Wallet,
  Wrench,
  FileDown,
  FileUp,
  FileText,
  Package,
  Settings,
  Calendar,
  Briefcase,
  ListTodo,
  ShoppingCart
} from "lucide-react";

// Define the CRM category items
const crmItems = [
  { path: "/deals", icon: PieChart, label: "Fırsatlar" },
  { path: "/proposals", icon: FileText, label: "Teklifler" },
  { path: "/tasks", icon: ListTodo, label: "Görevler" }
];

export const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Gösterge Paneli" },
  {
    category: "CRM",
    icon: Briefcase,
    items: crmItems,
    path: "/crm"  // Ana kategori tıklandığında gidilecek path
  },
  { path: "/contacts", icon: Users, label: "Müşteriler" },
  { path: "/suppliers", icon: Truck, label: "Tedarikçiler" },
  { path: "/products", icon: Package, label: "Ürünler & Hizmetler" },
  { path: "/employees", icon: HardHat, label: "Çalışanlar" },
  { path: "/finance", icon: Wallet, label: "Finans" },
  { path: "/purchase-management", icon: ShoppingCart, label: "Satın Alma" },
  { path: "/service", icon: Wrench, label: "Servis" },
  { path: "/calendar", icon: Calendar, label: "Takvim" },
  { path: "/purchase-invoices", icon: FileDown, label: "Alış Faturaları" },
  { path: "/sales-invoices", icon: FileUp, label: "Satış Faturaları" }
];

export const settingsItem = {
  path: "/settings",
  icon: Settings,
  label: "Ayarlar & Yönetim"
};
