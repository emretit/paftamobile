
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
  PackageCheck
} from "lucide-react";

export const navItems = [
  {
    path: "/dashboard",
    icon: Home,
    label: "Gösterge Paneli",
  },
  {
    category: "CRM",
    icon: Briefcase,
    path: "/crm",
    items: [
      {
        path: "/tasks",
        icon: ListTodo,
        label: "Görevler",
      },
      {
        path: "/proposals",
        icon: FileText,
        label: "Teklifler",
      },
      {
        path: "/opportunities",
        icon: BarChart2,
        label: "Fırsatlar",
      },
    ],
  },
  {
    path: "/orders/list",
    icon: ShoppingCart,
    label: "Siparişler",
  },
  {
    path: "/orders/purchase",
    icon: PackageCheck,
    label: "Satın Alma",
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
    icon: ShoppingCart,
    label: "Ürünler",
  },
  {
    path: "/employees",
    icon: Users,
    label: "Çalışanlar",
  },
  {
    category: "Cashflow",
    icon: CreditCard,
    path: "/cashflow",
    items: [
      {
        path: "/cashflow",
        icon: BarChart2,
        label: "Genel Bakış",
      },
      {
        path: "/cashflow/monthly-overview",
        icon: BarChart2,
        label: "Aylık Finansal Özet",
      },
      {
        path: "/cashflow/add-transaction",
        icon: FileText,
        label: "İşlem Ekle",
      },
      {
        path: "/cashflow/transactions",
        icon: ListTodo,
        label: "İşlemler",
      },
      {
        path: "/cashflow/categories",
        icon: Settings,
        label: "Kategoriler",
      },
      {
        path: "/cashflow/opex-entry",
        icon: FileText,
        label: "OPEX Girişi",
      },
      {
        path: "/cashflow/opex-matrix",
        icon: BarChart2,
        label: "OPEX Matrix",
      },
    ],
  },
  {
    path: "/service",
    icon: Wrench,
    label: "Servis",
  },
];

export const settingsItem = {
  path: "/settings",
  icon: Settings,
  label: "Ayarlar",
};
