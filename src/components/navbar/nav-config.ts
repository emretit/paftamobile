
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
  Zap
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
        path: "/purchase/requests",
        icon: FileText,
        label: "Satın Alma Talepleri",
      },
      {
        path: "/orders/purchase",
        icon: PackageCheck,
        label: "Satın Alma Siparişleri",
      },
      {
        path: "/purchase-invoices",
        icon: Receipt,
        label: "Alış Faturaları",
      },
    ],
  },
  {
    category: "İletişim",
    icon: Users,
    path: "/contacts",
    items: [
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
    ],
  },
  {
    category: "Ürün & Stok",
    icon: Package,
    path: "/products",
    items: [
      {
        path: "/products",
        icon: Package,
        label: "Ürünler",
      },
    ],
  },
  {
    category: "İnsan Kaynakları",
    icon: UserCheck,
    path: "/employees",
    items: [
      {
        path: "/employees",
        icon: Users,
        label: "Çalışanlar",
      },
    ],
  },
  {
    category: "Finans",
    icon: Calculator,
    path: "/finance",
    items: [
      {
        path: "/cashflow",
        icon: CreditCard,
        label: "Nakit Akış",
      },
      {
        path: "/sales-invoices",
        icon: Receipt,
        label: "Satış Faturaları",
      },
    ],
  },
  {
    category: "Servis",
    icon: Wrench,
    path: "/service",
    items: [
      {
        path: "/service",
        icon: Wrench,
        label: "Servis Talepleri",
      },
    ],
  },
  {
    category: "Entegrasyonlar",
    icon: Zap,
    path: "/integrations",
    items: [
      {
        path: "/e-invoice",
        icon: FileText,
        label: "E-Fatura Yönetimi",
      },
    ],
  },
];

export const settingsItem = {
  path: "/settings",
  icon: Settings,
  label: "Ayarlar",
};
