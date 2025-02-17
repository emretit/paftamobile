
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Deal } from "@/types/deal";
import { FilterState } from "./types";

export const formatDate = (date: Date | undefined) => {
  if (!date) return "-";
  return format(new Date(date), 'dd.MM.yyyy', { locale: tr });
};

export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};

export const filterDeals = (deals: Deal[], searchTerm: string, filters: FilterState) => {
  return deals.filter(deal => {
    // Arama terimi kontrolü
    const searchMatch = 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.employeeName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    // Durum filtresi
    if (filters.status !== 'all' && deal.status !== filters.status) return false;

    // Müşteri filtresi
    if (filters.customer && !deal.customerName.toLowerCase().includes(filters.customer.toLowerCase())) return false;

    // Satış temsilcisi filtresi
    if (filters.employee && !deal.employeeName.toLowerCase().includes(filters.employee.toLowerCase())) return false;

    // Tarih aralığı kontrolü
    if (filters.dateRange.from && new Date(deal.proposalDate) < filters.dateRange.from) return false;
    if (filters.dateRange.to && new Date(deal.proposalDate) > filters.dateRange.to) return false;

    // Tutar aralığı kontrolü
    const minValue = filters.valueRange.min ? parseFloat(filters.valueRange.min) : 0;
    const maxValue = filters.valueRange.max ? parseFloat(filters.valueRange.max) : Infinity;
    if (deal.value < minValue || deal.value > maxValue) return false;

    return true;
  });
};
