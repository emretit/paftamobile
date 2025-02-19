
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
  Settings
} from "lucide-react";

export const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Gösterge Paneli" },
  { path: "/contacts", icon: Users, label: "Müşteriler" },
  { path: "/suppliers", icon: Truck, label: "Tedarikçiler" },
  { path: "/deals", icon: PieChart, label: "Fırsatlar" },
  { path: "/proposals", icon: FileText, label: "Teklifler" },
  { path: "/products", icon: Package, label: "Ürünler & Hizmetler" },
  { path: "/employees", icon: HardHat, label: "Çalışanlar" },
  { path: "/finance", icon: Wallet, label: "Finans" },
  { path: "/service", icon: Wrench, label: "Servis" },
  { path: "/purchase-invoices", icon: FileDown, label: "Alış Faturaları" },
  { path: "/sales-invoices", icon: FileUp, label: "Satış Faturaları" }
];

export const settingsItem = {
  path: "/settings",
  icon: Settings,
  label: "Ayarlar & Yönetim"
};
