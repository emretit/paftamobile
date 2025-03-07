
import { PurchaseRequestStatus, PurchaseOrderStatus, InvoiceStatus } from "@/types/purchase";

export const requestStatusStyles: Record<PurchaseRequestStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-800" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  approved: { bg: "bg-green-100", text: "text-green-800" },
  rejected: { bg: "bg-red-100", text: "text-red-800" },
  converted: { bg: "bg-blue-100", text: "text-blue-800" }
};

export const requestStatusLabels: Record<PurchaseRequestStatus, string> = {
  draft: 'Taslak',
  pending: 'Onay Bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  converted: 'Siparişe Dönüştürüldü'
};

export const orderStatusStyles: Record<PurchaseOrderStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-800" },
  sent: { bg: "bg-blue-100", text: "text-blue-800" },
  confirmed: { bg: "bg-indigo-100", text: "text-indigo-800" },
  partially_received: { bg: "bg-amber-100", text: "text-amber-800" },
  received: { bg: "bg-green-100", text: "text-green-800" },
  cancelled: { bg: "bg-red-100", text: "text-red-800" }
};

export const orderStatusLabels: Record<PurchaseOrderStatus, string> = {
  draft: 'Taslak',
  sent: 'Gönderildi',
  confirmed: 'Onaylandı',
  partially_received: 'Kısmen Alındı',
  received: 'Teslim Alındı',
  cancelled: 'İptal Edildi'
};

export const invoiceStatusStyles: Record<InvoiceStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  partially_paid: { bg: "bg-amber-100", text: "text-amber-800" },
  paid: { bg: "bg-green-100", text: "text-green-800" },
  overdue: { bg: "bg-red-100", text: "text-red-800" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-800" }
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  pending: 'Ödeme Bekliyor',
  partially_paid: 'Kısmen Ödendi',
  paid: 'Ödendi',
  overdue: 'Gecikmiş',
  cancelled: 'İptal Edildi'
};

export const formatMoney = (amount: number, currency: string = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};
