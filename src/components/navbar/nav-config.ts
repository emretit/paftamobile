
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
        label: "Overview",
      },
      {
        path: "/cashflow/add-transaction",
        icon: FileText,
        label: "Add Transaction",
      },
      {
        path: "/cashflow/transactions",
        icon: ListTodo,
        label: "Transactions",
      },
      {
        path: "/cashflow/categories",
        icon: Settings,
        label: "Categories",
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
