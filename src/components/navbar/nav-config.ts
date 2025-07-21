
import {
  Building2,
  Briefcase,
  CreditCard,
  FileText,
  Home,
  Settings,
  ShoppingCart,
  User,
  Users,
  Wrench,
  BarChart2,
  ListTodo,
  PackageCheck,
  Target,
  Quote,
  Truck,
  RotateCcw,
  TrendingUp,
  Package
} from "lucide-react";

export const navItems = [
  {
    path: "/dashboard",
    icon: Home,
    label: "Gösterge Paneli",
  },
  {
    category: "CRM & Satış",
    icon: TrendingUp,
    path: "/crm",
    items: [
      {
        path: "/opportunities",
        icon: Target,
        label: "Fırsatlar",
      },
      {
        path: "/proposals",
        icon: Quote,
        label: "Teklifler",
      },
      {
        path: "/orders/list",
        icon: ShoppingCart,
        label: "Siparişler",
      },
      {
        path: "/deliveries",
        icon: Truck,
        label: "Teslimatlar",
      },
      {
        path: "/returns",
        icon: RotateCcw,
        label: "İadeler",
      },
      {
        path: "/tasks",
        icon: ListTodo,
        label: "Görevler",
      },
    ],
  },
  {
    category: "Satın Alma",
    icon: PackageCheck,
    path: "/purchase",
    items: [
      {
        path: "/orders/purchase",
        icon: PackageCheck,
        label: "Satın Alma Siparişleri",
      },
      {
        path: "/purchase-invoices",
        icon: FileText,
        label: "Alış Faturaları",
      },
    ],
  },
  {
    path: "/contacts",
    icon: User,
    label: "Müşteriler",
  },
  {
    path: "/suppliers",
    icon: Building2,
    label: "Tedarikçiler",
  },
  {
    path: "/products",
    icon: Package,
    label: "Ürünler",
  },
  {
    path: "/employees",
    icon: Users,
    label: "Çalışanlar",
  },
  {
    path: "/cashflow",
    icon: CreditCard,
    label: "Nakit Akış",
  },
  {
    path: "/service",
    icon: Wrench,
    label: "Servis",
  },
  {
    path: "/e-invoice",
    icon: FileText,
    label: "E-Fatura Yönetimi",
  },
  {
    path: "/sales-invoices",
    icon: FileText,
    label: "Satış Faturaları",
  },
];

export const settingsItem = {
  path: "/settings",
  icon: Settings,
  label: "Ayarlar",
};
