
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
  Package,
  Banknote,
  Receipt,
  Building,
  UserCheck,
  Calculator,
  Zap,
  Zap as ZapIcon
} from "lucide-react";

export const navItems = [
  {
    path: "/dashboard",
    icon: Home,
    label: "Gösterge Paneli",
  },
  {
    category: "Satış Yönetimi",
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
    ],
  },
  {
    category: "Satın Alma",
    icon: PackageCheck,
    path: "/purchase",
    items: [
      {
        path: "/purchase/requests",
        icon: FileText,
        label: "Talep Oluştur",
      },
      {
        path: "/orders/purchase",
        icon: PackageCheck,
        label: "Siparişler",
      },
    ],
  },
  {
    category: "Fatura Yönetimi",
    icon: Receipt,
    path: "/invoices",
    items: [
      {
        path: "/sales-invoices",
        icon: Receipt,
        label: "Satış Faturaları",
      },
      {
        path: "/purchase-invoices",
        icon: Receipt,
        label: "Alış Faturaları",
      },
      {
        path: "/purchase/e-invoice",
        icon: FileText,
        label: "E-Fatura",
      },
      {
        path: "/veriban",
        icon: ZapIcon,
        label: "Veriban E-Fatura",
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
    category: "Görevler & Servis",
    icon: Wrench,
    path: "/tasks",
    items: [
      {
        path: "/tasks",
        icon: ListTodo,
        label: "Görevler",
      },
      {
        path: "/service",
        icon: Wrench,
        label: "Servis Talepleri",
      },
    ],
  },
];

export const settingsItem = {
  path: "/settings",
  icon: Settings,
  label: "Ayarlar",
};
