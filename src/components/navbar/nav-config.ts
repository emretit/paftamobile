
import { 
  LayoutDashboard, 
  Users, 
  Truck,
  Wallet,
  Wrench,
  FileDown,
  FileUp,
  Package,
  Settings,
  ShoppingCart,
  UserCircle
} from "lucide-react";

export const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Gösterge Paneli" },
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
