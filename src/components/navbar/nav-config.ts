
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
  FilePlus
} from "lucide-react";

// Define the CRM category items
const crmItems = [
  { path: "/deals", icon: PieChart, label: "Fırsatlar" },
  { path: "/proposals", icon: FileText, label: "Teklifler" },
  { path: "/proposal-create", icon: FilePlus, label: "Yeni Teklif" },  
  { path: "/tasks", icon: ListTodo, label: "Görevler" }
];

// Define the Products & Services category items
const productsItems = [
  { path: "/products", icon: Package, label: "Ürün Listesi" },
  { path: "/product-form", icon: FileText, label: "Yeni Ürün Ekle" },
  { path: "/services", icon: Wrench, label: "Hizmetler" }
];

export const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Gösterge Paneli" },
  {
    category: "CRM",
    icon: Briefcase,
    items: crmItems,
    path: "/crm"
  },
  { path: "/contacts", icon: Users, label: "Müşteriler" },
  { path: "/suppliers", icon: Truck, label: "Tedarikçiler" },
  { path: "/employees", icon: UserCircle, label: "Çalışanlar" },
  {
    category: "Ürünler & Hizmetler",
    icon: Package,
    items: productsItems,
    path: "/products"
  },
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
