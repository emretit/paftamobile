
import { ProposalStatus } from "@/types/proposal";

export const statusStyles: Record<ProposalStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-800" },
  sent: { bg: "bg-blue-100", text: "text-blue-800" },
  new: { bg: "bg-purple-100", text: "text-purple-800" },
  review: { bg: "bg-indigo-100", text: "text-indigo-800" },
  negotiation: { bg: "bg-orange-100", text: "text-orange-800" },
  approved: { bg: "bg-green-100", text: "text-green-800" },
  accepted: { bg: "bg-emerald-100", text: "text-emerald-800" },
  rejected: { bg: "bg-red-100", text: "text-red-800" },
  expired: { bg: "bg-yellow-100", text: "text-yellow-800" },
  discovery_scheduled: { bg: "bg-blue-100", text: "text-blue-800" },
  meeting_completed: { bg: "bg-indigo-100", text: "text-indigo-800" },
  quote_in_progress: { bg: "bg-violet-100", text: "text-violet-800" },
  quote_sent: { bg: "bg-yellow-100", text: "text-yellow-800" },
  converted_to_order: { bg: "bg-green-100", text: "text-green-800" }
};

export const statusLabels: Record<ProposalStatus, string> = {
  draft: 'Taslak',
  sent: 'Gönderildi',
  new: 'Yeni',
  review: 'İncelemede',
  negotiation: 'Müzakerede',
  approved: 'Onaylandı',
  accepted: 'Kabul Edildi',
  rejected: 'Reddedildi',
  expired: 'Süresi Doldu',
  discovery_scheduled: 'Planlandı',
  meeting_completed: 'Keşif Tamamlandı',
  quote_in_progress: 'Hazırlanıyor',
  quote_sent: 'Gönderildi',
  converted_to_order: 'Sipariş Oldu'
};

// Define the status workflow stages with simplified terms
export const workflowSteps: { status: ProposalStatus; label: string }[] = [
  { status: 'discovery_scheduled', label: 'Planlandı' },
  { status: 'meeting_completed', label: 'Keşif Tamamlandı' },
  { status: 'quote_in_progress', label: 'Hazırlanıyor' },
  { status: 'sent', label: 'Gönderildi' },
  { status: 'negotiation', label: 'Müzakerede' }
];

// Define the final stages with simplified terms
export const finalStages: { status: ProposalStatus; label: string; description: string }[] = [
  { status: 'approved', label: 'Onaylandı', description: 'Müşteri teklifi kabul etti' },
  { status: 'rejected', label: 'Reddedildi', description: 'Müşteri teklifi kabul etmedi' },
  { status: 'converted_to_order', label: 'Sipariş Oldu', description: 'Sipariş oluşturuldu' }
];
